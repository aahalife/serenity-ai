import { anthropic } from "@/lib/anthropic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { mode, input, context, stepId, userProfile } = await req.json();

        let prompt = "";
        let systemPrompt = "You are Serenity, an empathetic AI guide for 'The Work' inquiry process.";

        if (mode === "suggestions") {
            prompt = `
                Provide 3 short, relatable, and specific examples of stressful thoughts that someone might have in this situation: "${context || "general stress"}".
                Format as a JSON array of strings.
                Example: ["I am not good enough.", "They shouldn't have said that.", "I will never finish this on time."]
            `;
        } else if (mode === "turnaround") {
            prompt = `
                The user has investigated the thought: "${input}".
                Generate 3 powerful "turnarounds" (opposites) for this thought.
                For each turnaround, provide a brief, 1-sentence example of how it could be as true or truer.
                Format as a JSON array of objects with 'text' and 'example' fields.
            `;
        } else if (mode === "guidance") {
            // Speech-optimized guidance generation
            const userName = userProfile?.name || "friend";

            systemPrompt = `
                You are Serenity, a gentle, wise, and empathetic friend guiding the user through 'The Work' by Byron Katie.
                Your goal is to help them sit with the question, not just answer it intellectually.
                
                CRITICAL INSTRUCTIONS FOR SPEECH GENERATION:
                1. Write for the EAR, not the eye. Use short, simple sentences.
                2. Use natural pauses (indicated by "...") to let the user think.
                3. Be slow, gentle, and steady.
                4. Do NOT repeat the question verbatim from the screen. Instead, rephrase it or offer a way to hold it.
                5. Use the user's name (${userName}) naturally, but not in every sentence.
                6. Keep it under 40 words.
            `;

            const stepPrompts: Record<string, string> = {
                "intro": `Welcome the user. Ask them to gently bring a stressful thought to mind. Tell them there is no rush.`,
                "q1": `The thought is: "${input}". Ask them gently if it is true. Remind them to just listen for a Yes or No from their heart.`,
                "q2": `Ask if they can absolutely know it's true. Invite them to look deeper, past the quick answer.`,
                "q3": `Ask how they react when they believe this thought. What happens in their body? Do images of the past or future appear?`,
                "q4": `Ask who they would be without this thought. Invite them to drop the story for just a moment and see what's left.`,
                "turnaround": `Invite them to turn the thought around. To the opposite, to the other, or to themselves. Ask them to find one example of how the opposite might be true.`
            };

            prompt = stepPrompts[stepId] || "Guide the user gently through this moment.";

            // Return plain text for guidance, not JSON
            console.log("Generating guidance for step:", stepId);
            const response = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 150,
                system: systemPrompt,
                messages: [{ role: "user", content: prompt }],
            });

            const textResponse = response.content[0].type === 'text'
                ? response.content[0].text
                : "Take a moment to breathe.";

            console.log("Guidance generated:", textResponse);
            return NextResponse.json({ text: textResponse });
        }

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const textResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : "[]";

        // Clean up markdown code blocks if present
        const cleanedResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        return NextResponse.json(JSON.parse(cleanedResponse));
    } catch (error) {
        console.error("Inference Error Detailed:", error);
        return NextResponse.json(
            { error: "Failed to generate insight" },
            { status: 500 }
        );
    }
}
