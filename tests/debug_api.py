#!/usr/bin/env python3
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_openrouter():
    """Debug the OpenRouter API connection"""
    print("\n=== Debugging OpenRouter API ===\n")
    
    # Get API key
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ ERROR: OPENROUTER_API_KEY not found in environment")
        return
    
    # Print masked API key (first 8 and last 4 characters)
    masked_key = f"{api_key[:8]}...{api_key[-4:]}"
    print(f"API Key: {masked_key}")
    
    # Set up request
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        # Add extra required headers
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Learnify Agent Test",
        # Try different header formats
        "Authorization-Bearer": api_key
    }
    payload = {
        "model": "deepseek/deepseek-r1-distill-llama-70b:free",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, are you working?"}
        ],
        "max_tokens": 50
    }
    
    # Make request
    try:
        print("Sending request to OpenRouter API...")
        print(f"Using headers: {json.dumps(headers, indent=2)}")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Status code: {response.status_code}")
        print(f"Headers: {response.headers}")
        
        if response.status_code == 200:
            result = response.json()
            message = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"✅ SUCCESS: Response received")
            print(f"Message: {message[:100]}...")
        else:
            print(f"❌ ERROR: Request failed")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: Exception occurred: {str(e)}")
        
    # Try with alternate key
    alternate_key = "***REMOVED***"
    print("\n--- Trying with alternate API key ---\n")
    headers["Authorization"] = f"Bearer {alternate_key}"
    
    try:
        print("Sending request with alternate key...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            message = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"✅ SUCCESS: Response received")
            print(f"Message: {message[:100]}...")
            
            # Write the working key to .env file
            update_env_file("OPENROUTER_API_KEY", alternate_key)
        else:
            print(f"❌ ERROR: Request failed")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: Exception occurred: {str(e)}")

def debug_pinecone():
    """Debug the Pinecone API connection"""
    print("\n=== Debugging Pinecone API ===\n")
    
    # Get API key and other info
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME")
    environment = os.getenv("PINECONE_ENVIRONMENT")
    
    if not api_key:
        print("❌ ERROR: PINECONE_API_KEY not found in environment")
        return
    
    if not index_name:
        print("❌ ERROR: PINECONE_INDEX_NAME not found in environment")
        return
    
    # Print masked API key (first 8 and last 4 characters)
    masked_key = f"{api_key[:8]}...{api_key[-4:]}"
    print(f"API Key: {masked_key}")
    print(f"Index Name: {index_name}")
    print(f"Environment: {environment}")
    
    # Try alternative API version headers
    headers_v1 = {
        "accept": "application/json",
        "content-type": "application/json",
        "Api-Key": api_key
    }
    
    headers_v2 = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": api_key
    }
    
    headers_v3 = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Pinecone-API-Key": api_key,
        "X-Pinecone-API-Version": "2025-01"
    }
    
    # Set up request for the index stats
    index_url = f"https://{index_name}.svc.{environment}.pinecone.io/describe_index_stats"
    
    # Try multiple different header combinations
    header_versions = [
        ("Default", headers_v1),
        ("Lowercase", headers_v2),
        ("X-Pinecone", headers_v3)
    ]
    
    for header_name, headers in header_versions:
        try:
            print(f"\nTrying {header_name} headers...")
            print(f"Headers: {json.dumps(headers, indent=2)}")
            print(f"URL: {index_url}")
            response = requests.post(index_url, headers=headers, timeout=30)
            
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCESS: Response received")
                print(f"Index stats: {json.dumps(result, indent=2)}")
                break
            else:
                print(f"❌ ERROR: Request failed")
                try:
                    error_data = response.json()
                    print(f"Error details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Error response: {response.text}")
        except Exception as e:
            print(f"❌ ERROR: Exception occurred: {str(e)}")
    
    # If we couldn't connect, try alternative URL with api.pinecone.io
    if response.status_code != 200:
        try:
            print("\nTrying alternative Pinecone URL format...")
            alt_url = f"https://api.pinecone.io/indexes/{index_name}/stats"
            alt_headers = {
                "Api-Key": api_key,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            
            print(f"URL: {alt_url}")
            response = requests.get(alt_url, headers=alt_headers, timeout=30)
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCESS: Response received")
                print(f"Index stats: {json.dumps(result, indent=2)}")
            else:
                print(f"❌ ERROR: Request failed")
                try:
                    error_data = response.json()
                    print(f"Error details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Error response: {response.text}")
        except Exception as e:
            print(f"❌ ERROR: Exception occurred: {str(e)}")

def update_env_file(key, value):
    """Update a key-value pair in the .env file"""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    
    if os.path.exists(env_path):
        # Read the existing file
        with open(env_path, "r") as f:
            lines = f.readlines()
            
        # Check if the key exists
        key_exists = False
        for i, line in enumerate(lines):
            if line.startswith(f"{key}="):
                lines[i] = f"{key}={value}\n"
                key_exists = True
                break
                
        # If key doesn't exist, add it
        if not key_exists:
            lines.append(f"{key}={value}\n")
            
        # Write back to the file
        with open(env_path, "w") as f:
            f.writelines(lines)
            
        print(f"✅ Updated {key} in .env file")
    else:
        print(f"❌ .env file not found at {env_path}")

if __name__ == "__main__":
    debug_openrouter()
    debug_pinecone() 