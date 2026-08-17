import logging
import json
import re
from typing import Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def sanitize_mermaid_code(code: str) -> str:
    """
    Sanitize and clean up mermaid diagram code.
    
    Args:
        code: Mermaid code to sanitize
        
    Returns:
        Cleaned mermaid code
    """
    # Remove any potential markdown backticks
    code = re.sub(r'^```mermaid\s*', '', code)
    code = re.sub(r'\s*```$', '', code)
    
    # Ensure code starts with a valid mermaid diagram type
    valid_starts = ['graph ', 'flowchart ', 'sequenceDiagram', 'classDiagram', 
                   'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 
                   'timeline', 'mindmap', 'gitGraph']
    
    has_valid_start = any(code.strip().startswith(start) for start in valid_starts)
    
    if not has_valid_start:
        # Attempt to prepend 'flowchart TD' if no valid start is found
        code = 'flowchart TD\n' + code
    
    return code.strip()

def generate_mermaid_diagram(mermaid_code: str) -> Dict[str, Any]:
    """
    Process mermaid diagram code.
    
    In a production environment, this could render the diagram
    as an image or use a JavaScript-based approach to render it
    client-side.
    
    Args:
        mermaid_code: Mermaid diagram code
        
    Returns:
        Dictionary with the processed mermaid code
    """
    logger.info("Processing mermaid diagram code")
    
    try:
        # Sanitize the mermaid code
        sanitized_code = sanitize_mermaid_code(mermaid_code)
        
        # In a real implementation, you could:
        # 1. Call a service to render the diagram as an image
        # 2. Return the code for client-side rendering with mermaid.js
        
        return {
            "type": "mermaid",
            "code": sanitized_code,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Error processing mermaid diagram: {str(e)}")
        return {
            "type": "error",
            "source": "mermaid_gen",
            "message": f"Failed to process mermaid diagram: {str(e)}",
            "code": mermaid_code
        }

def mermaid_gen_tool(mermaid_code: str) -> str:
    """
    Tool function that processes mermaid diagram code and returns
    markdown with the diagram code.
    
    Args:
        mermaid_code: Mermaid diagram code
        
    Returns:
        Markdown string with the mermaid diagram
    """
    try:
        result = generate_mermaid_diagram(mermaid_code)
        
        if result.get("type") == "error":
            return f"⚠️ **Mermaid diagram generation failed**: {result.get('message')}"
        
        sanitized_code = result.get("code", "")
        
        # Return markdown with the mermaid diagram
        return f"```mermaid\n{sanitized_code}\n```"
        
    except Exception as e:
        logger.error(f"Error in mermaid_gen_tool: {str(e)}")
        return f"⚠️ **Mermaid diagram generation failed**: {str(e)}" 