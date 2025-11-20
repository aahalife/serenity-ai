import { model, STRESS_ANALYSIS_PROMPT } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { wpm, backspaceRate, sentiment, tone } = await req.json();

        const prompt = STRESS_ANALYSIS_PROMPT
            .replace("{{WPM}}", wpm.toString())
            .replace("{{BACKSPACE_RATE}}", backspaceRate.toString())
            .replace("{{SENTIMENT}}", sentiment || "Neutral")
            .replace("{{TONE}}", tone || "Neutral");

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Stress Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze stress" }, { status: 500 });
    }
}
