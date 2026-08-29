import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { weatherTool } from './tools/weather.js';

/**
 * Main agent that uses OpenAI GPT with weather tool integration
 * Processes user messages and can fetch real-time weather information
 */
export const createWeatherAgent = async (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<any> => {
  try {
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      tools: {
        getWeather: {
          description: weatherTool.description,
          parameters: weatherTool.inputSchema,
          execute: async (params: any) => weatherTool.execute(params),
        } as any,
      },
      system: 'You are a helpful assistant with access to real-time weather information. When a user asks about weather, use the getWeather tool to fetch current conditions.',
    });

    return result;
  } catch (error) {
    console.error('Agent error:', error);
    throw error;
  }
};