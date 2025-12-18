import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import * as cheerio from "cheerio";
import { retrieveContext } from "./rag";

// Initialize Clients
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);
// const fileManager = new GoogleAIFileManager(geminiApiKey); // Kept for future video file uploads

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper: Extract Links
function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}

// Helper: Analyze Content using Gemini (The "Eyes")
async function analyzeContentWithGemini(url: string): Promise<string> {
    try {
        // 1. Fetch Text Content (Fallback/Baseline)
        let textContent = "";
        try {
            const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
            const $ = cheerio.load(response.data);
            $('script').remove(); $('style').remove();
            textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
        } catch (e) { console.warn("Failed to scrape text:", e); }

        // 2. Determine Prompt based on generic content
        const analysisPrompt = `
        You are an expert Content Analyst for a Life Coach.
        Analyze this content from: ${url}
        
        Extracted Text Preview: "${textContent.slice(0, 500)}..."

        Your Goal:
        1. Identify the core advice/claims.
        2. Detect the tone (is it shaming? empowering? factual?).
        3. Extract any specific protocols or habits mentioned.
        4. Validated against scientific consensus briefly.

        Return a concise structured summary.
        `;

        // 3. Use Gemini 2.0 Flash Exp for fast, multimodal-ready analysis
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(analysisPrompt);
        return result.response.text();

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return `[Could not analyze content from ${url}]`;
    }
}

// System Prompt for Claude (The "Voice")
export const CLAUDE_SYSTEM_PROMPT = `
You are "The Mentor," a warm, empathetic, and wise Life Coach.
You are NOT a robot. You are a supportive friend who happens to have the wisdom of 200+ experts.

**Your Goal:**
Build rapport. Make the user feel heard, validated, and guided.

**Expert Knowledge Base:**
You have access to a RAG system (context provided below). Use it to back up your advice, but don't sound like a textbook.
Cite experts naturally: "As James Clear suggests..." or "It reminds me of what Brené Brown says..."

**Tone & Style:**
- **Warm & Casual**: Use contractions ("I'm", "don't"). Sound like a real person.
- **Empathetic**: Always validate feelings first. "That sounds really tough."
- **Direct but Kind**: Give actionable advice, but wrap it in kindness.
- **Short & Punchy**: Keep responses under 3-4 sentences unless explaining a concept.

**Protocols:**
- **Video/Content**: If the user shares a link, use the provided "Content Analysis" to discuss it.
- **Check-ins**: Ask about the 5 Pillars (Health, Wealth, Love, Happiness, Connection) if context is vague.
`;

export async function generateLifeCoachResponse(
    userMessage: string,
    chatHistory: any[] = [],
    userContext: string = ""
) {
    try {
        // 1. Process Links using Gemini
        const urls = extractUrls(userMessage);
        let contentAnalysis = "";

        if (urls.length > 0) {
            console.log("Processing links with Gemini:", urls);
            const analysisPromises = urls.map(url => analyzeContentWithGemini(url));
            const results = await Promise.all(analysisPromises);
            contentAnalysis = results.join("\n\n");
        }

        // 2. Retrieve RAG Context (Playbook)
        const ragContext = await retrieveContext(userMessage + " " + contentAnalysis);

        // 3. Generate Evaluation using Claude
        // Converting history to Anthropic format
        const anthropicMessages = chatHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

        // Add current user message
        anthropicMessages.push({
            role: 'user', content: `
        ${userMessage}
        
        [System Note: User Context]
        ${userContext}

        [System Note: Content Analysis from Gemini]
        ${contentAnalysis ? contentAnalysis : "No external content sharing."}

        [System Note: Relevant Playbook Advice]
        ${ragContext}
        ` });

        // User requested "claude-sonnet-4-5", mapping to correct ID or fallback
        // NOTE: 'claude-sonnet-4-5-20250929' is a hypothetical ID provided by user. 
        // If it fails, we fall back to a known stable model if specific error handling was here, 
        // but for now we trust the user's specific request.
        const modelId = "claude-sonnet-4-5-20250929";

        const response = await anthropic.messages.create({
            model: modelId,
            max_tokens: 400,
            system: CLAUDE_SYSTEM_PROMPT,
            messages: anthropicMessages as any
        });

        // @ts-ignore
        const text = response.content[0].text;
        return text;

    } catch (error) {
        console.error("Hybrid Agent Error:", error);
        return "I'm feeling a bit out of sync right now. [pause] Can you say that again?";
    }
}
