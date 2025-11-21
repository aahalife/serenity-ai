import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { PSYCHOLOGICAL_RICHNESS_PROMPT } from "@/lib/gemini"; // Keeping prompt template

export async function POST(req: NextRequest) {
    try {
        const { flowState, userProfile, habits } = await req.json();

        if (!flowState) {
            return NextResponse.json({ error: "Flow State is required" }, { status: 400 });
        }

        // userProfile might be null if not yet created, handle gracefully
        const profileToUse = userProfile || { name: "User", goals: ["General Wellness"] };
        const habitsToUse = habits || [];
        const timeAvailable = "2 hours"; // Default or extract from req if needed

        const prompt = PSYCHOLOGICAL_RICHNESS_PROMPT
            .replace('${userProfile}', JSON.stringify(profileToUse, null, 2))
            .replace('${flowState}', JSON.stringify(flowState, null, 2))
            .replace('${habits}', JSON.stringify(habitsToUse, null, 2))
            .replace('${timeAvailable}', timeAvailable);

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 2048,
            messages: [{ role: "user", content: prompt }],
        });

        const textResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : "[]";

        // Clean up markdown if present
        const jsonString = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const schedule = JSON.parse(jsonString);

        return NextResponse.json({ schedule });
    } catch (error) {
        console.error("Error generating schedule:", error);
        // Fallback to a basic schedule if generation fails
        const fallbackSchedule = [
            {
                time: "Now",
                title: "Mindful Breathing",
                description: "Take a moment to center yourself.",
                insight: "Fallback schedule due to generation error.",
                type: "Rest",
                duration: "5 min",
                visual_prompt: "A calm blue ocean wave, abstract, minimal"
            }
        ];
        return NextResponse.json({ schedule: fallbackSchedule });
    }
}
