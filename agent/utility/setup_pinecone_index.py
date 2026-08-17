#!/usr/bin/env python3
"""
Script to set up Pinecone index with integrated embeddings and upsert CS101 book content.

This script:
1. Removes existing cs101-rag index if it exists
2. Creates new cs101-rag index with integrated embeddings
3. Processes PDF books from the specified directory
4. Chunks the text content appropriately
5. Upserts chunks to the Pinecone index with relevant metadata

Usage:
    python setup_pinecone_index.py          # Create index and process all files
    python setup_pinecone_index.py --resume # Skip index creation and resume processing
"""
import os
import sys
import glob
import uuid
import logging
import time
import argparse
from typing import List, Dict, Any
import pinecone
from dotenv import load_dotenv
import PyPDF2
import re

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
PDF_DIR = "/home/r4ja/Desktop/RAG-Dataset/cs101-pdfs"
INDEX_NAME = "cs100-rag"
CHUNK_SIZE = 1000  # Characters per chunk
CHUNK_OVERLAP = 200  # Character overlap between chunks
COURSE_ID = "CS101"  # Course identifier

def initialize_pinecone() -> pinecone.Pinecone:
    """Initialize Pinecone client and return it."""
    load_dotenv()
    api_key = os.getenv("PINECONE_API_KEY")
    environment = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
    if not api_key:
        raise ValueError("PINECONE_API_KEY not found in environment variables")
    
    logger.info(f"Initializing Pinecone with environment: {environment}")
    return pinecone.Pinecone(api_key=api_key)

def recreate_index(pc: pinecone.Pinecone) -> None:
    """Delete existing index if it exists and create a new one with integrated embeddings."""
    # Check if index exists and delete it
    indexes = pc.list_indexes()
    if INDEX_NAME in indexes:
        logger.info(f"Deleting existing index '{INDEX_NAME}'")
        pc.delete_index(INDEX_NAME)
        # Wait for deletion to complete
        time.sleep(10)
    
    try:
        # Create new index with integrated embedding
        logger.info(f"Creating new index '{INDEX_NAME}' with integrated embeddings")
        pc.create_index_for_model(
            name=INDEX_NAME,
            cloud="aws",
            region="us-east-1",
            embed={
                "model": "llama-text-embed-v2",
                "field_map": {"text": "chunk_text"}
            }
        )
        
        logger.info(f"Index '{INDEX_NAME}' created successfully")
        time.sleep(10)  # Allow time for index to fully initialize
    except Exception as e:
        logger.error(f"Error creating index: {str(e)}")
        raise

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text content from a PDF file."""
    logger.info(f"Extracting text from {pdf_path}")
    
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n\n"
                
        return text
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path}: {str(e)}")
        return ""

def clean_text(text: str) -> str:
    """Clean the extracted text by removing extra whitespace and other issues."""
    # Replace multiple newlines with single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E\n]', '', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks of specified size."""
    if not text:
        return []
    
    chunks = []
    text_length = len(text)
    start = 0
    
    while start < text_length:
        # Determine end of chunk
        end = min(start + chunk_size, text_length)
        
        # If not at the end of text, try to find a good break point
        if end < text_length:
            # Look for a period, question mark, or newline to end the chunk
            for i in range(min(50, end - start)):
                if text[end - i - 1] in ['.', '?', '!', '\n']:
                    end = end - i
                    break
        
        # Extract the chunk
        chunk = text[start:end].strip()
        if chunk:  # Only add non-empty chunks
            chunks.append(chunk)
        
        # Move to next chunk with overlap
        start = end - overlap if end < text_length else text_length
    
    logger.info(f"Created {len(chunks)} chunks from text")
    return chunks

def get_metadata_from_filename(filename: str) -> Dict[str, str]:
    """Extract metadata from the PDF filename."""
    # Remove path and extension
    base_name = os.path.basename(filename)
    name_without_ext = os.path.splitext(base_name)[0]
    
    # Example parsing - adjust based on your actual filename format
    # For example, if filename is "Chapter1_Introduction_to_CS.pdf"
    parts = name_without_ext.split('_')
    
    metadata = {
        "course_id": COURSE_ID,
        "filename": base_name,
    }
    
    # Try to extract chapter info if available
    chapter_match = re.search(r'[Cc]hapter\s*(\d+)', name_without_ext)
    if chapter_match:
        metadata["chapter"] = chapter_match.group(1)
    
    # Extract a title from the filename by replacing underscores with spaces
    title = ' '.join(name_without_ext.replace('Chapter', '').replace('chapter', '').strip('_').split('_'))
    metadata["title"] = title
    
    return metadata

def upsert_chunks(pc: pinecone.Pinecone, chunks: List[str], metadata: Dict[str, str]) -> None:
    """Upsert text chunks to Pinecone index with metadata."""
    if not chunks:
        logger.warning("No chunks to upsert")
        return
    
    index = pc.Index(INDEX_NAME)
    records = []
    batch_size = 50  # Reduced from 96 to put less strain on rate limits
    
    for i, chunk in enumerate(chunks):
        # Create a unique ID for each chunk
        chunk_id = f"{metadata.get('filename', 'unknown')}_{i}"
        
        # Prepare record with chunk text and metadata
        record = {
            "_id": chunk_id,
            "chunk_text": chunk,
            **metadata,
            "chunk_index": i,
            "total_chunks": len(chunks)
        }
        
        records.append(record)
        
        # Upsert in smaller batches with longer delays to avoid rate limits
        if len(records) >= batch_size:
            success = False
            retries = 0
            max_retries = 5
            
            while not success and retries < max_retries:
                try:
                    logger.info(f"Upserting batch of {len(records)} chunks")
                    index.upsert_records("cs101-namespace", records)
                    success = True
                    logger.info(f"Successfully upserted batch {i//batch_size + 1}")
                    # Longer delay between batches (5 seconds) to avoid rate limits
                    time.sleep(5)
                except Exception as e:
                    retries += 1
                    if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                        wait_time = 30 * retries  # Exponential backoff
                        logger.warning(f"Rate limit hit. Waiting {wait_time} seconds before retry {retries}/{max_retries}")
                        time.sleep(wait_time)
                    else:
                        logger.error(f"Error upserting batch: {str(e)}")
                        raise
            
            if not success:
                logger.error(f"Failed to upsert batch after {max_retries} retries")
                raise Exception(f"Failed to upsert batch after {max_retries} retries")
            
            records = []
    
    # Upsert any remaining records
    if records:
        success = False
        retries = 0
        max_retries = 5
        
        while not success and retries < max_retries:
            try:
                logger.info(f"Upserting final batch of {len(records)} chunks")
                index.upsert_records("cs101-namespace", records)
                success = True
                logger.info("Successfully upserted final batch")
            except Exception as e:
                retries += 1
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    wait_time = 30 * retries  # Exponential backoff
                    logger.warning(f"Rate limit hit. Waiting {wait_time} seconds before retry {retries}/{max_retries}")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Error upserting final batch: {str(e)}")
                    raise
        
        if not success:
            logger.error(f"Failed to upsert final batch after {max_retries} retries")
            raise Exception(f"Failed to upsert final batch after {max_retries} retries")

def process_pdf_files(pc: pinecone.Pinecone, single_file: str = None) -> None:
    """Process PDF files in the specified directory.
    
    Args:
        pc: Pinecone client
        single_file: Optional path to a single file to process
    """
    # Process a single file if specified
    if single_file:
        if os.path.exists(single_file) and single_file.lower().endswith('.pdf'):
            logger.info(f"Processing single file: {single_file}")
            
            # Extract text from PDF
            text = extract_text_from_pdf(single_file)
            if not text:
                logger.warning(f"No text extracted from {single_file}")
                return
            
            # Clean text
            clean_content = clean_text(text)
            logger.info(f"Extracted and cleaned {len(clean_content)} characters from {single_file}")
            
            # Chunk text
            chunks = chunk_text(clean_content)
            
            # Get metadata
            metadata = get_metadata_from_filename(single_file)
            
            # Upsert to Pinecone
            upsert_chunks(pc, chunks, metadata)
            
            logger.info(f"Completed processing {single_file}")
            return
        else:
            logger.error(f"Specified file {single_file} does not exist or is not a PDF")
            return
    
    # Get all PDF files
    pdf_files = glob.glob(os.path.join(PDF_DIR, "*.pdf"))
    logger.info(f"Found {len(pdf_files)} PDF files to process")
    
    if not pdf_files:
        logger.warning(f"No PDF files found in {PDF_DIR}")
        return
    
    for pdf_file in pdf_files:
        logger.info(f"Processing {pdf_file}")
        
        # Extract text from PDF
        text = extract_text_from_pdf(pdf_file)
        if not text:
            logger.warning(f"No text extracted from {pdf_file}")
            continue
        
        # Clean text
        clean_content = clean_text(text)
        logger.info(f"Extracted and cleaned {len(clean_content)} characters from {pdf_file}")
        
        # Chunk text
        chunks = chunk_text(clean_content)
        
        # Get metadata
        metadata = get_metadata_from_filename(pdf_file)
        
        # Upsert to Pinecone
        upsert_chunks(pc, chunks, metadata)
        
        logger.info(f"Completed processing {pdf_file}")

def verify_index(pc: pinecone.Pinecone) -> None:
    """Verify the index is set up correctly and contains data."""
    index = pc.Index(INDEX_NAME)
    stats = index.describe_index_stats()
    
    total_vectors = stats.get("total_vector_count", 0)
    namespaces = stats.get("namespaces", {})
    
    logger.info(f"Index '{INDEX_NAME}' contains {total_vectors} total vectors")
    logger.info(f"Namespaces: {namespaces}")

def main() -> None:
    """Main function to set up index and process books."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Set up Pinecone index and ingest PDFs')
    parser.add_argument('--resume', action='store_true', help='Skip index creation and resume processing')
    parser.add_argument('--file', type=str, help='Process a single PDF file')
    args = parser.parse_args()
    
    try:
        logger.info("Starting Pinecone index setup and book ingestion")
        
        # Initialize Pinecone
        pc = initialize_pinecone()
        
        # Recreate index unless --resume flag is used
        if not args.resume:
            recreate_index(pc)
        else:
            logger.info(f"Skipping index creation, resuming with existing index '{INDEX_NAME}'")
            # Quick check that the index exists
            indexes = pc.list_indexes()
            if INDEX_NAME not in indexes:
                logger.error(f"Index '{INDEX_NAME}' not found. Cannot resume processing.")
                sys.exit(1)
        
        # Process PDF files
        process_pdf_files(pc, args.file)
        
        # Verify index
        verify_index(pc)
        
        logger.info("Completed Pinecone index setup and book ingestion")
    except Exception as e:
        logger.error(f"Error in main function: {str(e)}")

if __name__ == "__main__":
    main() 