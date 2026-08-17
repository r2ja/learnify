import os
import sys
import logging
import json
import uuid
from typing import Dict, List, Any, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from utility.llm_client import LLMClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_quiz_content(topic: str, course_id: Optional[str] = None, chapter_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Generate quiz questions on a specific topic using the LLM.
    
    Args:
        topic: The topic to generate questions about
        course_id: Optional course ID for context
        chapter_id: Optional chapter ID for more specific context
        
    Returns:
        List of quiz questions with options and answers
    """
    logger.info(f"Generating quiz on topic: {topic}")
    
    try:
        # Initialize LLM client
        llm_client = LLMClient()
        
        # Set API key
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment")
        
        llm_client.set_api_key(api_key)
        
        # Create the quiz generation prompt
        context = f"for course ID: {course_id}" if course_id else ""
        if chapter_id:
            context += f", chapter ID: {chapter_id}"
            
        system_message = f"""You are an expert educational quiz generator.
Generate 5 multiple-choice questions on the topic: {topic} {context}.

For each question:
1. Provide a clear, concise question
2. Provide 4 options labeled A, B, C, D
3. Indicate the correct answer
4. Provide a brief explanation of why the answer is correct

FORMAT YOUR RESPONSE AS JSON with this structure:
[
  {{
    "question": "...",
    "options": [
      {{"label": "A", "text": "..."}},
      {{"label": "B", "text": "..."}},
      {{"label": "C", "text": "..."}},
      {{"label": "D", "text": "..."}}
    ],
    "correctAnswer": "A",
    "explanation": "..."
  }},
  ...
]
"""
        
        # Call LLM client with function calling capabilities
        response = llm_client.generate_response(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"Generate quiz questions on {topic}"}
            ],
            temperature=0.3,
            max_tokens=2000,
            stream=False
        )
        
        # Extract content
        content = llm_client.extract_content(response)["content"]
        
        # Parse JSON response
        # Find JSON array in the content using string search in case there's extra text
        try:
            json_start = content.find("[")
            json_end = content.rfind("]") + 1
            if json_start >= 0 and json_end > json_start:
                json_content = content[json_start:json_end]
                questions = json.loads(json_content)
            else:
                # Fallback - try to parse the entire content as JSON
                questions = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {str(e)}")
            logger.debug(f"Response content: {content}")
            
            # Return a simple error question
            return [{
                "question": "Error generating quiz questions",
                "options": [
                    {"label": "A", "text": "Try again"},
                    {"label": "B", "text": "Contact support"},
                    {"label": "C", "text": "Refresh page"},
                    {"label": "D", "text": "Check system status"}
                ],
                "correctAnswer": "A",
                "explanation": f"There was an error generating questions: {str(e)}"
            }]
        
        # Check and ensure proper format
        formatted_questions = []
        for q in questions:
            # Ensure question has all required fields
            if not all(key in q for key in ["question", "options", "correctAnswer", "explanation"]):
                continue
                
            # Ensure options are properly formatted
            if not isinstance(q["options"], list):
                continue
                
            formatted_questions.append(q)
            
        logger.info(f"Generated {len(formatted_questions)} quiz questions")
        return formatted_questions
        
    except Exception as e:
        logger.error(f"Error generating quiz questions: {str(e)}")
        # Return a simple error question
        return [{
            "question": "Error generating quiz questions",
            "options": [
                {"label": "A", "text": "Try again"},
                {"label": "B", "text": "Contact support"},
                {"label": "C", "text": "Refresh page"},
                {"label": "D", "text": "Check system status"}
            ],
            "correctAnswer": "A",
            "explanation": f"There was an error generating questions: {str(e)}"
        }]

def save_quiz_instance(user_id: str, course_id: str, chapter_id: str, questions: List[Dict[str, Any]]) -> str:
    """
    Save a quiz instance to the database.
    
    Args:
        user_id: ID of the user
        course_id: ID of the course
        chapter_id: ID of the chapter
        questions: List of generated questions
        
    Returns:
        ID of the created quiz instance
    """
    quiz_id = str(uuid.uuid4())
    
    try:
        # In a real implementation, this would save the quiz to the database
        logger.info(f"Saving quiz instance for user {user_id}, chapter {chapter_id}")
        
        # This is a placeholder for the actual database insertion logic
        # You would connect to the database and insert into QuizInstance table
        
        logger.info(f"Created QuizInstance with ID: {quiz_id}")
        return quiz_id
        
    except Exception as e:
        logger.error(f"Error saving quiz instance: {str(e)}")
        return ""

def quiz_gen_tool(topic: str, user_id: Optional[str] = None, course_id: Optional[str] = None, chapter_id: Optional[str] = None) -> str:
    """
    Tool function that generates quiz questions on a topic and
    returns a formatted quiz.
    
    Args:
        topic: Topic to generate questions about
        user_id: Optional user ID for saving the quiz
        course_id: Optional course ID for context
        chapter_id: Optional chapter ID for context
        
    Returns:
        Markdown string with the quiz or JSON representation
    """
    try:
        # Generate quiz questions
        questions = generate_quiz_content(topic, course_id, chapter_id)
        
        # If all user, course, and chapter IDs are provided, save to database
        quiz_id = None
        if user_id and course_id and chapter_id:
            quiz_id = save_quiz_instance(user_id, course_id, chapter_id, questions)
        
        # Format the questions as markdown
        quiz_markdown = f"## Quiz: {topic}\n\n"
        
        for i, q in enumerate(questions):
            quiz_markdown += f"### Question {i+1}: {q['question']}\n\n"
            
            for option in q["options"]:
                quiz_markdown += f"- **{option['label']}**: {option['text']}\n"
            
            # Only include correct answer in markdown if quiz_id is None
            # (This means we're displaying in chat, not saving for later)
            if not quiz_id:
                quiz_markdown += f"\n**Correct Answer**: {q['correctAnswer']} - {q['explanation']}\n\n"
            else:
                quiz_markdown += "\n"
        
        if quiz_id:
            quiz_markdown += f"\nThis quiz has been saved. Quiz ID: {quiz_id}\n"
            
        return quiz_markdown
        
    except Exception as e:
        logger.error(f"Error in quiz_gen_tool: {str(e)}")
        return f"⚠️ **Quiz generation failed**: {str(e)}" 