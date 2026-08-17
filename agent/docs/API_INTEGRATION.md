# API Integration Guide

This document provides detailed instructions for frontend developers on how to integrate with the Learnify Agent API.

## Overview

The Learnify Agent provides an API endpoint for requesting educational content, with features:

- **Streaming responses**: Content is delivered as a stream in real-time
- **Tool support**: Support for image generation, diagram creation, and quiz generation
- **Personalization**: Responses are tailored to the user's learning profile
- **Multilingual support**: Content can be requested in different languages

## API Endpoint

For a standard Next.js BFF (Backend-for-Frontend), you'll create an API route at:

```
POST /api/agent/chat
```

## Request Format

### Headers

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Body

```json
{
  "userId": "user-123",
  "courseId": "cs101",
  "chapterId": "intro-to-algorithms",
  "prompt": "Explain how sorting algorithms work. Include examples and a diagram.",
  "language": "english",
  "learningProfile": {
    "processingStyle": "active",
    "perceptionStyle": "visual",
    "inputStyle": "interactive",
    "understandingStyle": "sequential"
  },
  "stream": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Unique identifier for the user |
| `courseId` | string | Yes | Identifier for the course |
| `chapterId` | string | No | Optional identifier for the specific chapter |
| `prompt` | string | Yes | The user's question or instruction |
| `language` | string | Yes | Response language (`english` or `urdu`) |
| `learningProfile` | object | Yes | User's learning preferences |
| `stream` | boolean | No | Whether to stream the response (default: true) |

### Learning Profile Options

The `learningProfile` object contains preferences that help tailor the agent's response:

| Field | Options | Description |
|-------|---------|-------------|
| `processingStyle` | `active` or `reflective` | How the user processes information |
| `perceptionStyle` | `visual` or `verbal` | How the user perceives information |
| `inputStyle` | `interactive` or `passive` | How the user prefers to interact |
| `understandingStyle` | `sequential` or `global` | How the user builds understanding |

## Response Format

### Streaming Response

The streaming response is delivered as a series of Server-Sent Events (SSE), each containing a JSON object with the following structure:

```javascript
// For text content:
{
  "type": "text",
  "content": "A portion of the response text..."
}

// For tool outputs:
{
  "type": "img_gen",
  "content": "https://example.com/generated-image.jpg"
}
```

Or:

```javascript
{
  "type": "mermaid_gen",
  "content": "<svg>...</svg>"
}
```

Or: 

```javascript
{
  "type": "quiz_gen",
  "content": "<div class='quiz'>...</div>"
}
```

The frontend should accumulate text chunks and render tool outputs appropriately.

### Non-Streaming Response

For non-streaming requests (`stream: false`), the response is a single JSON object:

```json
{
  "response": "The full text response with markdown formatting...",
  "toolOutputs": [
    {
      "type": "img_gen",
      "content": "https://example.com/generated-image.jpg"
    },
    {
      "type": "mermaid_gen",
      "content": "<svg>...</svg>"
    }
  ]
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Missing required fields or invalid format
- `401 Unauthorized`: Authentication failure
- `500 Internal Server Error`: Server-side error

Error responses are in JSON format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Frontend Implementation

### Next.js API Route

Create a Next.js API route to forward requests to the Python agent:

```typescript
// pages/api/agent/chat.ts or app/api/agent/chat/route.ts
import type { NextRequest } from 'next/server';
import { spawn } from 'child_process';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.userId || !body.courseId || !body.prompt || !body.learningProfile) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Spawn Python process
    const pythonProcess = spawn('python', ['/path/to/api_integration_example.py'], {
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });
    
    // Send request to Python process
    pythonProcess.stdin.write(JSON.stringify(body));
    pythonProcess.stdin.end();
    
    // Create stream from Python process output
    const stream = new ReadableStream({
      start(controller) {
        pythonProcess.stdout.on('data', (data) => {
          controller.enqueue(data);
        });
        
        pythonProcess.on('close', () => {
          controller.close();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          console.error(`Agent error: ${data.toString()}`);
        });
      }
    });
    
    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### React Component Example

Here's a simple React component to consume the streaming API:

```jsx
import { useState, useEffect, useRef } from 'react';

export default function ChatInterface({ userId, courseId, learningProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  async function sendMessage() {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          prompt: input,
          language: 'english',
          learningProfile,
          stream: true
        })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantResponse = { role: 'assistant', content: '', tools: [] };
      setMessages(prev => [...prev, assistantResponse]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const events = chunk.split('\n\n');
        
        for (const event of events) {
          if (event.startsWith('data: ')) {
            try {
              const data = JSON.parse(event.substring(6));
              
              if (data.type === 'text') {
                assistantResponse.content += data.content;
              } else if (['img_gen', 'mermaid_gen', 'quiz_gen'].includes(data.type)) {
                assistantResponse.tools.push({
                  type: data.type,
                  content: data.content
                });
              }
              
              setMessages(prev => [
                ...prev.slice(0, -1),
                { ...assistantResponse }
              ]);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="content">
              {msg.content}
            </div>
            {msg.tools?.map((tool, j) => (
              <div key={j} className={`tool-output ${tool.type}`}>
                {tool.type === 'img_gen' && <img src={tool.content} alt="Generated image" />}
                {tool.type === 'mermaid_gen' && <div dangerouslySetInnerHTML={{ __html: tool.content }} />}
                {tool.type === 'quiz_gen' && <div dangerouslySetInnerHTML={{ __html: tool.content }} />}
              </div>
            ))}
          </div>
        ))}
        {isLoading && <div className="loading">Agent is thinking...</div>}
      </div>
      
      <div className="input-area">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
}
```

## Testing the Integration

You can test your integration using the provided example scripts:

1. **Direct Script Testing**: Run `python final_test.py` to test the API directly
2. **API Integration Testing**: Run `python api_integration_example.py` to test the full API flow

## Troubleshooting

- **CORS Issues**: Ensure your Next.js API has proper CORS headers if needed
- **Authentication Errors**: Check that the authentication token is being passed correctly
- **Streaming Problems**: Make sure all middleware supports streaming responses
- **Tool Content Display**: Ensure proper sanitization when using `dangerouslySetInnerHTML` 