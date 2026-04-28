# Weather API with Vercel AI SDK

A working example of integrating the Vercel AI SDK (`ai` package) with OpenAI's GPT models and real-time weather data fetching.

## Setup

### 1. Environment Variables

Ensure your `.env` file contains:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
WEATHER_API_KEY=your-weatherapi-key-from-weatherapi.com
PORT=3000
```

**Get your API keys:**
- **OpenAI API Key**: https://platform.openai.com/api-keys
- **Weather API Key**: https://www.weatherapi.com/signup.aspx (free tier available)

### 2. Install Dependencies

```bash
npm install
```

Already installed:
- `ai` - Vercel AI SDK for streaming and tool integration
- `@ai-sdk/openai` - OpenAI provider for Vercel AI
- `express` - Web framework
- `zod` - Schema validation
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

### 3. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server will start at `http://localhost:3000`

## Usage

### API Endpoint: POST `/api/chat`

Send a request with messages array:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What is the weather in Paris?"
      }
    ]
  }'
```

### TypeScript Example

```typescript
const messages = [
  { role: 'user' as const, content: 'What is the current weather in London?' }
];

const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});

// Handle streaming response
const reader = response.body?.getReader();
// Process chunks...
```

### Using the Agent Directly

```typescript
import { createWeatherAgent } from './agent';

const messages = [
  { role: 'user' as const, content: 'Tell me the weather in Tokyo' }
];

const result = await createWeatherAgent(messages);
const text = await result.text();
console.log(text);
```

## Project Structure

```
├── server.ts          # Express server with /api/chat endpoint
├── agent.ts           # Vercel AI agent with weather tool
├── tools/
│   └── weather.ts     # Weather tool definition and execution
├── test-weather-api.ts # Test script
├── package.json
├── tsconfig.json
├── .env               # Environment variables
└── .env.sample        # Sample env variables
```

## How It Works

1. **User sends a message** to `/api/chat` endpoint
2. **Express server** receives the request and passes it to `createWeatherAgent`
3. **Vercel AI SDK** processes the message with OpenAI's GPT model
4. **If weather is mentioned**, the AI uses the `getWeather` tool to fetch real-time data
5. **Streaming response** is sent back to the client

## Key Features

✅ Real-time weather integration  
✅ Streaming responses  
✅ Tool calling with AI SDK  
✅ TypeScript support  
✅ CORS enabled  
✅ Error handling  

## Testing

Run the test script:

```bash
npx ts-node test-weather-api.ts
```

The server must be running before you test!

## Troubleshooting

**"API key not found" error:**
- Check your `.env` file has `OPENAI_API_KEY` and `WEATHER_API_KEY`
- Restart the server after updating `.env`

**"Cannot find module" error:**
- Run `npm install` to ensure all dependencies are installed
- Run `npm run build` to compile TypeScript

**Weather tool not being called:**
- Ensure your message explicitly asks about weather
- Check the weather API key is valid
- Look at server console logs for errors

## Dependencies

- **ai**: Vercel's unified AI SDK for streaming and tool integration
- **@ai-sdk/openai**: OpenAI integration for Vercel AI
- **express**: HTTP server framework
- **zod**: Runtime schema validation
- **typescript**: Type safety
- **ts-node-dev**: Development server with auto-reload
