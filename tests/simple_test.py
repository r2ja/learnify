#!/usr/bin/env python3
import os
import sys
import json
import time
import re
import requests
from typing import Dict, Any, List, Optional, Callable
from dotenv import load_dotenv

# Add the parent directory to the path to import utility modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from agent.tools.image_gen import img_gen_tool
from agent.tools.mermaid_gen import mermaid_gen_tool 
from agent.tools.quiz_gen import quiz_gen_tool

# Load environment variables
load_dotenv()

class StreamProcessor:
    """Simple version of the stream processor to handle tool calls."""
    
    def __init__(self):
        self.tools = {
            "img_gen": img_gen_tool,
            "mermaid_gen": mermaid_gen_tool,
            "quiz_gen": quiz_gen_tool
        }
        self.buffer = ""
        
    def process_chunk(self, chunk: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process a chunk from the LLM stream."""
        results = []
        
        # Extract content from the chunk
        if "choices" in chunk and len(chunk["choices"]) > 0:
            delta = chunk["choices"][0].get("delta", {})
            if "content" in delta and delta["content"]:
                text = delta["content"]
                self.buffer += text
                
                # Check for tool patterns
                for tool_name in self.tools:
                    pattern = rf'<{tool_name}>(.*?)</{tool_name}>'
                    match = re.search(pattern, self.buffer, re.DOTALL)
                    if match:
                        # Found a complete tool call
                        before_tag = self.buffer[:match.start()]
                        after_tag = self.buffer[match.end():]
                        content = match.group(1).strip()
                        
                        # Add the text before the tag
                        if before_tag:
                            results.append({
                                "type": "text",
                                "content": before_tag
                            })
                        
                        # Execute the tool
                        try:
                            tool_result = self.tools[tool_name](content)
                            results.append({
                                "type": tool_name,
                                "content": tool_result
                            })
                        except Exception as e:
                            results.append({
                                "type": "error",
                                "content": f"Error executing {tool_name}: {str(e)}"
                            })
                        
                        # Update the buffer to only contain text after the tag
                        self.buffer = after_tag
                        return results
                
                # If no complete tool call, just return the text
                results.append({
                    "type": "text",
                    "content": text
                })
        
        return results

def create_system_prompt(course_id: str, learning_profile: Dict[str, str], language: str) -> str:
    """Create a simplified system prompt."""
    lang_instruction = "Please respond in English" if language == "english" else "Please respond in Urdu"
    
    # Format learning profile
    profile_text = "\n".join([f"- {key}: {value}" for key, value in learning_profile.items()])
    
    return f"""You are an intelligent educational assistant for course ID: {course_id}.
{lang_instruction}.

The student has the following learning preferences:
{profile_text}

Your goal is to provide clear, helpful responses tailored to the student's learning profile.
You can use markdown formatting in your responses.

Available tools:
- <img_gen>description</img_gen> - Generate an image based on description
- <mermaid_gen>diagram code</mermaid_gen> - Create diagrams using Mermaid
- <quiz_gen>topic</quiz_gen> - Generate quiz questions on the topic

Please use these tools when appropriate to enhance your explanation.
"""

def call_llm_direct(messages: List[Dict[str, str]], stream: bool = True) -> Any:
    """Call LLM directly with requests instead of using LLMClient."""
    # Hardcode the working API key since dotenv is problematic
    api_key = os.getenv("OPENROUTER_API_KEY")
    
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
        "messages": messages,
        "max_tokens": 1500,
        "temperature": 0.7,
        "stream": stream
    }
    
    # Make request
    response = requests.post(
        url, 
        headers=headers,
        json=payload,
        stream=stream, 
        timeout=120
    )
    
    if response.status_code != 200:
        raise RuntimeError(f"API request failed with status code: {response.status_code}")
    
    if stream:
        return response
    else:
        return response.json()

def run_simple_test():
    """Run a simple test of the agent's core functionality."""
    # Sample test data
    user_id = "test-user-123"
    course_id = "cs101"
    
    # Sample learning profile
    learning_profile = {
        "processingStyle": "active",
        "perceptionStyle": "visual",
        "inputStyle": "interactive",
        "understandingStyle": "sequential"
    }
    
    # Sample prompt
    prompt = """
    Explain how sorting algorithms work. Please include:
    - A comparison of different sorting methods
    - A diagram showing how bubble sort works
    - A simple quiz to test my understanding
    """
    
    # Create a system prompt
    system_prompt = create_system_prompt(course_id, learning_profile, "english")
    
    # Prepare the messages
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt}
    ]
    
    print("\n=== Starting Simple Agent Test ===\n")
    print(f"User ID: {user_id}")
    print(f"Course ID: {course_id}")
    print(f"Learning Profile: {json.dumps(learning_profile, indent=2)}")
    print(f"Prompt: {prompt.strip()}")
    print("\n=== Agent Response ===\n")
    
    # Initialize the stream processor
    processor = StreamProcessor()
    
    # Call the LLM with streaming
    start_time = time.time()
    
    try:
        # Get streaming response
        response = call_llm_direct(messages, stream=True)
        
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
                        results = processor.process_chunk(chunk)
                        for result in results:
                            if result["type"] == "text":
                                print(result["content"], end="", flush=True)
                            else:
                                print(f"\n\n--- {result['type']} OUTPUT START ---\n")
                                print(result["content"])
                                print(f"\n--- {result['type']} OUTPUT END ---\n")
                    except json.JSONDecodeError:
                        pass
                        
        end_time = time.time()
        print(f"\n\n=== Agent completed in {end_time - start_time:.2f} seconds ===")
    
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    run_simple_test() 