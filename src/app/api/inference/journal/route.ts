import { model, JOURNAL_ANALYSIS_PROMPT } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { entry } = await req.json();

        const prompt = JOURNAL_ANALYSIS_PROMPT.replace("{{ENTRY}}", entry);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Journal Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze journal" }, { status: 500 });
    }
}
