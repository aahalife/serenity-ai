import { anthropic } from "@/lib/anthropic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { mode, input, context } = await req.json();

        let prompt = "";

        if (mode === "suggestions") {
            prompt = `
                You are an empathetic psychological assistant helping a user identify stressful thoughts.
                The user might be feeling stuck or having writer's block.
                Provide 3 short, relatable, and specific examples of stressful thoughts that someone might have in this situation: "${context || "general stress"}".
                Format as a JSON array of strings.
                Example: ["I am not good enough.", "They shouldn't have said that.", "I will never finish this on time."]
            `;
        } else if (mode === "turnaround") {
            prompt = `
                You are an expert in "The Work" by Byron Katie.
                The user has investigated the thought: "${input}".
                Generate 3 powerful "turnarounds" (opposites) for this thought.
                For each turnaround, provide a brief, 1-sentence example of how it could be as true or truer.
                Format as a JSON array of objects with 'text' and 'example' fields.
            `;
        }

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const textResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : "[]";

        // Clean up markdown code blocks if present
        const cleanedResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        return NextResponse.json(JSON.parse(cleanedResponse));
    } catch (error) {
        console.error("Inference Error:", error);
        return NextResponse.json(
            { error: "Failed to generate insight" },
            { status: 500 }
        );
    }
}
