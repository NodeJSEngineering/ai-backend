import express, { type Request, type Response, type Application } from 'express';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import cors from 'cors';
import { weatherTool } from './tools/weather.js';

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic Client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define request body interfaces for type safety
interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface AnthropicChatRequest {
  prompt: string;
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Anthropic Chat endpoint
app.post('/api/chat', async (req: Request<{}, {}, AnthropicChatRequest>, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extracting text safely from the response content array
    const textOutput = message.content
      .map(c => c.type === 'text' ? c.text : '')
      .join('\n');

    res.json({ response: textOutput });
  } catch (error: any) {
    console.error('Anthropic API Error:', error);
    res.status(500).json({
      error: 'Failed to get response from Claude',
      details: error.message,
    });
  }
});

// OpenAI Chat endpoint with Weather Tool (Vercel AI SDK)
app.post('/api/chat-ai', async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      tools: {
        getWeather: {
          description: 'Fetch current weather information for a given city.',
          parameters: weatherTool.inputSchema as any,
          execute: async (params: any) => weatherTool.execute(params),
        } as any,
      },
    });

    // Send the streamed response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error('AI API Error:', error);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`📌 Anthropic endpoint: POST http://localhost:${port}/api/chat`);
  console.log(`🤖 OpenAI + Weather endpoint: POST http://localhost:${port}/api/chat-ai`);
});
