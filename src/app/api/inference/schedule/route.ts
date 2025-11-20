import { NextRequest, NextResponse } from "next/server";
import { generateSmartSchedule } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { flowState, userProfile, habits } = await req.json();

        if (!flowState) {
            return NextResponse.json({ error: "Flow State is required" }, { status: 400 });
        }

        // userProfile might be null if not yet created, handle gracefully
        const profileToUse = userProfile || { name: "User", goals: ["General Wellness"] };
        const habitsToUse = habits || [];

        const schedule = await generateSmartSchedule(flowState, profileToUse, habitsToUse);
        return NextResponse.json({ schedule });
    } catch (error) {
        console.error("Error generating schedule:", error);
        return NextResponse.json({ error: "Error generating schedule" }, { status: 500 });
    }
}
