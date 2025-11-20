import { ElevenLabsClient } from "elevenlabs";

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
    console.warn("Missing ELEVENLABS_API_KEY environment variable");
}

export const elevenlabs = new ElevenLabsClient({
    apiKey: apiKey || "placeholder", // Prevent crash if key is missing, but will fail on request
});

export const VOICE_ID = "kdmDKE6EkgrWrrykO9Qt"; // The requested voice ID
export const MODEL_ID = "eleven_turbo_v2_5"; // Using Turbo v2.5 for low latency
