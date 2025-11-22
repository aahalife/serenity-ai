import { model, PROFILE_INFERENCE_PROMPT } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { executeComposioAction } from "@/lib/composio";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { name, answers, signals } = await req.json();
        const entityId = session?.user?.email || "default_user";

        let googleData = "Not connected";
        let instagramData = "Not connected";

        // Try fetching data via Composio, but don't fail if it errors
        try {
            if (session?.user?.email) {
                // Only attempt if we have a valid session/entity
                // In a real app, we'd check connection status first
                // instagramData = await executeComposioAction(entityId, "instagram_get_user_profile");
                // googleData = await executeComposioAction(entityId, "google_people_get_contact", { resourceName: "people/me" });
            }
        } catch (e) {
            console.warn("Composio fetch failed, proceeding with partial data", e);
        }

        // Construct a rich context object with fallbacks
        const userData = {
            name: name || "User",
            onboardingAnswers: answers || {},
            googleProfile: googleData,
            instagramProfile: instagramData,
            signals: {
                timezone: signals?.timezone || "Unknown",
                location: signals?.location || "Unknown",
                userAgent: signals?.userAgent || "Unknown"
            }
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
        // Return a basic profile instead of 500 to keep the app working
        return NextResponse.json({
            profile: {
                identity: "Explorer",
                traits: { Openness: 0.5, Conscientiousness: 0.5, Extraversion: 0.5, Agreeableness: 0.5, Neuroticism: 0.5 },
                needs: ["Exploration", "Balance"],
                values: ["Growth", "Harmony"]
            }
        });
    }
}
