import { genAI } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history, profile } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const systemPrompt = `
      You are Serenity, a highly intelligent, empathetic, and psychologically attuned AI companion.
      
      USER PROFILE CONTEXT:
      - Name: ${profile?.name || "User"}
      - Personality (OCEAN): ${JSON.stringify(profile?.ocean || {})}
      - Core Values: ${profile?.values?.join(", ") || "Unknown"}
      - Stressors: ${profile?.stressors?.join(", ") || "Unknown"}
      - Communication Style: ${profile?.communicationStyle || "Empathetic and direct"}

      YOUR GOAL:
      Provide support, guidance, and perspective shifts tailored specifically to the user's personality and values.
      If the user is high in Neuroticism, be extra soothing and validating.
      If the user is high in Openness, use metaphors and philosophical concepts.
      Always aim to move the user from stress to clarity.

      CURRENT CONTEXT:
      User Message: "${message}"
    `;

        const chat = model.startChat({
            history: history.map((msg: any) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(systemPrompt);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
