import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export { genAI };

export const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- Prompt Templates ---

export const PROFILE_INFERENCE_PROMPT = `
You are an expert psychologist and behavioral analyst. Your goal is to infer a deep user profile based on the provided conversation history and self-reported data.

Analyze the following inputs to infer:
1. OCEAN Personality Traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) with scores (1-10).
2. Core Values & Motivators.
3. Stressors & Triggers.
4. Communication Style Preference.

Input Data:
{{USER_DATA}}

Output Format (JSON):
{
  "ocean": { "o": 0, "c": 0, "e": 0, "a": 0, "n": 0 },
  "values": ["value1", "value2"],
  "stressors": ["stressor1", "stressor2"],
  "communicationStyle": "warm/direct/analytical"
}
`;

export const ENERGY_ESTIMATION_PROMPT = `
You are a circadian rhythm and energy optimization expert. Estimate the user's current energy level (1-10) and stress level (1-10) based on the context.

Context:
- Time of Day: {{TIME}}
- Recent Activity: {{ACTIVITY}}
- Last Interaction Sentiment: {{SENTIMENT}}
- User Chronotype (inferred): {{CHRONOTYPE}}

Output Format (JSON):
{
  "energyLevel": 5,
  "stressLevel": 3,
  "reasoning": "Mid-afternoon slump typical for this chronotype..."
}
`;

export const RICH_CONTENT_PROMPT = `
You are a "Psychological Richness" curator. Suggest 3 micro-activities that are novel, perspective-shifting, or deeply engaging, tailored to the user's current context.

Context:
- Energy: {{ENERGY}}
- Stress: {{STRESS}}
- Interests: {{INTERESTS}}

Output Format (JSON):
{
  "suggestions": [
    { "title": "Activity Name", "description": "Brief description", "duration": "5m" }
  ]
}
`;

export const JOURNAL_ANALYSIS_PROMPT = `
You are a personal growth AI. Analyze the user's journal entry to extract actionable insights.

Entry: "{{ENTRY}}"

Output Format (JSON):
{
  "tasks": ["Task 1", "Task 2"], // Actionable items found
  "profileUpdate": { "values": [], "interests": [] }, // New traits inferred
  "richMemory": { // If the entry contains a significant/meaningful moment
    "title": "Title of Memory",
    "visualDescription": "A visual description for generating an image",
    "emotion": "Emotion tag"
  }
}
`;

export async function inferFlowState(userProfile: any, journalEntries: any[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following user data to determine their current "Flow State" score (0-100) based on Drive, Ease, Optimism, and Focus.
      
      User Profile: ${JSON.stringify(userProfile)}
      Recent Journal Entries: ${JSON.stringify(journalEntries.slice(0, 3))}
      
      Return ONLY a JSON object with this structure:
      {
        "score": number,
        "drive": number, // 0-100
        "ease": number, // 0-100
        "optimism": number, // 0-100
        "focus": number, // 0-100
        "insight": "A brief, 1-sentence insight about their current state."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Flow State Inference Error:", error);
    return { score: 50, drive: 50, ease: 50, optimism: 50, focus: 50, insight: "Unable to determine flow state." };
  }
}

import fs from 'fs';
import path from 'path';

export async function generateSmartSchedule(
  flowState: any,
  userProfile: any,
  habits: any = [],
  timeAvailable: string = "2 hours"
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const promptPath = path.join(process.cwd(), 'src/app/api/inference/schedule/psychological_richness_generator_prompt.md');
    let promptTemplate = fs.readFileSync(promptPath, 'utf8');

    // Replace placeholders
    const prompt = promptTemplate
      .replace('${userProfile}', JSON.stringify(userProfile, null, 2))
      .replace('${flowState}', JSON.stringify(flowState, null, 2))
      .replace('${habits}', JSON.stringify(habits, null, 2))
      .replace('${timeAvailable}', timeAvailable);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up markdown if present
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Smart Schedule Generation Error:", error);
    // Fallback to a basic schedule if generation fails
    return [
      {
        time: "Now",
        title: "Mindful Breathing",
        description: "Take a moment to center yourself.",
        insight: "Fallback schedule due to generation error.",
        type: "Rest",
        duration: "5 min",
        visual_prompt: "A calm blue ocean wave, abstract, minimal"
      }
    ];
  }
}

export const STRESS_ANALYSIS_PROMPT = `
Analyze the user's digital phenotype signals to estimate stress (1-10) and energy (1-10).

Signals:
- Typing Speed: {{WPM}} WPM (Normal: ~40)
- Backspace Rate: {{BACKSPACE_RATE}}% (High rate = hesitation/anxiety)
- Sentiment: {{SENTIMENT}}
- Voice Tone: {{TONE}}

Output Format (JSON):
{
  "stressLevel": 5,
  "energyLevel": 5,
  "reasoning": "High backspace rate suggests anxiety..."
}
`;
