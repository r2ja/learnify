#!/usr/bin/env python3
import os
import sys
import json
from dotenv import load_dotenv

# Add the parent directory to the path to import utility modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utility.llm_client import LLMClient

# Load environment variables
load_dotenv()

def test_api_key_comparison():
    """Compare the API key used by LLMClient with the known working key"""
    print("\n=== Comparing API Keys ===\n")
    
    # Create LLMClient without explicit key (uses env or default)
    client = LLMClient()
    client_key = client.api_key
    
    # Known working key
    working_key = "***REMOVED***"
    
    # Compare keys
    print(f"Original Key:  {working_key}")
    print(f"Client Key:    {client_key}")
    print(f"Keys Match:    {client_key == working_key}")
    
    # Check header format
    client_auth = client.headers.get("Authorization", "")
    print(f"Authorization: {client_auth}")
    
    # Test with working key directly
    test_client = LLMClient(working_key)
    test_auth = test_client.headers.get("Authorization", "")
    print(f"Test Auth:     {test_auth}")
    
    # For direct comparison debug
    print("\n=== Exact string comparison (char by char) ===")
    if len(client_key) != len(working_key):
        print(f"Length mismatch: client_key={len(client_key)}, working_key={len(working_key)}")
    
    # Compare character by character
    for i, (c1, c2) in enumerate(zip(client_key, working_key)):
        if c1 != c2:
            print(f"Mismatch at position {i}: '{c1}' vs '{c2}'")
            # Show a few chars before and after for context
            start = max(0, i-5)
            end = min(len(client_key), i+6)
            print(f"Client key context:  '{client_key[start:end]}'")
            print(f"Working key context: '{working_key[start:end]}'")

if __name__ == "__main__":
    test_api_key_comparison() 