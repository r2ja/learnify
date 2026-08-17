#!/usr/bin/env python3
import os
import sys
import json
import asyncio
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Add the parent directory to the path to import the agent module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from agent.run_chat_agent import run_chat_agent_async

# Load environment variables
load_dotenv()

# This is a simplified example of how the Next.js API route would
# integrate with the Python agent system.

class MockResponse:
    """Mock response object to simulate a web framework response."""
    
    def __init__(self):
        self.status_code = 200
        self.headers = {}
        self.body = ""
        
    def set_status(self, status_code: int) -> None:
        self.status_code = status_code
        
    def set_header(self, name: str, value: str) -> None:
        self.headers[name] = value
        
    def write(self, data: str) -> None:
        self.body += data
        # In a real implementation, this would be sent to the client
        print(data, end="", flush=True)
        
    def __str__(self) -> str:
        return f"Response(status={self.status_code}, headers={self.headers}, body_length={len(self.body)})"

class MemoryStorage:
    """Mock storage to simulate database operations."""
    
    def __init__(self):
        self.chat_sessions = {}
        
    async def save_chat_session(self, 
                               user_id: str, 
                               course_id: str, 
                               prompt: str, 
                               response: str,
                               chapter_id: Optional[str] = None) -> str:
        """Save a chat session to memory storage."""
        # Generate a simple ID (would be UUID in production)
        session_id = f"session-{len(self.chat_sessions) + 1}"
        
        # Store the session
        self.chat_sessions[session_id] = {
            "user_id": user_id,
            "course_id": course_id,
            "chapter_id": chapter_id,
            "prompt": prompt,
            "response": response,
        }
        
        print(f"Saved chat session with ID: {session_id}")
        return session_id

async def mock_api_handler(request_body: Dict[str, Any]) -> MockResponse:
    """
    Mock API handler that simulates the Next.js API route.
    
    This shows how the Next.js API would integrate with the
    Python agent to process requests and stream responses.
    
    Args:
        request_body: The request body (would be req.json() in Next.js)
        
    Returns:
        A response object with the streaming data
    """
    # Create a response object
    response = MockResponse()
    response.set_header("Content-Type", "text/event-stream")
    response.set_header("Cache-Control", "no-cache")
    response.set_header("Connection", "keep-alive")
    
    # Parse the request body
    try:
        user_id = request_body.get("userId")
        course_id = request_body.get("courseId")
        chapter_id = request_body.get("chapterId")
        prompt = request_body.get("prompt")
        language = request_body.get("language", "english")
        learning_profile = request_body.get("learningProfile", {})
        
        if not all([user_id, course_id, prompt, learning_profile]):
            response.set_status(400)
            response.write(json.dumps({"error": "Missing required fields"}))
            return response
        
        # Create a buffer to store the full response
        response_buffer = []
        
        # Define a callback to handle streaming
        async def stream_callback(chunk: Dict[str, Any]) -> None:
            chunk_type = chunk.get("type", "text")
            content = chunk.get("content", "")
            
            # Store the chunk in the buffer for later saving
            response_buffer.append(chunk)
            
            # Format as SSE (Server-Sent Events)
            event_data = {
                "type": chunk_type,
                "content": content
            }
            
            # Write the chunk as an SSE event
            sse_data = f"data: {json.dumps(event_data)}\n\n"
            response.write(sse_data)
        
        # Call the agent with streaming
        result = await run_chat_agent_async(
            user_id=user_id,
            course_id=course_id,
            prompt=prompt,
            learning_profile=learning_profile,
            language=language,
            chapter_id=chapter_id,
            stream=True,
            stream_callback=stream_callback
        )
        
        # In a real implementation, you would save the chat session to the database
        # Here we'll simulate that with our mock storage
        storage = MemoryStorage()
        
        # Combine all text chunks into a single response for saving
        full_response = "".join([
            chunk.get("content", "") for chunk in response_buffer 
            if chunk.get("type") == "text"
        ])
        
        # Save the chat session
        await storage.save_chat_session(
            user_id=user_id,
            course_id=course_id,
            prompt=prompt,
            response=full_response,
            chapter_id=chapter_id
        )
        
        # Signal the end of the stream
        response.write("data: [DONE]\n\n")
        
        return response
        
    except Exception as e:
        response.set_status(500)
        response.write(json.dumps({"error": str(e)}))
        return response

async def main():
    """Run the example API integration."""
    # Sample request body (would be req.json() in Next.js)
    request_body = {
        "userId": "user-456",
        "courseId": "math-101",
        "chapterId": "algebra-basics",
        "prompt": "Explain the quadratic formula and when to use it. Include a diagram and a quiz.",
        "language": "english",
        "learningProfile": {
            "processingStyle": "reflective",
            "perceptionStyle": "intuitive",
            "inputStyle": "verbal",
            "understandingStyle": "global"
        }
    }
    
    print("\n=== API Integration Example ===\n")
    print(f"Request Body: {json.dumps(request_body, indent=2)}")
    print("\n=== Stream Response ===\n")
    
    # Process the request
    response = await mock_api_handler(request_body)
    
    print(f"\n\n=== Response Complete ===")
    print(f"Status: {response.status_code}")
    print(f"Headers: {response.headers}")
    
if __name__ == "__main__":
    asyncio.run(main()) 