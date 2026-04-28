/**
 * Test script for the Weather API
 * Usage: npx ts-node test-weather-api.ts
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/chat';

async function testWeatherAPI() {
  console.log('🌤️  Testing Weather API...\n');

  const testMessages = [
    {
      role: 'user' as const,
      content: 'What is the current weather in London?',
    },
  ];

  try {
    console.log('📤 Sending request:', testMessages);
    console.log('-------------------------------------------\n');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: testMessages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('📥 Response received (streaming):\n');

    // Handle streaming response
    if (response.body) {
      const reader = response.body as any;
      for await (const chunk of reader) {
        const text = chunk.toString().split('\n').filter(Boolean);
        text.forEach((line: string) => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              process.stdout.write(data.content);
            } catch (e) {
              // Ignore parsing errors
            }
          }
        });
      }
    }

    console.log('\n\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWeatherAPI();
