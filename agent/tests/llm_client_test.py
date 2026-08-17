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

def test_llm_client():
    """Test the updated LLMClient functionality."""
    print("\n=== Testing Updated LLM Client ===\n")
    
    # Create client without explicit API key (will use default or env var)
    client = create_client(None)
    
    # Simple system and user messages
    system_message = """You are an intelligent educational assistant.
Please provide clear, helpful responses. Keep your response concise and focused."""
    
    user_message = """What is machine learning and how does it work? 
Give me a short explanation suitable for beginners."""
    
    print(f"System Message: {system_message}")
    print(f"User Message: {user_message}")
    print("\n=== Non-streaming Response ===\n")
    
    # Test non-streaming response
    try:
        response = client.generate_response(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        content = client.extract_content(response)
        print(f"Content: {content['content']}")
        print(f"Usage: {content['usage']}")
        
    except Exception as e:
        print(f"❌ ERROR in non-streaming test: {str(e)}")
    
    print("\n=== Streaming Response ===\n")
    
    # Test streaming response
    try:
        def print_chunk(chunk):
            print(chunk, end='', flush=True)
            
        stream_iterator = client.generate_response(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": "What is a neural network?"}
            ],
            max_tokens=150,
            temperature=0.7,
            stream=True
        )
        
        result = client.process_streaming_response_callback(
            stream_iterator,
            content_callback=print_chunk
        )
        
        print("\n\nFull result length:", len(result["content"]))
        
    except Exception as e:
        print(f"❌ ERROR in streaming test: {str(e)}")

if __name__ == "__main__":
    test_llm_client() 