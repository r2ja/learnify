# Testing the LangGraph Agent System

This document describes how to test the LangGraph-based agent system for the Learnify tutorial platform.

## Prerequisites

1. Make sure you have all dependencies installed:
   ```bash
   pip install -r requirements.txt
   ```

2. Ensure your environment variables are set:
   - Create a `.env` file in the root directory with the following:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   PINECONE_API_KEY=your_pinecone_key_here
   PINECONE_ENVIRONMENT=your_pinecone_env
   PINECONE_INDEX_NAME=your_index_name
   ```

## Running the Basic Test

The basic test demonstrates how the agent processes a prompt and generates a streaming response with tool execution:

```bash
python test_agent_stream.py
```

This will:
1. Create a test request with a sample user, course, and learning profile
2. Send a prompt about sorting algorithms to the agent
3. Process the streaming response and display it, including any tool outputs
4. Show how long the request took to process

## API Integration Example

To run the more comprehensive API integration example:

```bash
python api_integration_example.py
```

This example:
1. Simulates a Next.js API route receiving a request
2. Processes the request through the agent
3. Formats the response as Server-Sent Events for streaming
4. Demonstrates saving chat sessions to a database (simulated)

## Next.js Integration

The file `nextjs_api_example.txt` contains an example of how to implement the Next.js API route that would call the Python agent. This isn't executable code, but serves as a template for implementation.

Key components:
- User authentication with JWT
- Request validation
- Creating a child process to run the Python agent
- Converting the Python process output to a web stream
- Error handling

## Troubleshooting

If you encounter issues:

1. Check your environment variables are correctly set
2. Ensure the Python virtual environment is activated
3. Verify that the required dependencies are installed
4. Look for any error messages in the console output 