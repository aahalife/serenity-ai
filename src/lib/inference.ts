import { model, PROFILE_INFERENCE_PROMPT } from "./gemini";

export async function inferProfile(userData: any) {
    try {
        const prompt = PROFILE_INFERENCE_PROMPT.replace(
            "{{USER_DATA}}",
            JSON.stringify(userData, null, 2)
        );

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (handling potential markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return null;
    } catch (error) {
        console.error("Profile Inference Error:", error);
        return null;
    }
}
