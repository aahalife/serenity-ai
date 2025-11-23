import { anthropic } from "@/lib/anthropic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history, profile, isVoice } = await req.json();

        let systemPrompt = `
      You are Serenity, a highly intelligent, empathetic, and psychologically attuned AI companion.
      
      USER PROFILE CONTEXT:
      - Name: ${profile?.name || "User"}
      - Personality (OCEAN): ${JSON.stringify(profile?.ocean || {})}
      - Core Values: ${profile?.values?.join(", ") || "Unknown"}
      - Stressors: ${profile?.stressors?.join(", ") || "Unknown"}
      - Communication Style: ${profile?.communicationStyle || "Empathetic and direct"}
      
      CURRENT STATE:
      - Stress Level: ${profile?.currentState?.stress || "Unknown"}%
      - Energy Level: ${profile?.currentState?.energy || "Unknown"}%

      YOUR GOAL:
      Provide support, guidance, and perspective shifts tailored specifically to the user's personality, values, and CURRENT STATE.
      If Stress is high (>70%), be extra soothing, validate their feelings, and suggest a breathing exercise.
      If Energy is low (<30%), be gentle and encouraging, suggesting small, manageable steps.
      If the user is high in Openness, use metaphors and philosophical concepts.
      Always aim to move the user from stress to clarity.
    `;

        if (isVoice) {
            systemPrompt += `
            
            CRITICAL INSTRUCTIONS FOR VOICE OUTPUT (ElevenLabs V3):
            1. Write for the EAR. Use short, simple sentences.
            2. Use natural pauses indicated by "..." or commas.
            3. You MAY use acting cues in parentheses at the start, like (softly), (warmly), (thoughtfully), but DO NOT write "Stage Direction:" or "Tone:".
            4. Output ONLY the dialogue to be spoken (and optional cue).
            5. Keep it concise (under 50 words unless explaining a concept).
            `;
        }

        // Convert history to Anthropic format
        const anthropicHistory = history.map((msg: any) => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.parts[0].text,
        }));

        // Append current message
        const messages = [
            ...anthropicHistory,
            { role: "user", content: message }
        ];

        console.log("Chat API Request:", { message, historyLength: history?.length });

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 500,
            system: systemPrompt,
            messages: messages,
        });

        console.log("Anthropic Response Status:", response.type);

        // Handle the response content safely
        let textResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : "I'm here with you.";

        // Strip acting tags like (softly), [warmly], etc.
        textResponse = textResponse
            .replace(/\(.*?\)/g, "") // Remove (...)
            .replace(/\[.*?\]/g, "") // Remove [...]
            .trim();

        console.log("Chat API Output:", textResponse);

        return NextResponse.json({ response: textResponse });
    } catch (error) {
        console.error("Chat Error Detailed:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
