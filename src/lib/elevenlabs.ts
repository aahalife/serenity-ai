import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const apiKey = process.env.ELEVENLABS_API_KEY || "build_placeholder";

if (!process.env.ELEVENLABS_API_KEY) {
    console.warn("Missing ELEVENLABS_API_KEY environment variable");
}

export const elevenlabs = new ElevenLabsClient({
    apiKey: apiKey,
});

export const VOICE_ID = "kdmDKE6EkgrWrrykO9Qt"; // The requested voice ID
export const MODEL_ID = "eleven_turbo_v2_5"; // Using Turbo v2.5 for low latency
