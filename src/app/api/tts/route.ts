import { NextRequest, NextResponse } from "next/server";
import { elevenlabs, VOICE_ID, MODEL_ID } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const audioStream = await elevenlabs.generate({
            voice: VOICE_ID,
            text,
            model_id: MODEL_ID,
            stream: true,
        });

        // Convert the stream to a ReadableStream for the response
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of audioStream) {
                    controller.enqueue(chunk);
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "audio/mpeg",
            },
        });
    } catch (error) {
        console.error("Error generating speech:", error);
        return NextResponse.json({ error: "Error generating speech" }, { status: 500 });
    }
}
