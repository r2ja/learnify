#!/usr/bin/env python3
import os
import sys
import json
import time
from dotenv import load_dotenv

# Add the parent directory to the path to import utility modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utility.llm_client import LLMClient, create_client

# Load environment variables
load_dotenv()

def test_stream_reasoning():
    """Test streaming with reasoning, showing both outputs clearly separated."""
    print("\n=== Testing Streaming with Reasoning ===\n")
    
    # Create client with API key from environment
    client = create_client(None)
    
    # System and user messages for a complex question
    system_message = """You are an intelligent educational assistant.
Please provide clear, helpful responses with reasoning."""
    
    user_message = """Explain how quantum computing works and how it differs from classical computing.
Think step by step about the fundamental principles and provide examples."""
    
    print(f"System Message: {system_message}")
    print(f"User Message: {user_message}")
    print("\n=== Starting Stream ===\n")
    
    # Buffers to accumulate content
    reasoning_buffer = ""
    content_buffer = ""
    
    # Test streaming with reasoning
    try:
        # Define callbacks to handle each type of chunk
        def handle_reasoning(chunk):
            nonlocal reasoning_buffer
            reasoning_buffer += chunk
            print("\033[33m" + chunk + "\033[0m", end='', flush=True)  # Yellow text
            
        def handle_content(chunk):
            nonlocal content_buffer
            content_buffer += chunk
            print("\033[32m" + chunk + "\033[0m", end='', flush=True)  # Green text
        
        print("\033[33m[REASONING START]\033[0m\n")
        
        # Get streaming response with reasoning
        stream_iterator = client.generate_response(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            max_tokens=800,
            temperature=0.7,
            enable_reasoning=True,
            stream=True,
            stream_reasoning=True
        )
        
        # Start timing
        start_time = time.time()
        
        # Process the streaming response
        result = client.process_streaming_response_callback(
            stream_iterator,
            content_callback=handle_content,
            reasoning_callback=handle_reasoning
        )
        
        # End timing
        end_time = time.time()
        
        print("\n\n\033[33m[REASONING END]\033[0m")
        
        # Print summary 
        print(f"\n\n=== Summary ===")
        print(f"Time taken: {end_time - start_time:.2f} seconds")
        print(f"Reasoning length: {len(reasoning_buffer)} characters")
        print(f"Content length: {len(content_buffer)} characters")
        
    except Exception as e:
        print(f"\n❌ ERROR in streaming reasoning test: {str(e)}")

if __name__ == "__main__":
    test_stream_reasoning() 