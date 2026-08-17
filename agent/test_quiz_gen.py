import os
import sys
import logging
import json
from typing import Dict, List, Any, Optional

# Add the current directory to sys.path to allow importing from agent and utility
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from utility.llm_client import LLMClient
    from utility.pinecone_client import PineconeClient
    # Ensure dotenv is loaded
    from dotenv import load_dotenv
    load_dotenv()
except ImportError as e:
    print(f"Error: Could not import utility components: {e}")
    print("Make sure the script is run from /home/r4ja/Desktop/Agent(v0.8)/ and all dependencies are installed.")
    sys.exit(1)
except Exception as e:
    print(f"An unexpected error occurred during import: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("test_quiz_gen")

# --- Mock Data (Simulating API Input) ---
TEST_USER_ID = "quiz_user_123"
TEST_COURSE_ID = "CS101" # This will determine index/namespace
TEST_CHAPTER_ID = "3"
TEST_LEARNING_PROFILE = {"style": "practical", "depth": "intermediate"}

MOCK_CHAPTER_TITLE = "Programming Basics: Variables, Data Types, and Operators"
MOCK_COURSE_DESCRIPTION = "A foundational course introducing the basic concepts and principles of computer programming."
MOCK_CHAPTER_CONTENT = """
Variables are essential components in programming that act as containers for storing and manipulating data.
They allow programmers to work with dynamic values that can change during program execution. 

In most programming languages, variables must be declared with a specific data type, which determines what kind of data the variable can hold.
Common data types include Integers (int), Floating-point numbers (float), Strings (str), and Booleans (bool).

Operators are symbols that perform operations on variables and values, such as Arithmetic (+, -, *), Assignment (=, +=), Comparison (==, >), and Logical (and, or).

Variable naming conventions are important: use descriptive names, follow snake_case in Python, don't start with numbers, and avoid reserved keywords.
"""

MOCK_CHAT_HISTORY = [
    {
        "role": "user",
        "content": "What are the main arithmetic operators?"
    },
    {
        "role": "assistant",
        "content": "The main arithmetic operators are addition (+), subtraction (-), multiplication (*), division (/), modulo (%), and exponentiation (**)."
    },
    {
        "role": "user",
        "content": "Can variable names contain dashes?"
    },
    {
        "role": "assistant",
        "content": "No, variable names typically cannot contain dashes. In Python, you should use underscores instead (snake_case), like `variable_name`."
    }
]

# --- Helper Function (Copied/Adapted from supervisor.py) ---
def format_rag_context(context_chunks: List[Dict[str, Any]]) -> str:
    """
    Format RAG context chunks into a single context string.
    
    Args:
        context_chunks: List of context chunks from Pinecone
        
    Returns:
        Formatted context string
    """
    if not context_chunks:
        return "No relevant context found."
    
    formatted_chunks = []
    for i, chunk in enumerate(context_chunks):
        content = chunk.get("content", "")
        metadata = chunk.get("metadata", {})
        source = metadata.get("filename", "") # Use filename as source from setup script
        
        formatted_chunk = f"[CONTEXT CHUNK {i+1}]"
        if source:
            formatted_chunk += f" Source: {source}"
        
        formatted_chunk += f"\n{content}\n"
        formatted_chunks.append(formatted_chunk)
    
    return "\n".join(formatted_chunks)

# --- Quiz Generation Function ---
def generate_quiz_json(
    user_id: str,
    course_id: str,
    chapter_id: str,
    learning_profile: Dict[str, str],
    chapter_title: str,
    chapter_content: str,
    course_description: str,
    chat_history: List[Dict[str, str]],
    num_questions: int = 5
) -> Optional[List[Dict[str, Any]]]:
    """Generates quiz JSON using LLM, incorporating RAG context."""
    logger.info(f"Starting quiz generation for Course: {course_id}, Chapter: {chapter_id}")

    # 1. Fetch RAG Context from Pinecone
    rag_context = ""
    try:
        logger.info("Fetching RAG context from Pinecone...")
        # Determine index/namespace dynamically
        if course_id.upper() == "CS101":
            target_index_name = "cs100-rag"
            target_namespace = "cs101-namespace"
        else:
            logger.error(f"Pinecone mapping not configured for course_id: {course_id}")
            # Decide how to handle - fail, or proceed without RAG?
            # For testing, let's proceed without RAG if mapping fails.
            target_index_name = None 

        if target_index_name:
            pinecone_client = PineconeClient(index_name=target_index_name)
            # Create a simple query based on chapter title
            context_query = f"Key concepts from {chapter_title}"
            context_chunks = pinecone_client.query_by_text(
                text_query=context_query,
                top_k=3, # Fetch fewer chunks for quiz context
                namespace=target_namespace
            )
            rag_context = format_rag_context(context_chunks)
            logger.info(f"Fetched {len(context_chunks)} context chunks.")
        else:
             logger.warning("Proceeding with quiz generation without RAG context.")
             rag_context = "No RAG context available for this course."

    except Exception as e:
        logger.error(f"Error fetching RAG context: {e}", exc_info=True)
        rag_context = "Error retrieving context. Proceeding without it."

    # 2. Prepare Prompts for LLM
    system_prompt = (
        "You are an expert quiz generator. Output *only* valid JSON in this schema:\n"
        "[\n"
        "  {\n"
        '    "questionId": "q1",\n' # Generate unique IDs like q1, q2 etc.
        '    "prompt": "What is 2+2?",\n'
        '    "options": ["1","2","3","4"],\n'
        '    "correctIndex": 3,\n' # Zero-based index of the correct option
        '    "explanation": "Brief explanation why the answer is correct."\n' # Added explanation field
        "  },\n"
        "  ...\n"
        "]\n"
        "\nEnsure the generated JSON is a valid list of question objects. Do not include any other text."
    )

    # Format chat history
    conversation_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])

    user_prompt = (
        f"Generate exactly {num_questions} multiple-choice quiz questions based on the provided materials "
        f"for course '{course_id}', chapter '{chapter_id}: {chapter_title}'.\n"
        f"Target the quiz towards a student with learning profile: {json.dumps(learning_profile)}.\n\n"
        f"CHAPTER CONTENT:\n---\n{chapter_content}\n---\n\n"
        f"RECENT CONVERSATION HISTORY:\n---\n{conversation_text}\n---\n\n"
        f"ADDITIONAL CONTEXT FROM COURSE DOCUMENTS (Use this to inform questions):\n---\n{rag_context}\n---\n\n"
        f"Instructions:\n"
        f"- Create questions that test understanding of the chapter content, conversation, and context.\n"
        f"- Each question must have exactly 4 options.\n"
        f"- Include a brief explanation for the correct answer for each question.\n"
        f"- Ensure questionId is unique for each question (e.g., q1, q2...).\n"
        f"- Ensure correctIndex is the zero-based index (0-3) of the correct option in the options list.\n"
        f"- Output ONLY the valid JSON list. No introductory text, comments, or markdown.\n"
    )

    # 3. Call LLM
    try:
        logger.info("Calling LLM for quiz generation...")
        llm_client = LLMClient()
        response = llm_client.generate_response(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5, # Slightly lower temp for more focused JSON generation
            max_tokens=2500, # Adjust as needed
            stream=False # We need the full response to parse JSON
        )

        llm_output = llm_client.extract_content(response)["content"]
        if not llm_output:
            logger.error("LLM returned empty content.")
            return None

        # 4. Parse JSON Response
        logger.info("Parsing LLM response...")
        # Clean potential markdown fences
        if llm_output.strip().startswith("```json"):
            llm_output = llm_output.strip()[7:-3].strip()
        elif llm_output.strip().startswith("```"):
             llm_output = llm_output.strip()[3:-3].strip()
        
        # Find the start and end of the JSON list
        json_start = llm_output.find("[")
        json_end = llm_output.rfind("]") + 1

        if json_start != -1 and json_end != -1:
            json_string = llm_output[json_start:json_end]
            quiz_data = json.loads(json_string)
            # Basic validation
            if isinstance(quiz_data, list) and all(isinstance(q, dict) for q in quiz_data):
                 # Add unique IDs if missing (simple approach)
                for i, q in enumerate(quiz_data):
                    if "questionId" not in q:
                        q["questionId"] = f"q{i+1}"
                logger.info(f"Successfully parsed {len(quiz_data)} quiz questions.")
                return quiz_data
            else:
                logger.error(f"Parsed JSON is not a list of dictionaries: {type(quiz_data)}")
                logger.debug(f"Raw LLM Output:\n{llm_output}")
                return None
        else:
            logger.error("Could not find valid JSON list in LLM output.")
            logger.debug(f"Raw LLM Output:\n{llm_output}")
            return None

    except json.JSONDecodeError as e:
        logger.error(f"JSON Decode Error: {e}")
        logger.debug(f"Raw LLM Output:\n{llm_output}")
        return None
    except Exception as e:
        logger.error(f"Error during LLM call or parsing: {e}", exc_info=True)
        return None

# --- Main Execution --- 
if __name__ == "__main__":
    logger.info("--- Starting Quiz Generation Test --- ")

    # Ensure API keys are available
    if not os.getenv("PINECONE_API_KEY") or not os.getenv("OPENROUTER_API_KEY"):
        logger.error("API keys (PINECONE_API_KEY, OPENROUTER_API_KEY) not found in .env. Please ensure .env is present.")
    else:
        # Generate the quiz
        generated_quiz = generate_quiz_json(
            user_id=TEST_USER_ID,
            course_id=TEST_COURSE_ID,
            chapter_id=TEST_CHAPTER_ID,
            learning_profile=TEST_LEARNING_PROFILE,
            chapter_title=MOCK_CHAPTER_TITLE,
            chapter_content=MOCK_CHAPTER_CONTENT,
            course_description=MOCK_COURSE_DESCRIPTION,
            chat_history=MOCK_CHAT_HISTORY,
            num_questions=5
        )

        # Print the result
        if generated_quiz:
            print("\n--- Generated Quiz JSON --- ")
            print(json.dumps(generated_quiz, indent=2))
            # Optionally save to file
            # with open("generated_quiz_test.json", "w") as f:
            #     json.dump(generated_quiz, f, indent=2)
            # logger.info("Saved quiz to generated_quiz_test.json")
        else:
            print("\n--- Quiz Generation Failed --- ")

    logger.info("--- Quiz Generation Test Finished --- ") 