import { anthropic } from "@/lib/anthropic";
import { JOURNAL_ANALYSIS_PROMPT } from "@/lib/gemini"; // Keeping prompt for now, will refactor later if needed
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { entry } = await req.json();

        const prompt = JOURNAL_ANALYSIS_PROMPT.replace("{{ENTRY}}", entry);

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const textResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : "{}";

        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Journal Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze journal" }, { status: 500 });
    }
}
