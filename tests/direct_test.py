#!/usr/bin/env python3
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_direct_openrouter():
    """Test OpenRouter API directly with requests"""
    print("\n=== Testing OpenRouter API Directly ===\n")
    
    # Get API key - use the alternate key that worked in the debug script
    api_key = "***REMOVED***"
    print(f"Using OpenRouter API Key: {api_key[:8]}...{api_key[-4:]}")
    
    # Set up request
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Direct Test"
    }
    payload = {
        "model": "deepseek/deepseek-r1-distill-llama-70b:free",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Explain sorting algorithms briefly."}
        ],
        "max_tokens": 150,
        "stream": True
    }
    
    # Make request
    try:
        print("Sending streaming request to OpenRouter...")
        response = requests.post(
            url, 
            headers=headers,
            json=payload,
            stream=True, 
            timeout=30
        )
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            print("Streaming response:")
            full_response = ""
            # Process the streaming response
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        line = line[6:]  # Remove 'data: ' prefix
                        if line.strip() == '[DONE]':
                            break
                        try:
                            chunk = json.loads(line)
                            if "choices" in chunk and len(chunk["choices"]) > 0:
                                delta = chunk["choices"][0].get("delta", {})
                                if "content" in delta and delta["content"] is not None:
                                    content = delta["content"]
                                    full_response += content
                                    print(content, end="", flush=True)
                        except json.JSONDecodeError:
                            pass
            
            print("\n\n✅ Streaming completed successfully")
            
            # Save the working API key to a new .env file
            with open(".env.working", "w") as f:
                f.write(f"# Working API Key\n")
                f.write(f"OPENROUTER_API_KEY={api_key}\n")
                f.write(f"OPENROUTER_MODEL=deepseek/deepseek-r1-distill-llama-70b:free\n")
            
            print("✅ Created .env.working with working API key")
        else:
            print(f"❌ ERROR: Request failed")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: Exception occurred: {str(e)}")

if __name__ == "__main__":
    test_direct_openrouter() 