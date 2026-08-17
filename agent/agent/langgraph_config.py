import os
import sys
import json
import logging
from typing import Dict, List, Any, Optional, Union, Annotated, TypedDict, Sequence

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.tools import BaseTool
from langgraph.graph import StateGraph, END

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utility.llm_client import LLMClient
from utility.pinecone_client import PineconeClient

from agent.supervisor import create_system_prompt, format_rag_context

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the state schema for our LangGraph
class AgentState(TypedDict):
    """Schema for the state maintained by the LangGraph agent."""
    messages: Annotated[Sequence[Union[HumanMessage, AIMessage, SystemMessage]], "add"]
    system_prompt: str
    user_id: str
    course_id: str
    chapter_id: Optional[str]
    language: str
    learning_profile: Dict[str, str]
    context_chunks: Optional[List[Dict[str, Any]]]
    stream: bool
    stream_handler: Optional[Any]


def retrieve_context(state: AgentState) -> AgentState:
    """
    Node that retrieves relevant context from Pinecone.
    
    Args:
        state: Current agent state
        
    Returns:
        Updated state with retrieved context
    """
    logger.info(f"Retrieving context for course: {state['course_id']}")
    
    try:
        # Extract the user's latest query
        messages = state.get("messages", [])
        latest_query = ""
        for message in reversed(messages):
            if isinstance(message, HumanMessage):
                latest_query = message.content
                break
        
        if not latest_query:
            logger.warning("No query found in messages")
            return {**state, "context_chunks": []}
        
        # --- Dynamically determine index and namespace from course_id ---
        course_id = state.get("course_id")
        if not course_id:
            logger.warning("No course_id found in state, skipping context retrieval.")
            return {**state, "context_chunks": []}
            
        # Specific mapping based on setup script for CS101
        if course_id.upper() == "CS101":
            target_index_name = "cs100-rag"
            target_namespace = "cs101-namespace"
        else:
            # Default convention for other courses (or handle error if only CS101 is supported)
            # logger.warning(f"Course ID '{course_id}' not explicitly mapped. Using default convention.")
            # target_index_name = f"{course_id.lower()}-rag"
            # target_namespace = f"{course_id.lower()}-namespace"
            # For now, let's only support the known configured course to avoid errors
            logger.error(f"Pinecone index/namespace mapping not configured for course_id: {course_id}")
            return {**state, "context_chunks": []} # Return empty context if course not supported
        
        logger.info(f"Targeting Pinecone index: '{target_index_name}', namespace: '{target_namespace}' for course_id: {course_id}")
        # --- End dynamic determination ---

        # Initialize Pinecone client with the correct index name
        pinecone_client = PineconeClient(index_name=target_index_name)
        
        # Query Pinecone for relevant chunks using the target namespace
        context_chunks = pinecone_client.query_by_text(
            text_query=latest_query,
            top_k=5,
            namespace=target_namespace # Use the dynamically determined namespace
        )
        
        logger.info(f"Retrieved {len(context_chunks)} context chunks from Pinecone")
        
        # Return updated state with context chunks
        return {**state, "context_chunks": context_chunks}
    
    except Exception as e:
        logger.error(f"Error retrieving context: {str(e)}")
        # Return empty context to continue the conversation despite retrieval failure
        return {**state, "context_chunks": []}


def prepare_messages(state: AgentState) -> AgentState:
    """
    Node that prepares the messages for the LLM, including system prompt with context.
    
    Args:
        state: Current agent state
        
    Returns:
        Updated state with prepared messages
    """
    logger.info("Preparing messages with context and learning profile")
    
    # Format retrieved context
    context_chunks = state.get("context_chunks", [])
    rag_context = format_rag_context(context_chunks)
    
    # Create system prompt with context and learning profile
    system_prompt = create_system_prompt(
        course_id=state["course_id"],
        rag_context=rag_context,
        learning_profile=state["learning_profile"],
        language=state["language"]
    )
    
    # Prepare messages with system prompt
    messages = state.get("messages", [])
    prepared_messages = [
        SystemMessage(content=system_prompt)
    ]
    
    # Add user messages and AI responses
    for message in messages:
        prepared_messages.append(message)
    
    # Save system prompt in state for reference
    return {**state, "messages": prepared_messages, "system_prompt": system_prompt}


def call_llm(state: AgentState) -> AgentState:
    """
    Node that calls the LLM with the prepared messages.
    
    Args:
        state: Current agent state
        
    Returns:
        Updated state with LLM response
    """
    logger.info("Calling LLM to generate response")
    
    try:
        # Create LLM client
        llm_client = LLMClient()
        
        # Set API key (in production, this would be securely loaded)
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment")
        
        llm_client.set_api_key(api_key)
        
        # Prepare messages for LLM format
        messages = state.get("messages", [])
        formatted_messages = []
        
        for message in messages:
            if isinstance(message, SystemMessage):
                formatted_messages.append({
                    "role": "system",
                    "content": message.content
                })
            elif isinstance(message, HumanMessage):
                formatted_messages.append({
                    "role": "user",
                    "content": message.content
                })
            elif isinstance(message, AIMessage):
                formatted_messages.append({
                    "role": "assistant",
                    "content": message.content
                })
        
        # Call LLM client with streaming if enabled
        if state.get("stream", False):
            logger.info("Streaming mode enabled for LLM call")
            stream = llm_client.generate_response(
                messages=formatted_messages,
                stream=True,
                enable_reasoning=True,
                stream_reasoning=True,
                temperature=0.7,
                max_tokens=1500
            )
            
            # If stream handler is set, pass the stream to it
            stream_handler = state.get("stream_handler")
            if stream_handler:
                stream_handler(stream)
                
                # Return state without adding message since it's being streamed
                return state
            else:
                # No stream handler, collect the response and add as message
                response_text = ""
                for chunk in stream:
                    if "choices" in chunk and len(chunk["choices"]) > 0:
                        delta = chunk["choices"][0].get("delta", {})
                        if "content" in delta:
                            response_text += delta["content"] or ""
                
                # Add response as AIMessage
                response_message = AIMessage(content=response_text)
                
                return {**state, "messages": state["messages"] + [response_message]}
        else:
            # Non-streaming mode
            logger.info("Calling LLM in non-streaming mode")
            response = llm_client.generate_response(
                messages=formatted_messages,
                stream=False,
                temperature=0.7,
                max_tokens=1500
            )
            
            # Extract content from response
            content = llm_client.extract_content(response)["content"] or ""
            
            # Add response as AIMessage
            response_message = AIMessage(content=content)
            
            return {**state, "messages": state["messages"] + [response_message]}
    
    except Exception as e:
        logger.error(f"Error calling LLM: {str(e)}")
        error_message = AIMessage(content=f"I'm sorry, I encountered an error: {str(e)}")
        return {**state, "messages": state["messages"] + [error_message]}


def create_agent_graph() -> StateGraph:
    """
    Create the LangGraph for the agent with nodes and edges.
    
    Returns:
        Compiled LangGraph
    """
    # Create the state graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("retrieve_context", retrieve_context)
    workflow.add_node("prepare_messages", prepare_messages)
    workflow.add_node("call_llm", call_llm)
    
    # Add edges
    workflow.add_edge("retrieve_context", "prepare_messages")
    workflow.add_edge("prepare_messages", "call_llm")
    workflow.add_edge("call_llm", END)
    
    # Set the entry point
    workflow.set_entry_point("retrieve_context")
    
    # Compile the graph
    return workflow.compile()