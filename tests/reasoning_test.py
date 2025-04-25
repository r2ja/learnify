#!/usr/bin/env python3
import os
import sys
import json
from dotenv import load_dotenv

# Add the parent directory to the path to import utility modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utility.llm_client import LLMClient, create_client

# Load environment variables
load_dotenv()

def test_reasoning():
    """Test the reasoning capability of the LLM client."""
    print("\n=== Testing Reasoning Capability ===\n")
    
    # Create client
    client = create_client(None)
    
    # System and user messages
    system_message = """You are an intelligent educational assistant.
Please provide clear, helpful responses with reasoning."""
    
    user_message = """A student asked me this question: "If I have a list of numbers [5, 2, 9, 1, 5, 6] 
and I want to sort it in ascending order, what algorithm would be most efficient and why?"
Think step by step about this problem and provide a reasoned response."""
    
    print(f"System Message: {system_message}")
    print(f"User Message: {user_message}")
    
    print("\n=== Non-streaming Response with Reasoning ===\n")
    
    # Test with reasoning enabled
    try:
        response = client.generate_response(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7,
            enable_reasoning=True
        )
        
        content = client.extract_content(response)
        
        print("=== Reasoning Process ===")
        print(content.get("reasoning", "No reasoning provided"))
        
        print("\n=== Final Response ===")
        print(content.get("content", "No content provided"))
        
        if "usage" in content:
            print(f"\nUsage: {content['usage']}")
        
    except Exception as e:
        print(f"❌ ERROR in reasoning test: {str(e)}")
    
    print("\n=== Streaming Response with Reasoning ===\n")
    
    # Test streaming with reasoning
    try:
        def print_reasoning(chunk):
            print(f"Reasoning: {chunk}")
            
        def print_content(chunk):
            print(f"Content: {chunk}", end='', flush=True)
            
        stream_iterator = client.generate_response(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": "Explain the concept of recursion in programming"}
            ],
            max_tokens=300,
            temperature=0.7,
            enable_reasoning=True,
            stream=True,
            stream_reasoning=True
        )
        
        result = client.process_streaming_response_callback(
            stream_iterator,
            content_callback=print_content,
            reasoning_callback=print_reasoning
        )
        
    except Exception as e:
        print(f"\n❌ ERROR in streaming reasoning test: {str(e)}")

if __name__ == "__main__":
    test_reasoning() 