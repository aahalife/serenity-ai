import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
    try {
        // Twilio sends data as application/x-www-form-urlencoded
        const formData = await req.formData();
        const body: any = {};
        formData.forEach((value, key) => {
            body[key] = value;
        });

        console.log("[Twilio Webhook] Received:", JSON.stringify(body, null, 2));

        const message = body.Body;
        const sender = body.From; // e.g., whatsapp:+1234567890

        if (!message || !sender) {
            console.log("Ignored webhook: Missing Body or From");
            return NextResponse.json({ status: "ignored" });
        }

        // Get user context (Mocked for now)
        const userContext = "User is feeling slightly stressed but productive.";

        // Generate AI Response
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929", // Or latest available
            max_tokens: 150,
            system: `You are Serenity, a supportive and wise AI friend. 
            The user is chatting with you via WhatsApp. 
            Keep your responses concise (under 2 sentences), warm, and empathetic.
            Context: ${userContext}`,
            messages: [{ role: "user", content: message }],
        });

        const aiText = response.content[0].type === 'text' ? response.content[0].text : "I'm here for you.";

        // Send reply back via our Send API (loopback)
        // Note: We strip 'whatsapp:' prefix if our Send API expects raw number, 
        // but our Send API now handles it.
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: sender, message: aiText })
        });

        return NextResponse.json({ status: "success" });
    } catch (error: any) {
        console.error("Twilio Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
