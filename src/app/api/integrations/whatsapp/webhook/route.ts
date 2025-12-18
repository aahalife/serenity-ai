import { NextResponse } from 'next/server';
import { generateLifeCoachResponse } from '@/lib/life-coach/agent';

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

        // Generate AI Response using Life Coach Agent
        // History could be fetched from DB strictly, but here we pass empty or minimal
        const aiText = await generateLifeCoachResponse(message, [], userContext);

        // Send reply back directly via Twilio API
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+16696006540';

        if (!accountSid || !authToken) {
            console.error("Twilio credentials missing");
            return NextResponse.json({ error: "Twilio configuration missing" }, { status: 500 });
        }

        const to = sender.startsWith('whatsapp:') ? sender : `whatsapp:${sender}`;
        const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

        const bodyParams = new URLSearchParams({
            From: from,
            To: to,
            Body: aiText,
        });

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString(),
        });

        return NextResponse.json({ status: "success" });
    } catch (error: any) {
        console.error("Twilio Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
