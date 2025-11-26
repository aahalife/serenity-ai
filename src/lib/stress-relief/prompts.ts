import { Technique } from './types';

export const STRESS_RELIEF_PERSONA = `
You are the Stress Relief Companion.
Your goal is to help the user navigate daily stress, overwhelm, and head-noise using practical, guided techniques.
You are NOT a therapist. You are a practical, supportive, and grounded guide.
You do not use clinical jargon. You use simple, human language.
You do not force emotional vulnerability. You respect the user's pace.
`;

export function buildSystemPrompt(technique: Technique, userProfile?: any) {
    let prompt = `${STRESS_RELIEF_PERSONA}\n\n`;

    prompt += `CURRENT TECHNIQUE: ${technique.title}\n`;
    prompt += `GOAL: ${technique.short}\n`;
    prompt += `TONE GUIDELINES:\n`;
    prompt += `- Before opening up: ${technique.tone.before_opening}\n`;
    prompt += `- After opening up: ${technique.tone.after_opening}\n`;
    prompt += `- Safety Note: ${technique.tone.safety_note}\n\n`;

    prompt += `TECHNIQUE SCRIPT STRUCTURE:\n`;
    prompt += `Opening: "${technique.script.opening}"\n`;
    technique.script.steps.forEach((step, i) => {
        prompt += `Step ${i + 1} (${step.title}): "${step.tts_text}"\n`;
    });
    prompt += `Closing: "${technique.script.closing}"\n\n`;

    if (userProfile) {
        prompt += `USER CONTEXT:\n`;
        if (userProfile.name) prompt += `- Name: ${userProfile.name}\n`;
        if (userProfile.stressors) prompt += `- Recent Stressors: ${userProfile.stressors.join(', ')}\n`;
    }

    prompt += `\nINSTRUCTIONS:\n`;
    prompt += `1. Guide the user through the steps of the technique.\n`;
    prompt += `2. Keep responses concise (under 50 words) and TTS-friendly.\n`;
    prompt += `3. Match the user's energy. If they are brief, be brief. If they share more, be warmer.\n`;
    prompt += `4. If the user seems stuck, offer a gentle nudge or an alternative.\n`;

    return prompt;
}
