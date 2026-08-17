#!/usr/bin/env python3
import requests
import json
import sys
import os
from typing import Dict, List, Optional, Union, Any, Callable, Iterator, Tuple
from dotenv import load_dotenv, find_dotenv

# Load environment variables with override to ensure newest values
dotenv_path = find_dotenv(usecwd=True)
load_dotenv(dotenv_path, override=True)

# The only available model
DEFAULT_MODEL = "deepseek/deepseek-r1-distill-llama-70b:free"

class LLMClient:
    """
    Client for interfacing with OpenRouter API to access the DeepSeek model
    with support for reasoning and streaming capabilities.
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize the LLM client with the given API key.
        
        Args:
            api_key: Optional API key (can be set later with set_api_key)
        """
        # Use provided API key or get from environment variable
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        
        # Fallback to hardcoded key if needed
        if not self.api_key:
            self.api_key = os.getenv("OPENROUTER_API_KEY")
            print("Warning: Using fallback API key. Consider setting OPENROUTER_API_KEY in .env file.")
            
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.headers = self._build_headers()
    
    def set_api_key(self, api_key: str) -> None:
        """
        Set or update the API key.
        
        Args:
            api_key: The OpenRouter API key
        """
        self.api_key = api_key
        self.headers = self._build_headers()
    
    def _build_headers(self) -> Dict[str, str]:
        """Build the headers for the API request."""
        headers = {
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Direct Test"
        }
        
        if self.api_key:
            # The prefix "Bearer " (with space) is crucial for authentication to work
            headers["Authorization"] = f"Bearer {self.api_key}"
            
        return headers
    
    def _validate_request(self) -> None:
        """Validate that the client is properly configured for a request."""
        if not self.api_key:
            raise ValueError("API key is not set. Please set it using set_api_key() method.")
    
    def generate_response(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 500,
        temperature: float = 0.7,
        enable_reasoning: bool = False,
        reasoning_effort: str = "high",
        stream: bool = False,
        stream_reasoning: bool = False,
        timeout: int = 120,
        **kwargs
    ) -> Union[Dict[str, Any], Iterator[Dict[str, str]]]:
        """
        Generate a response from the LLM.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            enable_reasoning: Whether to enable reasoning mode
            reasoning_effort: Reasoning effort level when reasoning is enabled
            stream: Whether to stream the response
            stream_reasoning: Whether to stream the reasoning process (requires enable_reasoning=True)
            timeout: Request timeout in seconds
            **kwargs: Additional parameters to pass to the model
            
        Returns:
            Either a complete response dictionary or an iterator of response chunks
        """
        self._validate_request()
        
        payload = {
            "model": DEFAULT_MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            **kwargs
        }
        
        # Add reasoning if enabled
        if enable_reasoning:
            reasoning_config = {
                "effort": reasoning_effort
            }
            
            # Add stream option to reasoning if requested
            if stream_reasoning and stream:
                reasoning_config["stream"] = True
                
            payload["reasoning"] = reasoning_config
            
        # Add streaming parameter if enabled
        if stream:
            payload["stream"] = True
        
        try:
            # Debug print before making the request
            print(f"Making request to {self.base_url}")
            print(f"Headers: {json.dumps({k: v for k, v in self.headers.items() if k != 'Authorization'})}")
            print(f"API Key: {self.api_key[:5]}...{self.api_key[-5:]}")
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=timeout,
                stream=stream
            )
            
            # Handle errors
            if response.status_code != 200:
                self._handle_error_response(response)
            
            # Return streaming response or complete response
            if stream:
                if stream_reasoning and enable_reasoning:
                    return self._process_streaming_response_with_reasoning(response)
                else:
                    return self._process_streaming_response(response)
            else:
                return response.json()
                
        except Exception as e:
            raise RuntimeError(f"Request failed: {str(e)}")
    
    def _handle_error_response(self, response: requests.Response) -> None:
        """Handle non-200 responses from the API."""
        error_msg = f"API request failed with status code: {response.status_code}"
        
        try:
            error_data = response.json()
            if "error" in error_data and "message" in error_data["error"]:
                error_msg += f" - {error_data['error']['message']}"
        except:
            error_msg += f" - {response.text}"
            
        raise RuntimeError(error_msg)
    
    def _process_streaming_response(self, response: requests.Response) -> Iterator[Dict[str, Any]]:
        """
        Process a streaming response from the API.
        
        Args:
            response: The streaming response
            
        Returns:
            An iterator that yields response chunks
        """
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    line = line[6:]  # Remove 'data: ' prefix
                    if line.strip() == '[DONE]':
                        break
                    try:
                        chunk = json.loads(line)
                        yield chunk
                    except json.JSONDecodeError:
                        pass
    
    def _process_streaming_response_with_reasoning(self, response: requests.Response) -> Iterator[Dict[str, str]]:
        """
        Process a streaming response that includes reasoning updates.
        
        Args:
            response: The streaming response that may include reasoning
            
        Returns:
            An iterator that yields dictionaries with 'type' (reasoning or content) 
            and the corresponding text chunk
        """
        # Keep track of accumulated reasoning and content
        reasoning_buffer = ""
        content_buffer = ""
        
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    line = line[6:]  # Remove 'data: ' prefix
                    if line.strip() == '[DONE]':
                        break
                    
                    try:
                        chunk = json.loads(line)
                        
                        # Process the chunk based on its content
                        if "choices" in chunk and len(chunk["choices"]) > 0:
                            message = chunk["choices"][0].get("delta", {})
                            
                            # Check if this is a reasoning chunk
                            if "reasoning" in message:
                                reasoning_text = message.get("reasoning", "")
                                if reasoning_text is not None:  # Explicitly check for None
                                    reasoning_buffer += reasoning_text
                                    yield {
                                        "type": "reasoning",
                                        "text": reasoning_text,
                                        "full_reasoning": reasoning_buffer
                                    }
                            
                            # Check if this is a content chunk
                            if "content" in message:
                                content_text = message.get("content", "")
                                if content_text is not None:  # Explicitly check for None
                                    content_buffer += content_text
                                    yield {
                                        "type": "content",
                                        "text": content_text,
                                        "full_content": content_buffer
                                    }
                    except json.JSONDecodeError:
                        pass
    
    def extract_content(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract essential content from a completion response.
        
        Args:
            response: The raw API response
            
        Returns:
            Dictionary with extracted content, reasoning (if available), and usage
        """
        result = {"content": None, "reasoning": None, "usage": None}
        
        if "choices" in response and len(response["choices"]) > 0:
            message = response["choices"][0]["message"]
            
            if "content" in message:
                result["content"] = message["content"]
                
            if "reasoning" in message:
                result["reasoning"] = message["reasoning"]
        
        if "usage" in response:
            result["usage"] = response["usage"]
            
        return result
    
    def process_streaming_response_callback(
        self,
        streaming_iterator: Iterator[Dict[str, Any]],
        content_callback: Callable[[str], None] = None,
        reasoning_callback: Callable[[str], None] = None,
        full_output: bool = False
    ) -> Dict[str, str]:
        """
        Process a streaming response with optional callbacks for content and reasoning.
        
        Args:
            streaming_iterator: Iterator returned from generate_response with stream=True
            content_callback: Optional callback function to process content chunks
            reasoning_callback: Optional callback function to process reasoning chunks
            full_output: Whether to return the full accumulated text (True) or just the final state (False)
            
        Returns:
            Dictionary with full content and reasoning (if any)
        """
        full_content = ""
        full_reasoning = ""
        
        # Check if this is a reasoning-enabled stream
        is_reasoning_stream = False
        
        for chunk in streaming_iterator:
            # Handle reasoning-enabled streaming format
            if isinstance(chunk, dict) and "type" in chunk:
                is_reasoning_stream = True
                
                if chunk["type"] == "reasoning" and reasoning_callback:
                    text = chunk["text"]
                    if text is not None:
                        reasoning_callback(text)
                        # Update full_reasoning from the full_reasoning in the chunk or append the text
                        if "full_reasoning" in chunk and chunk["full_reasoning"] is not None:
                            full_reasoning = chunk["full_reasoning"]
                        else:
                            full_reasoning += text
                
                elif chunk["type"] == "content" and content_callback:
                    text = chunk["text"]
                    if text is not None:
                        content_callback(text)
                        # Update full_content from the full_content in the chunk or append the text
                        if "full_content" in chunk and chunk["full_content"] is not None:
                            full_content = chunk["full_content"]
                        else:
                            full_content += text
            
            # Handle regular streaming format
            elif not is_reasoning_stream and "choices" in chunk and len(chunk["choices"]) > 0:
                delta = chunk["choices"][0].get("delta", {})
                
                if "content" in delta and content_callback:
                    content_piece = delta.get("content", "")
                    if content_piece is not None:  # Explicit check for None
                        full_content += content_piece
                        content_callback(content_piece)
        
        return {
            "content": full_content,
            "reasoning": full_reasoning
        }


# Helper functions for convenience

def create_client(api_key: str) -> LLMClient:
    """Create a new LLM client instance with the given API key."""
    return LLMClient(api_key)

def send_message(
    client: LLMClient,
    content: str,
    system_message: Optional[str] = None,
    enable_reasoning: bool = False,
    stream: bool = False,
    stream_reasoning: bool = False,
    **kwargs
) -> Union[Dict[str, Any], Iterator[Dict[str, Any]]]:
    """
    Convenience method to send a user message.
    
    Args:
        client: The LLM client instance
        content: The user message content
        system_message: Optional system message
        enable_reasoning: Whether to enable reasoning
        stream: Whether to stream the response
        stream_reasoning: Whether to stream the reasoning process
        **kwargs: Additional parameters for the generate_response method
        
    Returns:
        Response from the LLM
    """
    messages = []
    
    if system_message:
        messages.append({"role": "system", "content": system_message})
        
    messages.append({"role": "user", "content": content})
    
    return client.generate_response(
        messages=messages,
        enable_reasoning=enable_reasoning,
        stream=stream,
        stream_reasoning=stream_reasoning,
        **kwargs
    ) 