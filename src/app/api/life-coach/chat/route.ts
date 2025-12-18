import { NextResponse } from "next/server";
import { generateLifeCoachResponse } from "@/lib/life-coach/agent";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // Convert history if needed, or pass as is (agent expects specific format but handles basic arrays)
        // Here we just pass message history for context window
        // In production, we'd fetch persistent history from DB

        // Mock user context for now - in production, get from UserContext via session or DB
        const userContext = "User is exploring life coaching features. Interest in productivity and health.";

        const responseText = await generateLifeCoachResponse(message, history, userContext);

        return NextResponse.json({ role: 'assistant', content: responseText });

    } catch (error) {
        console.error("Life Coach API Error:", error);
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
}
