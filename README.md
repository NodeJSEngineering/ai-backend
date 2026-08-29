# My Awesome YouTube Channel

Welcome to my YouTube channel! 🎉 In this channel, I share exciting content related to web development. Whether you're interested in Angular, Javascript, or Productivity tips, you'll find something valuable here.
[YouTube Channel](http://youtube.com/@neweraofcoding)

## About Me

I'm Sam, and I'm passionate about product engineering and web development. I create videos that will help you learn web development.

## What You'll Find Here

- **[ Angular ]**: [Learn the fundamentals. I explained everything you need to get started with this JavaScript framework written in TypeScript. It is the web development framework for building the future. works at any scale. Loved by millions. Build for everyone.  open-source framework for building single-page client applications using HTML and TypeScript.]
- **[ Javascript ]**: [JavaScript is a powerful programming language that can add interactivity to a website. JavaScript is easy to learn. It's the foundation of frontend web development.]
- **[ Career Tips ]**: [self-assessment, goal setting, action planning, implementation, and refinement. By following these steps, you can develop a road map for achieving your career goals. Tips to improve your career development. Cultivating a beginner's mindset is a critical part of career growth. critical part of your professional growth.]
- **[ Common Errors ]**: [Mistakes to Avoid in Software Development Projects.]
- **[ Development Tools ]**: [Top Software Development Tools List.]
- **[ Typescript ]**: [TypeScript extends JavaScript by adding types to the language. TypeScript speeds up your development experience by catching errors. TypeScript can help enhance and improve your web development projects.]
- **[ Git & GitHub ]**: [GitHub is where over 100 million developers shape the future of software together. Contribute to the open-source community and manage Git repositories. This practical guide gets you to jump right into using GitHub, learning the basics of Git. Git and GitHub are two of the most essential tools in the world of software development.]
- **[ Video Conferencing Tool ]**: [Unlock the potential of video conferencing software development. Dive into our guide for insights on key features and cost factors.  If you're looking to integrate video communication into your app or planning to build a video streaming/conference app from scratch, create a fully customized audio & video conferencing app.]


### About the app Weather API with Vercel AI SDK

A working example of integrating the Vercel AI SDK (`ai` package) with OpenAI's GPT models and real-time weather data fetching.

agent.ts - Agent class which uses tool for fetching weather
genkit.ts - Genkit library implementation for fetching weather
server.ts - Express server for /api/chat endpoint
test-weather-api.ts - Test script to test the API
tools - weather.ts - Tool for fetching weather information

## Setup

## How to Run

npm run dev - genkit 
npm run build
npm start

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

### useful commands to run project

### How to setup project

### Packages used

## Subscribe and Stay Updated!

Don't miss out on new videos! Subscribe to my channel and hit the notification bell 🔔 to receive updates whenever I upload fresh content. Let's learn, laugh, and explore together!

[!Subscribe to My Channel](http://youtube.com/@neweraofcoding)

## Connect with Me

- **YouTube**: [YouTube Channel Link](http://youtube.com/@neweraofcoding)
- **Facebook**: [Facebook Page Link](https://www.facebook.com/learnangular2plus/)
- **Instagram**: [Instagram Page Link](https://www.instagram.com/angular_development/)

Feel free to reach out, comment on videos, and share your thoughts. I appreciate your support! 🙌

## License

This project is licensed under the MIT License.

---

If you have any questions or need further assistance, feel free to ask! 🚀

##  Steps to contribute and generate PR(pull request)

 ###  clone the repository
clone the forked repository to your system. Go to your GitHub account, open the forked repository, click on the code button and then clone the repository.
If you want to use the terminal, use the following commands after you fork the repository, open the terminal type the given command
```
git clone repo url
```
### create a branch
 create a branch on your local repository to solve a problem.

Terminal commands
```
git checkout -b your_new_branch_name
```   
###   add & commit
add your changes(folder) to that branch.
Make necessary changes and commit those changes. Terminal commands
```
git add .
git commit -m "your-commit-message"
```
### push changes to github
finally, push your local repository to the remote repository compare & submit a pull request

terminal commands
```
git push origin 
```
Go to your repository on GitHub, you'll see a compare & pull request button. Click on that button.

Now submit the pull request.
   
For quick approval of the pull request, reach out to me on the mentioned social media channels.
```bash



 _____ _                 _     __   __            
|_   _| |               | |    \ \ / /            
  | | | |__   __ _ _ __ | | __  \ V /___  _   _   
  | | | '_ \ / _` | '_ \| |/ /   \ // _ \| | | |  
  | | | | | | (_| | | | |   <    | | (_) | |_| |  
  \_/ |_| |_|\__,_|_| |_|_|\_\   \_/\___/ \__,_|  
                                                  
                                                  
______                                            
|  ___|                                           
| |_ ___  _ __                                    
|  _/ _ \| '__|                                   
| || (_) | |                                      
\_| \___/|_|                                      
                                                  
                                                  
______      _               _   _               _ 
| ___ \    (_)             | | | |             | |
| |_/ / ___ _ _ __   __ _  | |_| | ___ _ __ ___| |
| ___ \/ _ \ | '_ \ / _` | |  _  |/ _ \ '__/ _ \ |
| |_/ /  __/ | | | | (_| | | | | |  __/ | |  __/_|
\____/ \___|_|_| |_|\__, | \_| |_/\___|_|  \___(_)
                     __/ |                        
                    |___/                         

 


```
---------
```javascript

if (youEnjoyed) {
 //  (star ⭐ & fork 🍽️) this repository.
 // - Fork this repository by clicking on the fork button at the top of this page. This will create a copy of this repository in your account.
    starThisRepository();
}

```
---------
happy coding fellas!!💕✨
-----------
 



