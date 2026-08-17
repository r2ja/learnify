#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv, find_dotenv

# Add the parent directory to the path to import utility modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utility.llm_client import LLMClient, create_client

def test_llm_client():
    """Direct test of LLMClient with both hardcoded and environment API keys"""
    
    # Test 1: Hardcoded API key
    hardcoded_key = os.getenv("OPENROUTER_API_KEY")
    print("=== Testing with hardcoded API key ===")
    client1 = LLMClient(hardcoded_key)
    test_client(client1, "with hardcoded key")
    
    # Test 2: Environment API key
    print("\n\n=== Testing with environment API key ===")
    
    # Find and load the .env file
    dotenv_path = find_dotenv(usecwd=True)
    print(f"Found .env file at: {dotenv_path}")
    load_dotenv(dotenv_path, override=True)  # Force reload and override existing env vars
    
    # Check all environment variables to debug
    print("\nChecking environment variables:")
    for key, value in os.environ.items():
        if "API_KEY" in key:
            print(f"{key}: {value[:5]}...{value[-5:]}")
    
    # Get the API key from environment
    env_key = os.getenv("OPENROUTER_API_KEY")
    print(f"\nEnvironment API key: {env_key[:5]}...{env_key[-5:]}")
    
    # Read the key directly from the .env file for verification
    print("\nReading key directly from .env file:")
    try:
        with open(dotenv_path, "r") as f:
            for line in f:
                if line.startswith("OPENROUTER_API_KEY="):
                    file_key = line.strip().split("=")[1]
                    print(f"Key in file: {file_key[:5]}...{file_key[-5:]}")
                    break
    except Exception as e:
        print(f"Error reading .env file: {e}")
    
    client2 = LLMClient(env_key)
    test_client(client2, "with environment key")

def test_client(client, test_name):
    """Test a client with streaming and reasoning"""
    messages = [
        {"role": "system", "content": "You are a helpful assistant. Be concise."},
        {"role": "user", "content": "What are the three primary colors? Explain briefly."}
    ]
    
    print(f"\n--Testing {test_name}--")
    print("API key:", client.api_key[:5] + "..." + client.api_key[-5:])
    print("Using streaming with reasoning...")
    
    try:
        # Define callbacks to print responses
        def print_reasoning(chunk):
            print(f"REASONING: {chunk}")
            
        def print_content(chunk):
            print(f"CONTENT: {chunk}", end='', flush=True)
        
        # Get streaming response with reasoning
        stream_iterator = client.generate_response(
            messages=messages,
            max_tokens=100,
            temperature=0.7,
            enable_reasoning=True,
            stream=True,
            stream_reasoning=True
        )
        
        # Process the streaming response
        result = client.process_streaming_response_callback(
            stream_iterator,
            content_callback=print_content,
            reasoning_callback=print_reasoning
        )
        
        print("\n\nTest completed successfully!")
        
    except Exception as e:
        print(f"\nERROR: {str(e)}")

if __name__ == "__main__":
    test_llm_client() 