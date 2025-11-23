import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Twilio sends data as application/x-www-form-urlencoded
        const formData = await req.formData();
        const body: any = {};
        formData.forEach((value, key) => {
            body[key] = value;
        });

        console.log("[Twilio Voice Webhook] Received call from:", body.From);

        // Simple TwiML response
        const twiml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Say voice="alice">Hello, welcome to Serenity AI. Take a deep breath.</Say>
            <Pause length="1"/>
            <Say voice="alice">We are currently building our voice interface. Please check back soon.</Say>
        </Response>
        `.trim();

        return new NextResponse(twiml, {
            headers: {
                'Content-Type': 'text/xml',
            },
        });
    } catch (error: any) {
        console.error("Twilio Voice Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
