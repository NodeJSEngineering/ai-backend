import { z } from 'zod';

export const weatherTool = {
  name: 'getWeather',
  description: 'Fetch current weather information for a given city.',
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }: { city: string }) => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
      );
      const data = await res.json();

      return `The weather in ${city} is ${data.current.condition.text} with a temperature of ${data.current.temp_c}°C.`;
    } catch (error) {
      return `Sorry, I couldn’t fetch weather data for ${city}.`;
    }
  },
};