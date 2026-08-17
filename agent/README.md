# Educational AI Agent (v0.8)

This project implements an AI agent designed as an educational assistant. It leverages Retrieval-Augmented Generation (RAG) to provide contextually relevant answers based on course materials stored in a Pinecone vector database. The agent supports streaming responses, reasoning, and tool usage (image and diagram generation).

## Architecture

The system consists of two main functional parts:

1.  **Chat Agent:** Handles conversational interactions. It uses RAG to fetch relevant context, incorporates user learning profiles, interacts with an LLM (via OpenRouter), supports streaming responses with reasoning steps, and can use tools (image/mermaid generation) to enhance explanations.
2.  **Quiz Generation:** A separate process (intended to be triggered by a dedicated API endpoint) that generates multiple-choice quizzes based on chapter content, conversation history, and RAG context. It returns quiz data in a structured JSON format.

## Features

-   **Retrieval-Augmented Generation (RAG):** Connects to Pinecone to retrieve relevant course content snippets based on the user's query and `course_id`.
-   **Streaming Responses:** Provides real-time, token-by-token output for chat interactions.
-   **Reasoning:** The LLM can optionally show its reasoning steps during streaming.
-   **Tool Use:** Can generate images (`<img_gen>`) and Mermaid diagrams (`<mermaid>`) within chat responses.
-   **Personalization:** Considers user's `learning_profile` when generating responses.
-   **Context-Aware:** Uses `course_id` and `chapter_id` to scope interactions.
-   **Language Support:** Configured for English and Urdu (via `language` parameter).
-   **Modular Design:** Uses LangGraph for agent workflow and separate utility clients for LLM and Pinecone.

## Setup

1.  **Prerequisites:** Python 3.8+ recommended.
2.  **Clone (Optional):** If you haven't already, clone the repository.
3.  **Dependencies:** Navigate to the project directory (`Agent(v0.8)`) and install required packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Environment Variables:** Create a `.env` file in the project root (`Agent(v0.8)/.env`) with your API keys:
    ```dotenv
    # Required API Keys
    OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    PINECONE_API_KEY="your-pinecone-api-key"
    
    # Optional: Pinecone Environment (defaults used if not set)
    # PINECONE_ENVIRONMENT="gcp-starter" 
    ```
    Replace placeholders with your actual keys.

## Pinecone Index Setup

Before running the agent or quiz generation for a specific course (like the default "CS101"), you need to set up the Pinecone index and ingest the course content.

1.  **Content Location:** The `utility/setup_pinecone_index.py` script currently expects PDF course materials to be located in `/home/r4ja/Desktop/RAG-Dataset/cs101-pdfs/`. **You MUST update this path** in the script if your PDFs are located elsewhere.
2.  **Run the Setup Script:** Execute the script from the project root (`Agent(v0.8)`):
    ```bash
    python utility/setup_pinecone_index.py
    ```
    *   This script will:
        *   Delete the index `cs100-rag` if it exists.
        *   Create a new index named `cs100-rag` configured for integrated embeddings with `llama-text-embed-v2`.
        *   Process all PDF files found in the specified directory.
        *   Chunk the text content.
        *   Upsert the chunks into the `cs101-namespace` within the `cs100-rag` index.
3.  **Resuming:** If the script is interrupted, you can try resuming without recreating the index:
    ```bash
    python utility/setup_pinecone_index.py --resume
    ```

## Running Tests

Two test scripts are provided:

1.  **`test_agent.py`:** Tests the main chat agent flow (RAG, streaming, reasoning, tools).
    ```bash
    python test_agent.py
    ```
    Observe the console output for logs, reasoning steps, and the streamed response.

2.  **`test_quiz_gen.py`:** Tests the separate quiz generation logic (RAG, LLM call for JSON).
    ```bash
    python test_quiz_gen.py
    ```
    Observe the console output for logs and the final generated quiz JSON.

## Core Components

-   **`agent/`**: Contains the core agent logic.
    -   `langgraph_config.py`: Defines the agent's state and workflow using LangGraph.
    -   `run_chat_agent.py`: Entry point function for running the chat agent.
    -   `supervisor.py`: Handles streaming orchestration, tool detection/execution, and system prompt creation.
    -   `tools/`: Contains implementations for tools (image, mermaid).
-   **`utility/`**: Contains client classes for external services.
    -   `llm_client.py`: Interfaces with the OpenRouter API for LLM calls.
    -   `pinecone_client.py`: Interfaces with the Pinecone API for vector database operations.
    -   `setup_pinecone_index.py`: Script for initializing the Pinecone index and ingesting data.
-   **`test_agent.py`**: Test script for the chat agent.
-   **`test_quiz_gen.py`**: Test script for quiz generation.
-   **`requirements.txt`**: Project dependencies.
-   **`.env`**: Stores API keys (requires manual creation).

## Integration with Next.js Backend

This Python agent system is designed to be called by a backend API, such as one built with Next.js.

### Calling Python from Next.js

There are two main approaches:

1.  **Direct Execution (`child_process`):**
    *   Use Node.js's `child_process.spawn` to execute the Python scripts (`run_chat_agent.py` logic wrapped in a runnable script, or the quiz generation logic).
    *   Pass input parameters (like `user_id`, `prompt`, etc.) as command-line arguments or via stdin.
    *   Capture stdout for responses. For streaming chat, you'll need to process stdout chunk by chunk.
    *   **Pros:** Simple for basic cases.
    *   **Cons:** Can be complex to manage dependencies, environment variables, error handling, and especially streaming reliably. Less scalable.

2.  **Python API Wrapper (Recommended):**
    *   Create a lightweight Python web server (e.g., using Flask or FastAPI) that wraps the agent functions (`run_chat_agent`, a refactored quiz generation function).
    *   The Next.js backend makes standard HTTP requests to this Python API.
    *   **Pros:** Cleaner separation, easier dependency management, standard HTTP communication, better scalability and error handling, simplifies streaming via HTTP streaming responses.
    *   **Cons:** Requires running a separate Python server process.

### Chat Endpoint (`/api/chat`)

*   **Next.js Request Body (Example):**
    ```json
    {
      "user_id": "user123",
      "course_id": "CS101",
      "chapter_id": "3", // Optional
      "prompt": "Explain polymorphism in C++",
      "learning_profile": {"style": "conceptual", "depth": "intermediate"},
      "language": "english",
      "chat_history": [
        {"role": "user", "content": "Previous question..."},
        {"role": "assistant", "content": "Previous answer..."}
      ]
    }
    ```
*   **Backend Logic:**
    1.  Receive the request.
    2.  Call the Python chat agent function (e.g., via API wrapper or `child_process`), passing the parameters.
    3.  **Handle Streaming:** The Python agent's `run_chat_agent` function uses a callback (`stream_callback` in the test) or yields chunks directly if wrapped in an API.
        *   The Next.js backend needs to receive these chunks.
        *   Use **Server-Sent Events (SSE)** to stream these chunks to the frontend. Each chunk from Python should be sent as an SSE `data` event.
        *   The chunks will have the structure: `{type: 'text'/'reasoning'/'img_gen'/'mermaid_gen'/'error', content: ...}`. The frontend reconstructs the message flow based on these types.
*   **Frontend Logic:** The frontend establishes an SSE connection to `/api/chat` and appends incoming `data` payloads to the chat display, rendering text, reasoning, images (using markdown), and Mermaid diagrams (using a library like `mermaid.js`) appropriately.

### Quiz Generation Endpoint (`/api/quiz`)

*   **Next.js Request Body (Example):**
    ```json
    {
      "user_id": "user123",
      "course_id": "CS101",
      "chapter_id": "3",
      "learning_profile": {"style": "practical", "depth": "intermediate"},
      "chat_history": [
        {"role": "user", "content": "..."},
        {"role": "assistant", "content": "..."}
      ]
      // Chapter content might be passed, or the Python side fetches it based on ID
    }
    ```
*   **Backend Logic:**
    1.  Receive the request.
    2.  Call the Python quiz generation function (refactored from `test_quiz_gen.py`, e.g., `generate_quiz_json`), passing necessary parameters.
    3.  This Python function performs RAG, calls the LLM (non-streaming), parses the JSON response.
    4.  The Python function returns the list of quiz question dictionaries (JSON).
    5.  The Next.js backend receives this JSON list and returns it directly in the API response.
*   **Frontend Logic:** The frontend makes a standard POST request to `/api/quiz` and receives the JSON array of questions, which it can then render as an interactive quiz.

## Environment Variables Summary

Make sure the following variables are set in your `.env` file:

-   `OPENROUTER_API_KEY`: Your API key for OpenRouter.
-   `PINECONE_API_KEY`: Your API key for Pinecone.
-   `PINECONE_ENVIRONMENT` (Optional): Your Pinecone environment name (if not using the default). 