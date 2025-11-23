import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("[Composio Webhook] Received:", JSON.stringify(body, null, 2));

        // Composio webhooks might wrap the actual provider payload
        // Structure: { payload: { ... }, type: '...' } or direct provider payload
        const payload = body.payload || body;

        // Parse incoming message from 2Chat payload (inside Composio wrapper)
        // 2Chat structure typically includes 'message' object with 'body' and 'from'
        const message = payload.message?.body || payload.text || payload.message;
        const sender = payload.message?.from || payload.from || payload.sender;

        if (!message || !sender) {
            console.log("Ignored webhook: Missing message or sender in payload");
            return NextResponse.json({ status: "ignored" });
        }

        // Get user context (Mocked for now, ideally fetch from Supabase using phone number)
        const userContext = "User is feeling slightly stressed but productive.";

        // Generate AI Response
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 150,
            system: `You are Serenity, a supportive and wise AI friend. 
            The user is chatting with you via WhatsApp. 
            Keep your responses concise (under 2 sentences), warm, and empathetic.
            Context: ${userContext}`,
            messages: [{ role: "user", content: message }],
        });

        const aiText = response.content[0].type === 'text' ? response.content[0].text : "I'm here for you.";

        // Send reply back via our Send API (loopback)
        // In production, we'd call the Composio SDK directly or use the response mechanism of the webhook
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: sender, message: aiText })
        });

        return NextResponse.json({ status: "success" });
    } catch (error: any) {
        console.error("WhatsApp Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
