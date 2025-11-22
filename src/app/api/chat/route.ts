import { anthropic } from "@/lib/anthropic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history, profile } = await req.json();

        const systemPrompt = `
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
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 500,
            system: systemPrompt,
            messages: messages,
        });

        console.log("Anthropic Response Status:", response.type);

        // Handle the response content safely
        const textResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : "I'm here with you.";

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
