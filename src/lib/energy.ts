import { model, ENERGY_ESTIMATION_PROMPT, RICH_CONTENT_PROMPT } from "./gemini";

export async function estimateEnergy(context: any) {
    try {
        const prompt = ENERGY_ESTIMATION_PROMPT
            .replace("{{TIME}}", new Date().toLocaleTimeString())
            .replace("{{ACTIVITY}}", context.activity || "Unknown")
            .replace("{{SENTIMENT}}", context.sentiment || "Neutral")
            .replace("{{CHRONOTYPE}}", context.chronotype || "Bear");

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
        console.error("Energy Estimation Error:", error);
        return { energyLevel: 5, stressLevel: 5, reasoning: "Fallback due to error" };
    }
}

export async function generateRichContent(context: any) {
    try {
        const prompt = RICH_CONTENT_PROMPT
            .replace("{{ENERGY}}", context.energyLevel.toString())
            .replace("{{STRESS}}", context.stressLevel.toString())
            .replace("{{INTERESTS}}", context.interests?.join(", ") || "General Wellbeing");

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };
    } catch (error) {
        console.error("Content Generation Error:", error);
        return { suggestions: [] };
    }
}
