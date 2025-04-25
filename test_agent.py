import os
import sys
import logging
import json
import asyncio
from typing import Dict, Any

# Add the current directory to sys.path to allow importing from agent and utility
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from agent.run_chat_agent import run_chat_agent, run_chat_agent_async
    # Ensure dotenv is loaded if run_chat_agent relies on it implicitly via its imports
    from dotenv import load_dotenv
    load_dotenv()
except ImportError as e:
    print(f"Error: Could not import agent components: {e}")
    print("Make sure the script is run from /home/r4ja/Desktop/Agent(v0.8)/ and all dependencies are installed.")
    sys.exit(1)
except Exception as e:
    print(f"An unexpected error occurred during import: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("test_agent")

# --- Define Stream Callback ---
def simple_stream_callback(chunk: Dict[str, Any]):
    """Processes and prints chunks received from the agent stream."""
    chunk_type = chunk.get("type", "unknown")
    content = chunk.get("content", "") # Default for text/tool
    reasoning_text = chunk.get("text", "") # Used if type is reasoning

    if chunk_type == "text":
        # Print text content directly to simulate continuous streaming output
        print(content, end="", flush=True)
    elif chunk_type == "reasoning":
        # Print reasoning steps, clearly marked
        print(f"\n[REASONING] {reasoning_text}", end="", flush=True)
    elif chunk_type == "error":
        print(f"\n--- Stream Error --- ", flush=True)
        print(json.dumps(content, indent=2), flush=True)
        print("--- End Error ---\n", flush=True)
    elif chunk_type in ["img_gen", "mermaid_gen"]:
        # Print tool usage/results clearly demarcated
        print(f"\n--- Tool Invoked: {chunk_type} --- ", flush=True)
        # Content might be markdown string (img, mermaid) or dict/list (quiz before formatting)
        # The supervisor currently formats tool output *before* yielding,
        # so content here should be the final markdown string.
        print(content, flush=True)
        print(f"--- End {chunk_type} Output ---\n", flush=True)
    else:
        # Fallback for any other chunk types
        print(f"\n--- Received Chunk (Type: {chunk_type}) --- ", flush=True)
        print(json.dumps(chunk, indent=2), flush=True)
        print("--- End Chunk ---\n", flush=True)

# --- Main Test Function ---
def run_test():
    logger.info("--- Starting Agent Test --- ")

    # --- Test Case: Query with Course ID (Triggers RAG) ---
    logger.info("--- Running Test Case: Query with Course ID (Sync) --- ")
    test_user_id = "test_user_sync_456"
    # Use a course ID likely associated with the index/namespace used in setup/previous tests
    test_course_id = "CS101"
    # test_prompt = "Explain the concept of polymorphism in C++ using an example."
    test_prompt = "مجھے C++ میں پولیمورفزم کے تصور کی وضاحت ایک مثال کے ساتھ کریں۔" # Urdu prompt
    test_profile = {"style": "conceptual", "depth": "beginner", "interaction": "examples"}
    # test_language = "english"
    test_language = "urdu" # Set language to Urdu
    test_chapter_id = None # Or set a chapter like "5"

    # Ensure API keys are loaded (should happen via load_dotenv above)
    if not os.getenv("PINECONE_API_KEY") or not os.getenv("OPENROUTER_API_KEY"):
        logger.error("API keys (PINECONE_API_KEY, OPENROUTER_API_KEY) not found in .env. Please ensure .env is present.")
        return

    try:
        logger.info(f"Calling run_chat_agent for course '{test_course_id}' with prompt: '{test_prompt}'")
        logger.info("Streaming output will follow:")

        # Call the agent - streaming output goes to the callback
        result = run_chat_agent(
            user_id=test_user_id,
            course_id=test_course_id,
            prompt=test_prompt,
            learning_profile=test_profile,
            language=test_language,
            chapter_id=test_chapter_id,
            stream=True, # This will be the default/only way soon
            stream_callback=simple_stream_callback
        )

        print("\n--- Stream Complete --- ") # Newline after streaming finishes
        logger.info(f"Agent function call completed. Return value: {result}")

    except Exception as e:
        logger.error(f"Error during agent execution: {e}", exc_info=True)

    logger.info("--- Agent Test Finished --- ")

# --- Async Test Function (Optional) ---
async def run_test_async():
    logger.info("--- Starting Agent Test (Async) --- ")

    # --- Test Case: Query with Course ID (Triggers RAG) ---
    logger.info("--- Running Test Case: Query with Course ID (Async) --- ")
    test_user_id = "test_user_async_789"
    test_course_id = "CS101"
    test_prompt = "Generate a mermaid diagram showing a simple class hierarchy for vehicles."
    test_profile = {"style": "visual", "depth": "intermediate"}
    test_language = "english"
    test_chapter_id = None

    if not os.getenv("PINECONE_API_KEY") or not os.getenv("OPENROUTER_API_KEY"):
        logger.error("API keys not found for async test.")
        return

    try:
        logger.info(f"Calling run_chat_agent_async for course '{test_course_id}' with prompt: '{test_prompt}'")
        logger.info("Streaming output will follow:")

        # Call the async agent version
        result = await run_chat_agent_async(
            user_id=test_user_id,
            course_id=test_course_id,
            prompt=test_prompt,
            learning_profile=test_profile,
            language=test_language,
            chapter_id=test_chapter_id,
            stream=True,
            stream_callback=simple_stream_callback
        )

        print("\n--- Async Stream Complete --- ")
        logger.info(f"Async agent function call completed. Return value: {result}")

    except Exception as e:
        logger.error(f"Error during async agent execution: {e}", exc_info=True)

    logger.info("--- Async Agent Test Finished --- ")


if __name__ == "__main__":
    run_test()
    # Uncomment to run the async test as well
    # asyncio.run(run_test_async()) 