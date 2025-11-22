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

            // Determine tone based on step
            let toneInstruction = "Use a very steady, relaxed, focused, and meditative tone.";
            if (stepId === "turnaround") {
                toneInstruction = "Use a positive, uplifting, satisfying, and content tone. Celebrate the shift in perspective.";
            } else if (stepId === "q3" || stepId === "q4") {
                toneInstruction = "Be deeply empathetic, gentle, and soft. Like a close friend whispering support.";
            }

            systemPrompt = `
                You are Serenity, a gentle, wise, and empathetic friend guiding the user through 'The Work' by Byron Katie.
                Your goal is to help them sit with the question, not just answer it intellectually.
                
                CRITICAL INSTRUCTIONS FOR SPEECH GENERATION:
                1. Write for the EAR. Use short, simple sentences.
                2. Use natural pauses indicated by "..." or commas.
                3. **DO NOT** use stage directions, acting cues, or tags (like (softly)). The TTS engine might read them aloud. Just write the spoken words.
                4. **DO NOT** repeat the question verbatim. Rephrase it gently.
                5. Use the user's name (${userName}) naturally.
                6. Keep it under 50 words.
                7. TONE: ${toneInstruction}
                8. PERSONALIZATION: Use the context of their thought ("${input}") and their previous answers to make it feel real and immersive.
            `;

            const stepPrompts: Record<string, string> = {
                "intro": `Welcome ${userName}. Ask them to gently bring the stressful thought "${input || 'that is on your mind'}" to presence. Tell them there is no rush.`,
                "q1": `The thought is: "${input}". Ask them gently if it is true. Guide them to close their eyes and listen for a Yes or No from their heart.`,
                "q2": `Ask if they can absolutely know it's true. Invite them to look deeper, past the quick answer. "Can you really know that..."`,
                "q3": `Ask how they react when they believe "${input}". What happens in their body? Do they feel tension? Do images of the past appear?`,
                "q4": `Ask who they would be without the thought "${input}". Invite them to drop the story for just a moment. "Imagine you are looking at the situation, but you cannot think this thought..."`,
                "turnaround": `Invite them to turn it around. "Let's find the opposite." Guide them to feel the relief or truth in the opposite.`
            };

            prompt = stepPrompts[stepId] || "Guide the user gently through this moment.";

            // Return plain text for guidance, not JSON
            console.log("Generating guidance for step:", stepId);
            const response = await anthropic.messages.create({
                model: "claude-sonnet-4-5-20250929",
                max_tokens: 150,
                system: systemPrompt,
                messages: [{ role: "user", content: prompt }],
            });

            const textResponse = response.content[0].type === 'text'
                ? response.content[0].text
                : "Take a moment to breathe.";

            // Double clean to remove any leaked tags like (softly) or Stage Direction:
            const cleanText = textResponse.replace(/^\(.*\)\s*/, "").replace(/Stage Direction:.*$/im, "").trim();

            console.log("Guidance generated:", cleanText);
            return NextResponse.json({ text: cleanText });
        }

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
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
