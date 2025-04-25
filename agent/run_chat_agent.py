import os
import sys
import logging
import json
from typing import Dict, List, Any, Optional, Callable, Iterator, AsyncIterator, Union

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utility.llm_client import LLMClient
from utility.pinecone_client import PineconeClient

from agent.langgraph_config import create_agent_graph, AgentState
from agent.supervisor import StreamingSupervisor
from agent.tools.image_gen import img_gen_tool
from agent.tools.mermaid_gen import mermaid_gen_tool
# from agent.tools.quiz_gen import quiz_gen_tool # Removed import for deleted tool

from langchain_core.messages import HumanMessage

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_streaming_supervisor() -> StreamingSupervisor:
    """
    Initialize the streaming supervisor with available tools.
    
    Returns:
        Configured StreamingSupervisor instance
    """
    # Define tools dictionary with tool names mapping to functions
    tools = {
        "img_gen": img_gen_tool,
        "mermaid_gen": mermaid_gen_tool,
        # "quiz_gen": quiz_gen_tool # Removed
    }
    
    return StreamingSupervisor(tools)

def run_chat_agent(
    user_id: str,
    course_id: str,
    prompt: str,
    learning_profile: Dict[str, str],
    language: str = "english",
    chapter_id: Optional[str] = None,
    stream: bool = True,
    stream_callback: Optional[Callable[[Dict[str, Any]], None]] = None
) -> Union[str, Dict[str, Any]]:
    """
    Run the chat agent to generate a response to the user's prompt.
    
    Args:
        user_id: ID of the user
        course_id: ID of the course
        prompt: User's prompt
        learning_profile: User's learning profile
        language: Language for the response ("english" or "urdu")
        chapter_id: Optional chapter ID (for chapter-specific chats)
        stream: Whether to stream the response
        stream_callback: Optional callback function for streaming
        
    Returns:
        Either a string response or a dict with streaming info
    """
    logger.info(f"Running chat agent for user {user_id}, course {course_id}")
    
    try:
        # Initialize the LangGraph agent
        agent_graph = create_agent_graph()
        
        # Initialize streaming supervisor for tool processing
        supervisor = init_streaming_supervisor()
        
        # Define initial state for the agent
        initial_state: Dict[str, Any] = {
            "messages": [HumanMessage(content=prompt)],
            "system_prompt": "",
            "user_id": user_id,
            "course_id": course_id,
            "chapter_id": chapter_id,
            "language": language,
            "learning_profile": learning_profile,
            "context_chunks": None,
            "stream": stream,
            "stream_handler": None
        }
        
        # If streaming is enabled and a callback is provided
        if stream and stream_callback:
            # Create a wrapper function to handle the LLM stream
            def handle_stream(llm_stream: Iterator[Dict[str, Any]]) -> None:
                # Process the stream with the supervisor
                processed_stream = supervisor.process_stream(llm_stream)
                
                # Pass each chunk to the stream callback
                for chunk in processed_stream:
                    stream_callback(chunk)
            
            # Set the stream handler in the state
            initial_state["stream_handler"] = handle_stream
            
            # Run the agent graph
            agent_graph.invoke(initial_state)
            
            # Return a dictionary indicating streaming was used
            return {
                "status": "streaming",
                "message": "Response was streamed to callback"
            }
        else:
            # Run the agent in non-streaming mode
            initial_state["stream"] = False
            result = agent_graph.invoke(initial_state)
            
            # Extract the final AI message
            messages = result.get("messages", [])
            response_text = ""
            
            # Get the last AI message
            for message in reversed(messages):
                if hasattr(message, "content") and message.__class__.__name__ == "AIMessage":
                    response_text = message.content
                    break
            
            # Save the chat session
            supervisor.save_chat_session(
                user_id=user_id,
                course_id=course_id,
                prompt=prompt,
                response=response_text,
                chapter_id=chapter_id
            )
            
            return response_text
            
    except Exception as e:
        logger.error(f"Error running chat agent: {str(e)}")
        return f"Error: {str(e)}"

async def run_chat_agent_async(
    user_id: str,
    course_id: str,
    prompt: str,
    learning_profile: Dict[str, str],
    language: str = "english",
    chapter_id: Optional[str] = None,
    stream: bool = True,
    stream_callback: Optional[Callable[[Dict[str, Any]], None]] = None
) -> Union[str, Dict[str, Any]]:
    """
    Async version of run_chat_agent for use with async frameworks.
    
    Args:
        Same as run_chat_agent
        
    Returns:
        Same as run_chat_agent
    """
    # This is a simple wrapper around the sync function
    # In a real implementation, you would use async versions of the underlying calls
    
    return run_chat_agent(
        user_id=user_id,
        course_id=course_id,
        prompt=prompt,
        learning_profile=learning_profile,
        language=language,
        chapter_id=chapter_id,
        stream=stream,
        stream_callback=stream_callback
    ) 