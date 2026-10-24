# AGENTS.md

## Project Overview

This repository (`ai-backend`) is a Node.js + TypeScript backend engineered to provide multi-LLM orchestration, streaming chat completions, and tool calling for web applications (such as Angular and React frontend clients).

---

## Architecture & Tech Stack

- **Runtime & Language**: Node.js, TypeScript (ESNext, Bundler module resolution, `tsx` for live execution)
- **Framework**: Express 5.x
- **LLM Integrations**:
  - **Google Gemini**: Direct Google Generative Language API integration (`v1beta`) with chat completions and multi-turn history.
  - **Anthropic Claude**: Official `@anthropic-ai/sdk` (`claude-3-5-sonnet-20240620`).
  - **OpenAI + Vercel AI SDK**: `ai` package and `@ai-sdk/openai` (`gpt-4o-mini`) with SSE streaming and tool calling.
  - **Google Genkit**: `@genkit-ai/core` and `@genkit-ai/google-genai` for structured flows, embeddings, and semantic vector search in `genkit.ts`.

---

## Directory Structure

```
ai-backend/
├── server.ts              # Primary Express server (chat APIs: Gemini, Anthropic, OpenAI)
├── agent.ts               # Vercel AI SDK agent with weather tool integration
├── genkit.ts              # Genkit AI flows (product extraction, semantic search, summarization)
├── tools/
│   └── weather.ts         # WeatherAPI.com integration and tool definition
├── test-weather-api.ts    # Test script for Weather API
├── .env                   # Environment variables (API keys and PORT)
├── package.json           # Dependencies and run scripts
├── tsconfig.json          # TypeScript compiler configuration
└── AGENTS.md              # Project reference guide for AI agents and developers
```

---

## Environment Variables

Defined in `.env`:

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `WEATHER_API_KEY` | WeatherAPI.com API key for tool calling |
| `PORT` | Server listening port (default: `3000`) |

---

## API Endpoints

### 1. Health Check
- **Route**: `GET /health`
- **Response**: `{"status": "OK"}`

### 2. Multi-Provider Chat Endpoint
- **Route**: `POST /api/chat`
- **Description**: Unified endpoint routing between Gemini and Claude.
- **Request Body**:
  ```json
  {
    "provider": "gemini", // "gemini" | "anthropic" (default: "anthropic")
    "prompt": "Explain dependency injection in Angular.",
    "model": "gemini-2.5-flash" // Optional: custom model name
  }
  ```
  *Also supports multi-turn `messages` array:*
  ```json
  {
    "provider": "gemini",
    "messages": [
      { "role": "user", "content": "What is Angular?" },
      { "role": "assistant", "content": "Angular is a web application framework." },
      { "role": "user", "content": "Give me top 3 features." }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "response": "...",
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
  ```

### 3. Dedicated Gemini Chat Endpoint
- **Route**: `POST /api/chat-gemini`
- **Request Body**:
  ```json
  {
    "prompt": "Hello Gemini!",
    "model": "gemini-2.5-flash" // optional
  }
  ```
- **Response**:
  ```json
  {
    "response": "...",
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
  ```

### 4. OpenAI Chat with Weather Tool (Streaming)
- **Route**: `POST /api/chat-ai`
- **Format**: Server-Sent Events (SSE `text/event-stream`)
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "What is the weather in London right now?" }
    ]
  }
  ```
- **Stream Output**: `data: {"content": "..."}\n\n`

### 5. Genkit Endpoints (in `genkit.ts`)
- **Route**: `POST /api/ai` - Runs generic Genkit prompt generation.
- **Route**: `POST /api/generate-product` - Structured schema extraction for products.

---

## Development Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev:server` | Starts primary Express server (`server.ts`) with `tsx watch` |
| `npm run dev:genkit` | Starts Genkit flows and demos (`genkit.ts`) with `tsx watch` |
| `npm run build` | Compiles TypeScript using `tsc` to `dist/` |
| `npm start` | Runs compiled production server `dist/server.js` |

---

## Guidelines for Agents & Contributors

1. **Isolation of Services**:
   - `server.ts` is the active server for client applications (`/api/chat`, `/api/chat-gemini`, `/api/chat-ai`).
   - `genkit.ts` is a standalone workflow sandbox. Do not mix Genkit server instances with `server.ts` without explicit direction.
2. **Backward Compatibility**:
   - `/api/chat` must support both `prompt` (legacy string) and `messages` (chat array).
   - Default provider in `/api/chat` remains `'anthropic'` when none is specified.
3. **Error Handling**:
   - Always return meaningful JSON errors with HTTP 400 for bad input and HTTP 500 with `details` for upstream API issues.
4. **CORS & Types**:
   - `cors()` is globally enabled for cross-origin frontend communication.
   - Use explicit TypeScript types and interfaces for all request/response bodies.
