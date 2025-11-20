import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
