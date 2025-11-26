import { anthropic } from "@/lib/anthropic";
import { NextResponse } from "next/server";
import { TECHNIQUES } from "@/lib/stress-relief/data";
import { buildSystemPrompt } from "@/lib/stress-relief/prompts";

export async function POST(req: Request) {
    try {
        const { message, history, techniqueId, userProfile } = await req.json();

        const technique = TECHNIQUES.find(t => t.id === techniqueId);
        if (!technique) {
            return NextResponse.json({ error: "Technique not found" }, { status: 404 });
        }

        const systemPrompt = buildSystemPrompt(technique, userProfile);

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

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 500,
            system: systemPrompt,
            messages: messages,
        });

        let textResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : "I'm here.";

        // Strip acting tags
        textResponse = textResponse
            .replace(/\(.*?\)/g, "")
            .replace(/\[.*?\]/g, "")
            .trim();

        return NextResponse.json({ response: textResponse });
    } catch (error) {
        console.error("Stress Relief Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
