import re
import json
import logging
import uuid
from typing import Dict, List, Any, Optional, Callable, Iterator, AsyncIterator
import asyncio
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StreamProcessor:
    """
    Processes token streams from LLM and handles tool tag detection and execution.
    
    This component intercepts the token stream, detects special tool tags,
    pauses streaming, executes the appropriate tool, and continues the stream.
    """
    
    def __init__(self, tools: Dict[str, Callable]):
        """
        Initialize the stream processor with available tools.
        
        Args:
            tools: Dictionary mapping tool tags to tool functions
        """
        self.tools = tools
        
        # Regex patterns for tool detection
        self.tool_pattern = re.compile(r'<(\w+_gen)>(.*?)</\1>', re.DOTALL)
        
        # Buffers for holding in-progress content
        self.token_buffer = ""
        self.complete_content = ""
        
    def process_token(self, token: str) -> List[Dict[str, Any]]:
        """
        Process a single token from the LLM stream.
        
        Args:
            token: A token from the LLM response stream
            
        Returns:
            List of output chunks (regular content or tool results)
        """
        # Add the token to our buffers
        self.token_buffer += token
        self.complete_content += token
        
        output_chunks = []
        
        # Check if we have a complete tool tag in our buffer
        match = self.tool_pattern.search(self.token_buffer)
        if match:
            # Extract the tool tag and content
            tool_name = match.group(1)
            tool_content = match.group(2).strip()
            
            logger.info(f"Detected tool tag: {tool_name} with content: {tool_content[:50]}...")
            
            # Execute the tool if available
            if tool_name in self.tools:
                try:
                    tool_result = self.tools[tool_name](tool_content)
                    
                    # Replace the tool tag in our buffer with the tool result
                    before_tag = self.token_buffer[:match.start()]
                    after_tag = self.token_buffer[match.end():]
                    
                    # Add the text before the tag to outputs
                    if before_tag:
                        output_chunks.append({
                            "type": "text", 
                            "content": before_tag
                        })
                    
                    # Add the tool result
                    output_chunks.append({
                        "type": tool_name,
                        "content": tool_result
                    })
                    
                    # Update the buffer to contain only the text after the tag
                    self.token_buffer = after_tag
                    
                except Exception as e:
                    logger.error(f"Error executing tool {tool_name}: {str(e)}")
                    # Replace the tool tag with an error message
                    error_msg = f"Error executing {tool_name}: {str(e)}"
                    self.token_buffer = self.token_buffer.replace(
                        match.group(0), 
                        f"<error>{error_msg}</error>"
                    )
            else:
                # Tool not available, leave the tag as is
                logger.warning(f"Unknown tool tag: {tool_name}")
                
                # Add the current token as regular text
                output_chunks.append({
                    "type": "text",
                    "content": token
                })
        else:
            # No complete tool tag, add the token as regular text
            output_chunks.append({
                "type": "text",
                "content": token
            })
        
        return output_chunks
    
    def finalize(self) -> str:
        """
        Finalize processing and return the complete content.
        
        Returns:
            The complete processed content
        """
        return self.complete_content


class StreamingSupervisor:
    """
    Orchestrates LLM streaming responses with tool execution.
    
    This class manages the stream processing, tool execution,
    and message formatting for the agent system.
    """
    
    def __init__(self, tools: Dict[str, Callable]):
        """
        Initialize the streaming supervisor.
        
        Args:
            tools: Dictionary mapping tool names to tool functions
        """
        self.tools = tools
        self.processor = StreamProcessor(tools)
        
    def process_stream(self, stream: Iterator[Dict[str, Any]]) -> Iterator[Dict[str, Any]]:
        """
        Process a stream of chunks from the LLM, handling both content and reasoning.
        
        Args:
            stream: Iterator of chunks from the LLM (can include reasoning)
            
        Yields:
            Processed chunks (text, tool results, or reasoning)
        """
        for chunk in stream:
            # Check if it's a reasoning chunk from LLMClient
            if isinstance(chunk, dict) and chunk.get("type") == "reasoning":
                # Pass reasoning chunks directly through
                yield chunk
                continue # Move to next chunk

            # Check if it's a content chunk from LLMClient or a standard API response
            if isinstance(chunk, dict) and chunk.get("type") == "content":
                # Extract text from the content chunk
                token = chunk.get("text", "")
            elif "choices" in chunk and len(chunk["choices"]) > 0: 
                # Standard streaming format (fallback)
                delta = chunk["choices"][0].get("delta", {})
                token = delta.get("content", None)
            else:
                # Unrecognized chunk format, skip
                token = None

            if token is not None and token != "": # Ensure token is valid and not empty
                # Process the content token for tool calls
                output_chunks = self.processor.process_token(token)
                
                # Yield output chunks (which could be text or tool results)
                for output_chunk in output_chunks:
                    yield output_chunk
            elif chunk.get("type") != "reasoning": # Don't log skipped reasoning chunks
                # Log unexpected chunk structure if it's not reasoning
                logger.debug(f"Skipping unrecognized or empty chunk structure: {chunk}")

    async def process_stream_async(self, stream: AsyncIterator[Dict[str, Any]]) -> AsyncIterator[Dict[str, Any]]:
        """
        Process an async stream of tokens from the LLM.
        
        Args:
            stream: Async iterator of token chunks from the LLM
            
        Yields:
            Processed chunks (text or tool results)
        """
        async for chunk in stream:
             # Check if it's a reasoning chunk from LLMClient
            if isinstance(chunk, dict) and chunk.get("type") == "reasoning":
                yield chunk
                continue

            # Check if it's a content chunk from LLMClient or a standard API response
            if isinstance(chunk, dict) and chunk.get("type") == "content":
                token = chunk.get("text", "")
            elif "choices" in chunk and len(chunk["choices"]) > 0:
                delta = chunk["choices"][0].get("delta", {})
                token = delta.get("content", None)
            else:
                token = None

            if token is not None and token != "":
                # Process the token
                output_chunks = self.processor.process_token(token)
                
                # Yield output chunks
                for output_chunk in output_chunks:
                    yield output_chunk
            elif chunk.get("type") != "reasoning":
                 logger.debug(f"Skipping unrecognized or empty async chunk structure: {chunk}")

    def save_chat_session(self, 
                         user_id: str, 
                         course_id: str, 
                         prompt: str, 
                         response: str, 
                         chapter_id: Optional[str] = None) -> str:
        """
        Save the chat session to the database.
        
        Args:
            user_id: ID of the user
            course_id: ID of the course
            prompt: User's prompt
            response: LLM's response
            chapter_id: Optional chapter ID (for chapter-specific chats)
            
        Returns:
            ID of the created chat session
        """
        session_id = str(uuid.uuid4())
        now = datetime.now()
        
        input_payload = {
            "prompt": prompt,
            "timestamp": now.isoformat()
        }
        
        output_payload = {
            "response": response,
            "timestamp": now.isoformat()
        }
        
        try:
            if chapter_id:
                # Save to ChapterChatSession
                logger.info(f"Saving chapter chat session for user {user_id}, chapter {chapter_id}")
                # Here you would add code to connect to the database and insert the record
                # This is a placeholder for the actual database insertion logic
                logger.info(f"Created ChapterChatSession with ID: {session_id}")
            else:
                # Save to GeneralQueryChatSession
                logger.info(f"Saving general query chat session for user {user_id}, course {course_id}")
                # Here you would add code to connect to the database and insert the record
                # This is a placeholder for the actual database insertion logic
                logger.info(f"Created GeneralQueryChatSession with ID: {session_id}")
                
            return session_id
        
        except Exception as e:
            logger.error(f"Error saving chat session: {str(e)}")
            return ""


def format_rag_context(context_chunks: List[Dict[str, Any]]) -> str:
    """
    Format RAG context chunks into a single context string.
    
    Args:
        context_chunks: List of context chunks from Pinecone
        
    Returns:
        Formatted context string
    """
    if not context_chunks:
        return ""
    
    formatted_chunks = []
    for i, chunk in enumerate(context_chunks):
        content = chunk.get("content", "")
        metadata = chunk.get("metadata", {})
        source = metadata.get("source", "")
        
        formatted_chunk = f"[CHUNK {i+1}]"
        if source:
            formatted_chunk += f" Source: {source}"
        
        formatted_chunk += f"\n{content}\n"
        formatted_chunks.append(formatted_chunk)
    
    return "\n".join(formatted_chunks)


def create_system_prompt(
    course_id: str,
    rag_context: str,
    learning_profile: Dict[str, str],
    language: str = "english"
) -> str:
    """
    Create a system prompt with RAG context and learning profile.
    
    Args:
        course_id: ID of the course
        rag_context: Retrieved context from Pinecone
        learning_profile: User's learning profile
        language: Language for the response
        
    Returns:
        Formatted system prompt
    """
    # Base language instruction
    language_instruction = "Please respond in English" if language == "english" else "Please respond in Urdu"
    
    # Format learning profile for system prompt
    profile_text = "The student has the following learning preferences:\n"
    for key, value in learning_profile.items():
        profile_text += f"- {key}: {value}\n"
    
    # Create system prompt with context and profile
    system_prompt = f"""You are an intelligent educational assistant for course ID: {course_id}.
{language_instruction}.

[LEARNING PROFILE]
{profile_text}

[CONTEXT INFORMATION]
{rag_context}

Your goal is to provide clear, helpful responses tailored to the student's learning profile.
You can use markdown formatting in your responses.

Available tools:
- <img_gen>description</img_gen> - Generate an image based on description
- <mermaid>diagram code</mermaid> - Create diagrams using Mermaid

Please use these tools when appropriate to enhance your explanation.
"""
    
    return system_prompt 