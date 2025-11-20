import { model, PROFILE_INFERENCE_PROMPT } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const userData = await req.json();

        const prompt = PROFILE_INFERENCE_PROMPT.replace(
            "{{USER_DATA}}",
            JSON.stringify(userData, null, 2)
        );

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const profile = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Profile Inference Error:", error);
        return NextResponse.json({ error: "Failed to infer profile" }, { status: 500 });
    }
}
