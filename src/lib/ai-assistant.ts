'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { equipmentData } from './seed-data';
// import { db } from '@/lib/db'; // In a real app, you might query the DB directly here.

const apiKey = process.env.GEMINI_API_KEY;

// Initialize the model only if key exists, otherwise we'll handle gracefully.
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Server Action: Process a user query using Google Gemini.
 * This runs entirely on the server.
 */
export async function processAiQuery(query: string): Promise<string> {
    if (!apiKey || !genAI) {
        console.error("Missing API Key or GenAI instance");
        return "I'm not fully initialized yet (API Key missing). I can only give you simulated answers for now.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Create a helpful system prompt with context
        const context = `
            You are CineBrain, an expert cinema equipment AI assistant.
            You help users find gear in our inventory.
            
            Current Inventory Highlights:
            ${equipmentData.map(i => `- ${i.brand} ${i.model} (${i.category})`).join('\n').slice(0, 3000)}... (truncated for context limit)

            User Query: ${query}

            Answer concisely and professionally. If the user asks about something not in the list, 
            suggest similar items from the list if possible.
        `;

        const result = await model.generateContent(context);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
}

/**
 * Server Action: Parse unstructured text to extract equipment data.
 */
export async function parseImportTextAction(text: string): Promise<any> {
    if (!apiKey || !genAI) {
        // Fallback simulation for when no key is present
        await new Promise(r => setTimeout(r, 1000));
        return {
            name: "Simulated Import (No API Key)",
            brand: "Unknown",
            model: "Model X",
            category: "Accessory",
            description: "Please add GEMINI_API_KEY to .env to use real AI.",
            daily_rate_est: 0
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            Extract cinema equipment specifications from the following text and return ONLY a JSON object.
            Do not include Markdown formatting or code blocks. Just the raw JSON.
            
            Text: "${text}"

            Required JSON Structure:
            {
                "name": "Full Display Name",
                "brand": "Manufacturer",
                "model": "Model Name",
                "category": "One of: Camera, Lens, Lighting, Audio, Monitor, Grip, Accessory",
                "description": "A brief professional summary",
                "daily_rate_est": Number (estimated daily rental price in USD, Make a reasonable guess based on the item value),
                "mount": "Lens mount if applicable (PL, EF, E, etc) or null",
                "weight_kg": Number (estimated weight) or 0
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let textResponse = response.text();

        // Cleanup if AI returns markdown code blocks
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(textResponse);
    } catch (error) {
        console.error("Gemini Import Error:", error);
        return null;
    }
}
