#!/usr/bin/env python3
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_auth_headers():
    """Debug the authentication headers and API key format"""
    print("\n=== Debugging Authentication Headers ===\n")
    
    # Get API key - use the alternate key that worked in the debug script
    api_key = "***REMOVED***"
    print(f"Using OpenRouter API Key: {api_key}")
    
    # Test different header formats
    auth_formats = [
        {"name": "Format 1 (Bearer with space)", "value": f"Bearer {api_key}"},
        {"name": "Format 2 (bearer lowercase)", "value": f"bearer {api_key}"},
        {"name": "Format 3 (just key)", "value": api_key},
        {"name": "Format 4 (token)", "value": f"Token {api_key}"}
    ]
    
    # Base headers
    base_headers = {
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Debug Test"
    }
    
    # Simple payload
    payload = {
        "model": "deepseek/deepseek-r1-distill-llama-70b:free",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'hello'."}
        ],
        "max_tokens": 10
    }
    
    # URL
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    # Test each format
    for auth_format in auth_formats:
        headers = base_headers.copy()
        headers["Authorization"] = auth_format["value"]
        
        print(f"\n--- Testing {auth_format['name']} ---")
        print(f"Headers: {json.dumps(headers, indent=2)}")
        
        try:
            response = requests.post(
                url, 
                headers=headers,
                json=payload,
                timeout=30
            )
            
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ SUCCESS")
                resp_json = response.json()
                content = resp_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                print(f"Response: {content}")
                
                # This format works - save it
                with open(".env.working", "w") as f:
                    f.write(f"# Working API Key and Format\n")
                    f.write(f"OPENROUTER_API_KEY={api_key}\n")
                    f.write(f"OPENROUTER_MODEL=deepseek/deepseek-r1-distill-llama-70b:free\n")
                    f.write(f"AUTH_FORMAT={auth_format['name']}\n")
                    
            else:
                print(f"❌ ERROR")
                try:
                    error_data = response.json()
                    print(f"Error details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Error response: {response.text}")
        except Exception as e:
            print(f"❌ EXCEPTION: {str(e)}")

if __name__ == "__main__":
    debug_auth_headers() 