# Agent Tools

The Learnify Agent includes specialized tools that enhance its educational capabilities. This document explains how these tools work and how to handle their outputs in the frontend.

## Available Tools

The agent has three specialized tools:

1. **Image Generation (`img_gen`)**: Creates visual aids for learning content
2. **Mermaid Diagrams (`mermaid_gen`)**: Generates diagrams for concepts and processes
3. **Quiz Generation (`quiz_gen`)**: Creates interactive quizzes to test understanding

## Image Generation Tool

### How It Works

When the agent determines that an image would enhance the learning experience, it formats a detailed description and sends it to an image generation API.

### Format in Response

Image generation outputs are included in the response with this format:

```json
{
  "type": "img_gen",
  "content": "https://example.com/generated-image.jpg"
}
```

### Frontend Implementation

The frontend should render these image URLs as standard image elements:

```jsx
{tool.type === 'img_gen' && <img src={tool.content} alt="Generated image" />}
```

### Example Prompts That Trigger Images

- "Show me what a mitochondria looks like"
- "Generate an image of the water cycle"
- "Can you illustrate the components of an atom?"

## Mermaid Diagram Tool

### How It Works

The agent can create diagram code in the [Mermaid.js](https://mermaid-js.github.io/) format, which is then rendered into SVG images server-side.

### Format in Response

Mermaid diagram outputs are included in the response with this format:

```json
{
  "type": "mermaid_gen",
  "content": "<svg>...</svg>"
}
```

### Frontend Implementation

The frontend should render the SVG content directly:

```jsx
{tool.type === 'mermaid_gen' && <div dangerouslySetInnerHTML={{ __html: tool.content }} />}
```

### Example Diagram Types

- **Flowcharts**: For processes like algorithm steps
- **Sequence Diagrams**: For showing interactions or sequences
- **Class Diagrams**: For object-oriented programming concepts
- **State Diagrams**: For state machines or transitions

### Example Prompts That Trigger Diagrams

- "Show a diagram of the TCP/IP model"
- "Can you illustrate how bubble sort works?"
- "Create a diagram of the software development lifecycle"

## Quiz Generation Tool

### How It Works

The agent can generate interactive quizzes to help users test their understanding of the content. These quizzes contain questions, multiple-choice options, and correct answers.

### Format in Response

Quiz outputs are included in the response with this format:

```json
{
  "type": "quiz_gen",
  "content": "<div class='quiz'>...</div>"
}
```

The HTML content includes a structured quiz with questions, options, and answers.

### Frontend Implementation

The frontend should render the HTML content and may add interactive features:

```jsx
{tool.type === 'quiz_gen' && <div dangerouslySetInnerHTML={{ __html: tool.content }} />}
```

For a more interactive experience, you might parse the quiz content and implement custom quiz functionality:

```jsx
function QuizRenderer({ quizContent }) {
  // Parse the quiz content from HTML if needed
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Implement quiz interaction logic
  
  return (
    <div className="interactive-quiz">
      {/* Render quiz questions and options */}
      {/* Implement submit functionality */}
    </div>
  );
}
```

### Example Prompts That Trigger Quizzes

- "Create a quiz about basic JavaScript concepts"
- "Test my understanding of photosynthesis"
- "Generate practice questions about Newton's laws of motion"

## Handling Tool Outputs in Streaming Mode

In streaming mode, tool outputs may arrive in the middle of text content. The frontend should:

1. Accumulate text content until a tool output is received
2. Insert the tool output at the appropriate position
3. Continue accumulating text content after the tool output

Example algorithm:

```javascript
let currentContent = '';
let toolOutputs = [];

// For each chunk in the stream
stream.on('chunk', (chunk) => {
  if (chunk.type === 'text') {
    currentContent += chunk.content;
  } else if (['img_gen', 'mermaid_gen', 'quiz_gen'].includes(chunk.type)) {
    toolOutputs.push({
      type: chunk.type,
      content: chunk.content,
      position: currentContent.length // Mark where this tool should appear
    });
  }
});

// When rendering
function renderContent() {
  let segments = [];
  let lastPosition = 0;
  
  // Split content at tool positions
  toolOutputs.forEach(tool => {
    // Add text before this tool
    segments.push({
      type: 'text',
      content: currentContent.substring(lastPosition, tool.position)
    });
    
    // Add the tool itself
    segments.push(tool);
    
    lastPosition = tool.position;
  });
  
  // Add any remaining text
  if (lastPosition < currentContent.length) {
    segments.push({
      type: 'text',
      content: currentContent.substring(lastPosition)
    });
  }
  
  // Now render all segments in order
  return segments.map((segment, i) => {
    if (segment.type === 'text') {
      return <div key={i}>{segment.content}</div>;
    } else {
      // Render appropriate tool output
      return renderTool(segment, i);
    }
  });
}
```

## Customizing Tool Behavior

The agent decides when to use tools based on:

1. The user's learning profile (e.g., visual learners get more images)
2. The nature of the content (e.g., processes are good candidates for diagrams)
3. The specific request (e.g., "include a quiz" explicitly requests a quiz)

You can influence tool usage through prompt engineering:

- For more images: "Include visual examples when explaining..."
- For more diagrams: "Please use diagrams to illustrate..."
- For quizzes: "Include a short quiz to test my understanding..."

## Fallback Handling

If tool execution fails, the agent will provide a fallback response, such as:

- For images: A text description of what the image would have shown
- For diagrams: A text explanation of the structure or process
- For quizzes: Written questions without interactive elements

The frontend should handle these gracefully by rendering the fallback content. 