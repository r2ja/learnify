import logging
import sys
import os

# Assuming the script is run from /home/r4ja/Desktop/Agent(v0.8)/
try:
    # Import directly from the utility subdirectory
    from utility.pinecone_client import PineconeClient
except ImportError as e:
    print(f"Error: Could not import PineconeClient from utility.pinecone_client: {e}")
    print("Make sure the script is run from /home/r4ja/Desktop/Agent(v0.8)/ and utility/pinecone_client.py exists.")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Tests the PineconeClient."""
    test_index_name = "cs100-rag"
    test_namespace = "cs101-namespace" # From the screenshot
    test_query = "Hello world"
    test_model = "llama-text-embed-v2" # From the screenshot
    top_k_results = 5

    logger.info(f"Attempting to initialize PineconeClient for index: {test_index_name}")

    try:
        # Initialize the client with the specified index name
        # It will load API key from .env automatically (ensure .env is in the script's directory or accessible)
        client = PineconeClient(index_name=test_index_name)

        if not client.initialized:
            logger.error("Pinecone client failed to initialize.")
            return

        logger.info("Pinecone client initialized successfully.")

        # Get and print index stats
        logger.info("Fetching index stats...")
        stats = client.get_stats()
        logger.info(f"Index Stats: {stats}")

        # Perform a text query
        logger.info(f"Performing text query: '{test_query}' in namespace '{test_namespace}' using model '{test_model}' (top {top_k_results})")
        query_results = client.query_by_text(
            text_query=test_query,
            model_name=test_model,
            top_k=top_k_results,
            namespace=test_namespace
        )

        if query_results:
            logger.info(f"Query returned {len(query_results)} results:")
            for i, result in enumerate(query_results):
                logger.info(f"  Result {i+1}:")
                logger.info(f"    ID: {result.get('id')}")
                logger.info(f"    Score: {result.get('score'):.4f}")
                # logger.info(f"    Content: {result.get('content')[:100]}...") # Show partial content
                logger.info(f"    Metadata: {result.get('metadata')}")
        else:
            logger.warning("Query returned no results.")

    except ValueError as ve:
        logger.error(f"Configuration error: {ve}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}", exc_info=True)

if __name__ == "__main__":
    main() 