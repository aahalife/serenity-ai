import { model, PROFILE_INFERENCE_PROMPT } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { executeComposioAction } from "@/lib/composio";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { name, answers } = await req.json();
        const entityId = session?.user?.email || "default_user";

        // Fetch data via Composio
        // Note: In a real scenario, we would check if connected first
        const instagramData = await executeComposioAction(entityId, "instagram_get_user_profile");
        const googleData = await executeComposioAction(entityId, "google_people_get_contact", { resourceName: "people/me" });

        // Construct a rich context object
        const userData = {
            name,
            onboardingAnswers: answers,
            googleProfile: googleData || "Not connected",
            instagramProfile: instagramData || "Not connected"
        };

        const prompt = PROFILE_INFERENCE_PROMPT.replace(
            "{{USER_DATA}}",
            JSON.stringify(userData, null, 2)
        );

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const profile = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Profile Inference Error:", error);
        return NextResponse.json({ error: "Failed to infer profile" }, { status: 500 });
    }
}
