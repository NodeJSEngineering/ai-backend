
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai'; // @genkit-ai/googleai deprecated now

import * as dotenv from "dotenv";

dotenv.config();

const ai = genkit({
  plugins: [
    googleAI({
      ...(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {}),
    }),
  ],
  model: googleAI.model('gemini-3.7-flash', {
    temperature: 0.8,
  }),
});

import express from "express";
const app = express();
app.post("/api/ai", async (req, res) => {
 const { prompt } = req.body;
 const result = await ai.generate({ prompt });
 res.json(result);
});
app.listen(3000, () => console.log("Server running on http://localhost:3000"));

// const chatFlow = defineFlow("chatFlow", async (input) => {
//  return ai.generateStream({
//    prompt: input,
//    model: "googleai/gemini-1.5-flash"
//  });
// });

// ai.defineTool("getWeather", async (location) => {
//  return fetchWeather(location);
// });


export const getOrderStatusTool = ai.defineTool(
  {
    name: 'getOrderStatus',

    description: "Get the status of a user's order by their order ID.",
  
    inputSchema: z.object({
      orderId: z.string().describe("The unique ID of the customer's order"),
    }),
   
    outputSchema: z.object({
      status: z.string(),
      estimatedDelivery: z.string(),
    }),
  },
   async (input) => {
    if (input.orderId === '123-456') {
      return { status: 'Shipped', estimatedDelivery: 'October 9, 2025' };
    }
    
    return { status: 'Not Found', estimatedDelivery: 'N/A' };
  }
);

export const orderSupportFlow = ai.defineFlow(
  {
    name: 'orderSupportFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      prompt: prompt,
      tools: [getOrderStatusTool],
    });
    return llmResponse.text;
  }
);

import cors from 'cors';

app.use(cors()); // Allow Angular to talk to this server
app.use(express.json());

const ProductSchema = z.object({ 
    name: z.string(), 
    description: z.string(), 
    price: z.number(), 
    tags: z.array(z.string()), 
});

app.post('/api/generate-product', async (req, res) => {
  const { prompt } = req.body;

  try {
    const { output } = await ai.generate({ 
      model: 'googleai/gemini-2.5-flash', 
      prompt: `Extract the product details from this user input: "${prompt}"`, 
      output: { schema: ProductSchema } 
    });
    
    // Send the structured JSON back to Angular
    res.json(output); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate product data' });
  }
});



// 2. Mocking your Vector Database for this demo 
// (Replace this with your actual Pinecone, Supabase, or pgvector logic)
const vectorDb = {
  search: async (vector: number[], limit: number) => {
    console.log(`[VectorDB] Searching with a vector of ${vector.length} dimensions...`);
    return [
      { id: 101, name: "Kids Red Running Shoes", price: 29.99 },
      { id: 102, name: "Toddler Crimson Sneakers", price: 19.99 }
    ];
  }
};

// 3. Define the Flow
export const searchFlow = ai.defineFlow(
  { 
    name: 'search', 
    inputSchema: z.string(),
    // It's good practice to define what your flow returns
    outputSchema: z.array(z.any()) 
  }, 
  async (query) => { 
    console.log(`Processing search query: "${query}"`);

    // 4. Generate the embedding using Google's text-embedding model
    const embeddingResponse = await ai.embed({ 
      embedder: 'googleai/gemini-embedding-001', 
      content: query 
    }); 
// 2. Extract the raw vector (array of numbers) from the first result
    const rawVector = embeddingResponse[0]!.embedding;
    // 5. Pass the generated vector array to your database
    return vectorDb.search(rawVector, 10); 
  } 
);

// --- Demo Execution ---
async function runDemo() {
  try {
    // To run a flow, you call it just like a normal async function
    const results = await searchFlow("cheap red shoes for kids");
    console.log("\nSearch Results:");
    console.log(results);
  } catch (error) {
    console.error("Flow failed:", error);
  }
}

export const summariseFlow = ai.defineFlow(
  { 
    name: 'summarise', 
    inputSchema: z.array(z.string()), 
    outputSchema: z.string() 
  }, 
  async (records) => { 
    const { text } = await ai.generate({ 
      // 1. Use the string identifier
      model: 'googleai/gemini-2.5-flash', 
      // 2. FIX: Wrap the prompt in backticks (`) for template literals
      prompt: `Summarize the following records:\n${records.join('\n')}` 
    }); 
    return text; 
  }
);

// Define the schema
const ImproveSchema = z.object({ 
  improved: z.string(), 
  changes: z.array(z.string()), 
});

// Wrap it in a reusable async function
export async function improveProductDescription(currentDescription: string) {
  try {
    const { output } = await ai.generate({ 
      model: 'googleai/gemini-2.5-flash', 
      prompt: `Improve this product desc: "${currentDescription}"`, 
      output: { schema: ImproveSchema } 
    });
    
    return output;
  } catch (error) {
    console.error("Failed to improve description:", error);
    throw error;
  }
}

// --- Example Usage ---
// const result = await improveProductDescription("cheap red shoes for kids");
// console.log(result?.improved);
// console.log(result?.changes);

// Mocking the Vector Database for the Semantic Search flow
const mockVectorDb = {
  search: async (vector: number[], limit: number) => {
    // In a real app, this sends the vector array to Pinecone, pgvector, etc.
    return [
      { id: 101, name: "Kids Red Running Shoes", price: 29.99, matchScore: 0.98 },
      { id: 102, name: "Toddler Crimson Sneakers", price: 19.99, matchScore: 0.85 }
    ];
  }
};

// ============================================================================
// 3. GENKIT FLOWS & FUNCTIONS
// ============================================================================

/**
 * Snippet 1 & 2: Product Auto-fill Extraction (Used by your Angular App)
 */
async function autoFillProduct(userInput: string) {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Extract the product details from this user input: "${userInput}"`,
    output: { schema: ProductSchema }
  });
  return output;
}


// ============================================================================
// 4. MASTER DEMO EXECUTION
// ============================================================================

async function runMasterDemo() {
  console.log("🚀 STARTING GENKIT AI MASTER DEMO...\n");

  try {
    // --- DEMO 1: Auto-Fill Extraction ---
    console.log("--------------------------------------------------");
    console.log("📦 DEMO 1: Auto-Fill Product from Text");
    const rawInput = "blue running shoes for men 49 dollars";
    console.log(`Input: "${rawInput}"`);
    const extractedData = await autoFillProduct(rawInput);
    console.log("Output:");
    console.dir(extractedData, { depth: null, colors: true });
    
    // --- DEMO 2: Semantic Search ---
    console.log("\n--------------------------------------------------");
    console.log("🔍 DEMO 2: Semantic Vector Search");
    const searchQuery = "cheap red shoes for kids";
    console.log(`Query: "${searchQuery}"`);
    const searchResults = await searchFlow(searchQuery);
    console.log("Output (Mock DB Matches):");
    console.table(searchResults);

    // --- DEMO 3: Summarize Records ---
    console.log("\n--------------------------------------------------");
    console.log("📝 DEMO 3: Summarize Records");
    const mockRecords = [
      "Item 101 sold 5 units today.",
      "Item 102 is out of stock in warehouse B.",
      "Customer complaint regarding shipping delay on Item 101."
    ];
    console.log("Input Records:", mockRecords);
    const summary = await summariseFlow(mockRecords);
    console.log("\nGenerated Summary:");
    console.log(`"${summary}"`);

    // --- DEMO 4: Improve Description ---
    console.log("\n--------------------------------------------------");
    console.log("✨ DEMO 4: Improve Description (Structured)");
    const badDescription = "These r red shoes. They fit kids feet good. Cheap price.";
    console.log(`Original: "${badDescription}"`);
    const improvedData = await improveProductDescription(badDescription);
    console.log("\nImproved Copy:");
    console.log(`"${improvedData?.improved}"`);
    console.log("\nKey Changes Made:");
    improvedData?.changes.forEach(change => console.log(` - ${change}`));
    
    console.log("\n--------------------------------------------------");
    console.log("✅ DEMO COMPLETE!");

  } catch (error) {
    console.error("\n❌ DEMO FAILED WITH ERROR:");
    console.error(error);
  }
}

// Run the application
runMasterDemo();