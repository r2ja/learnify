#!/usr/bin/env python3
import os
import sys
import json
import time
from typing import Dict, Any
from dotenv import load_dotenv

# Add the parent directory to the path to import the agent module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from agent.run_chat_agent import run_chat_agent

# Load environment variables
load_dotenv()

def stream_callback(chunk: Dict[str, Any]) -> None:
    """
    Callback function to process streaming chunks from the agent.
    This simulates how the Next.js API would handle streaming.
    
    Args:
        chunk: A chunk from the processed stream
    """
    chunk_type = chunk.get("type", "text")
    content = chunk.get("content", "")
    
    # Print the chunk with type information
    if chunk_type == "text":
        # For text chunks, print without newline to simulate streaming
        print(content, end="", flush=True)
    else:
        # For tool outputs, print with special formatting
        print(f"\n\n--- {chunk_type} OUTPUT START ---\n")
        print(content)
        print(f"\n--- {chunk_type} OUTPUT END ---\n")

def test_agent():
    """
    Test the agent with streaming enabled.
    This simulates how the Next.js API would call the agent.
    """
    # Sample user, course, and learning profile data
    # In a real API, this would come from the request body
    user_id = "test-user-123"
    course_id = "cs101"
    chapter_id = "intro-to-programming"  # Optional, can be None for general queries
    
    # Sample learning profile data
    learning_profile = {
        "processingStyle": "active",
        "perceptionStyle": "visual",
        "inputStyle": "interactive",
        "understandingStyle": "sequential"
    }
    
    # Sample prompt based on course content
    prompt = """
    Can you explain how sorting algorithms work? Please include:
    - A comparison of different sorting methods
    - A diagram showing how bubble sort works
    - A simple quiz to test my understanding
    """
    
    print("\n=== Starting Agent Test with Streaming ===\n")
    print(f"User ID: {user_id}")
    print(f"Course ID: {course_id}")
    print(f"Chapter ID: {chapter_id}")
    print(f"Learning Profile: {json.dumps(learning_profile, indent=2)}")
    print(f"Prompt: {prompt.strip()}")
    print("\n=== Agent Response ===\n")
    
    # Call the agent with streaming enabled
    start_time = time.time()
    result = run_chat_agent(
        user_id=user_id,
        course_id=course_id,
        prompt=prompt,
        learning_profile=learning_profile,
        language="english",
        chapter_id=chapter_id,
        stream=True,
        stream_callback=stream_callback
    )
    end_time = time.time()
    
    print(f"\n\n=== Agent completed in {end_time - start_time:.2f} seconds ===")
    print(f"Result: {result}")

if __name__ == "__main__":
    test_agent() 