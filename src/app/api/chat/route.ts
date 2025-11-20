import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // Basic chat implementation for now
        // In a real app, we would inject the system prompt and profile context here
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
