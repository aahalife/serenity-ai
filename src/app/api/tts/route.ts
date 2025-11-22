import { NextRequest, NextResponse } from "next/server";
import { elevenlabs, VOICE_ID, MODEL_ID } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const audioStream = await elevenlabs.textToSpeech.convert(VOICE_ID, {
            text,
            modelId: MODEL_ID,
            outputFormat: "mp3_44100_128",
        });

        return new NextResponse(audioStream as any, {
            headers: {
                "Content-Type": "audio/mpeg",
            },
        });
    } catch (error) {
        console.error("Error generating speech:", error);
        return NextResponse.json({ error: "Error generating speech" }, { status: 500 });
    }
}
