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

interface ApiChatRequest {
  prompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  provider?: 'anthropic' | 'gemini' | string;
  model?: string;
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Helper function to format chat history for Gemini API
function formatGeminiContents(
  prompt?: string,
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
) {
  if (messages && messages.length > 0) {
    return messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  }
  if (prompt) {
    return [{ role: 'user', parts: [{ text: prompt }] }];
  }
  return [];
}

// Helper function to invoke Google Gemini Generative Language API
async function callGeminiApi(
  contents: Array<{ role?: string; parts: Array<{ text: string }> }>,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = (await response.json()) as any;
      errorDetail = errorJson?.error?.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`Gemini API error (${response.status}): ${errorDetail}`);
  }

  const data = (await response.json()) as any;
  const candidate = data?.candidates?.[0];
  const textOutput =
    candidate?.content?.parts
      ?.map((part: any) => part.text || '')
      .join('') || '';

  return textOutput;
}

// Chat endpoint with multi-provider support ('anthropic' | 'gemini')
app.post('/api/chat', async (req: Request<{}, {}, ApiChatRequest>, res: Response) => {
  const { prompt, messages, provider = 'anthropic', model } = req.body;
  const effectivePrompt = prompt || (messages && messages.length > 0 ? messages[messages.length - 1]?.content : '');

  if (!effectivePrompt && (!messages || messages.length === 0)) {
    return res.status(400).json({ error: 'Prompt or messages array is required' });
  }

  const selectedProvider = provider?.toLowerCase();

  switch (selectedProvider) {
    case 'gemini': {
      try {
        const contents = formatGeminiContents(prompt, messages);
        const modelName = model || 'gemini-2.5-flash';
        const textOutput = await callGeminiApi(contents, modelName);

        res.json({ response: textOutput, provider: 'gemini', model: modelName });
      } catch (error: any) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
          error: 'Failed to get response from Gemini',
          details: error.message,
        });
      }
      break;
    }

    case 'anthropic':
    default: {
      try {
        const message = await anthropic.messages.create({
          model: model || 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          messages: [{ role: 'user', content: effectivePrompt! }],
        });

        // Extracting text safely from the response content array
        const textOutput = message.content
          .map(c => c.type === 'text' ? c.text : '')
          .join('\n');

        res.json({ response: textOutput, provider: 'anthropic' });
      } catch (error: any) {
        console.error('Anthropic API Error:', error);
        res.status(500).json({
          error: 'Failed to get response from Claude',
          details: error.message,
        });
      }
      break;
    }
  }
});

// Dedicated Gemini Chat endpoint
app.post('/api/chat-gemini', async (req: Request<{}, {}, ApiChatRequest>, res: Response) => {
  const { prompt, messages, model } = req.body;
  const effectivePrompt = prompt || (messages && messages.length > 0 ? messages[messages.length - 1]?.content : '');

  if (!effectivePrompt && (!messages || messages.length === 0)) {
    return res.status(400).json({ error: 'Prompt or messages array is required' });
  }

  try {
    const contents = formatGeminiContents(prompt, messages);
    const modelName = model || 'gemini-2.5-flash';
    const textOutput = await callGeminiApi(contents, modelName);

    res.json({ response: textOutput, provider: 'gemini', model: modelName });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'Failed to get response from Gemini',
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
  console.log(`📌 Multi-provider Chat endpoint: POST http://localhost:${port}/api/chat (provider: 'gemini' | 'anthropic')`);
  console.log(`✨ Dedicated Gemini endpoint: POST http://localhost:${port}/api/chat-gemini`);
  console.log(`🤖 OpenAI + Weather endpoint: POST http://localhost:${port}/api/chat-ai`);
});
