"""
Pinecone client for RAG (Retrieval Augmented Generation).
"""
import os
import logging
from typing import List, Dict, Any, Optional
import pinecone
from dotenv import load_dotenv
from retry import retry
import requests

logger = logging.getLogger(__name__)

class PineconeClient:
    """Client for interacting with Pinecone vector database."""
    
    def __init__(self, index_name: Optional[str] = None):
        """Initialize Pinecone client and connect to index.
        
        Args:
            index_name: Optional name of the Pinecone index to connect to.
                        If not provided, uses PINECONE_INDEX_NAME from environment.
        """
        load_dotenv()
        
        # Get configuration from environment
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = index_name or os.getenv("PINECONE_INDEX_NAME", "cs101-rag")
        self.environment = os.getenv("PINECONE_ENVIRONMENT")
        
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY is not set in environment variables")
        
        self.client = None
        self.index = None
        self.dimension = None
        self.initialized = False
        
        # Initialize immediately
        self._initialize()
    
    def _initialize(self):
        """Initialize the Pinecone client and connect to index."""
        try:
            # Initialize Pinecone with new client-based API (v6.0+)
            self.client = pinecone.Pinecone(api_key=self.api_key)
            
            # Connect to index
            self.index = self.client.Index(self.index_name)
            
            # Get index stats
            stats = self.index.describe_index_stats()
            self.dimension = stats.get("dimension")
            self.total_vectors = stats.get("total_vector_count", 0)
            
            logger.info(f"Connected to Pinecone index '{self.index_name}'")
            logger.info(f"Index dimension: {self.dimension}, total vectors: {self.total_vectors}")
            
            self.initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {str(e)}")
            raise
    
    def switch_index(self, index_name: str):
        """Switch to a different index.
        
        Args:
            index_name: Name of the Pinecone index to switch to.
        """
        if not self.client:
            raise ValueError("Pinecone client not initialized")
        
        try:
            self.index_name = index_name
            self.index = self.client.Index(index_name)
            
            # Get index stats
            stats = self.index.describe_index_stats()
            self.dimension = stats.get("dimension")
            self.total_vectors = stats.get("total_vector_count", 0)
            
            logger.info(f"Switched to Pinecone index '{index_name}'")
            logger.info(f"Index dimension: {self.dimension}, total vectors: {self.total_vectors}")
            
            return True
        except Exception as e:
            logger.error(f"Failed to switch to index '{index_name}': {str(e)}")
            return False
    
    @retry(tries=3, delay=2, backoff=2)
    def query(self, vector: List[float], top_k: int = 5, namespace: str = "") -> List[Dict[str, Any]]:
        """Query the Pinecone index for similar vectors.
        
        Args:
            vector: The vector to search for similar vectors.
            top_k: Number of results to return.
            namespace: Optional namespace to search in.
            
        Returns:
            List of dictionaries containing id, score, metadata, and content.
        """
        if not self.initialized:
            logger.error("Pinecone client not initialized")
            return []
        
        try:
            response = self.index.query(
                vector=vector,
                top_k=top_k,
                include_metadata=True,
                include_values=False,
                namespace=namespace
            )
            
            matches = response.get("matches", [])
            logger.info(f"Retrieved {len(matches)} matches from Pinecone index '{self.index_name}'")
            
            # Format the results
            results = []
            for match in matches:
                result = {
                    "id": match.get("id"),
                    "score": match.get("score"),
                    "metadata": match.get("metadata", {})
                }
                
                # Extract content if available
                if "text" in result["metadata"]:
                    result["content"] = result["metadata"]["text"]
                elif "content" in result["metadata"]:
                    result["content"] = result["metadata"]["content"]
                elif "chunk_text" in result["metadata"]:
                    result["content"] = result["metadata"]["chunk_text"]
                else:
                    result["content"] = f"Document ID: {result['id']}"
                
                results.append(result)
            
            return results
        except Exception as e:
            logger.error(f"Error querying Pinecone: {str(e)}")
            return []
    
    @retry(tries=3, delay=2, backoff=2)
    def query_by_text(self, text_query: str, top_k: int = 5, namespace: str = "") -> List[Dict[str, Any]]:
        """Query the Pinecone index using text input with integrated embeddings.
        
        Args:
            text_query: The text query to search for similar documents.
            top_k: Number of results to return.
            namespace: Optional namespace to search in.
            
        Returns:
            List of dictionaries containing id, score, metadata, and content.
        """
        if not self.initialized:
            logger.error("Pinecone client not initialized")
            return []
            
        try:
            logger.info(f"Querying index '{self.index_name}' in namespace '{namespace}' with text: '{text_query[:50]}...'")
            
            response = self.index.search(
                namespace=namespace,
                query={
                    "inputs": {"text": text_query},
                    "top_k": top_k
                }
                # include_metadata=True # Removed: This caused an error, metadata seems included by default in hit['fields']
                # include_values=False # We don't need the vectors themselves
            )
            
            # The response structure is slightly different from the docs example for search
            # It seems 'result' might be top-level or nested, let's check common patterns
            if 'result' in response and 'hits' in response['result']:
                hits = response['result']['hits']
            elif 'hits' in response: # Check if 'hits' is top-level
                 hits = response['hits']
            else:
                 logger.warning(f"Could not find 'hits' in search response: {response}")
                 hits = []

            logger.info(f"Retrieved {len(hits)} matches from Pinecone using text query")
            
            # Format the results to match the structure expected by downstream functions
            results = []
            for hit in hits:
                metadata_fields = hit.get("fields", {})
                content = ""
                
                # Extract content based on common keys, prioritizing 'chunk_text'
                if "chunk_text" in metadata_fields:
                    content = metadata_fields["chunk_text"]
                elif "text" in metadata_fields:
                    content = metadata_fields["text"]
                elif "content" in metadata_fields:
                    content = metadata_fields["content"]
                else:
                    content = f"Document ID: {hit.get('_id', 'N/A')}"

                result = {
                    "id": hit.get("_id"),
                    "score": hit.get("_score"),
                    "metadata": metadata_fields,
                    "content": content # Add the extracted content here
                }
                results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Error querying Pinecone with text using self.index.search: {str(e)}")
            # Optionally log the full exception for debugging
            # logger.exception("Detailed error during Pinecone text query:")
            return []
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the Pinecone index.
        
        Returns:
            Dictionary containing index statistics.
        """
        if not self.initialized:
            return {"status": "not initialized"}
        
        try:
            stats = self.index.describe_index_stats()
            return {
                "dimension": stats.get("dimension"),
                "total_vectors": stats.get("total_vector_count", 0),
                "namespaces": stats.get("namespaces", {}),
                "status": "active",
                "index_name": self.index_name
            }
        except Exception as e:
            logger.error(f"Error getting Pinecone stats: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def list_indexes(self) -> List[str]:
        """List all available indexes.
        
        Returns:
            List of index names.
        """
        if not self.client:
            logger.error("Pinecone client not initialized")
            return []
        
        try:
            indexes = self.client.list_indexes()
            return indexes
        except Exception as e:
            logger.error(f"Error listing Pinecone indexes: {str(e)}")
            return []


def get_course_index_name(course_id: str) -> str:
    """Helper function to get the Pinecone index name for a course.
    
    Args:
        course_id: The course ID to get the index name for.
        
    Returns:
        The Pinecone index name for the course.
    """
    # Convert course ID to index name format 
    # Example: "CS101" -> "cs101-rag"
    return f"{course_id.lower()}-rag" 