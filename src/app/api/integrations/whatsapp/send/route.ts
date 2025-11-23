import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { phoneNumber, message } = await req.json();

        if (!phoneNumber || !message) {
            return NextResponse.json({ error: "Missing phoneNumber or message" }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+16696006540'; // Default to user's number

        if (!accountSid || !authToken) {
            console.error("Twilio credentials missing");
            return NextResponse.json({ error: "Twilio configuration missing" }, { status: 500 });
        }

        console.log(`[Twilio] Sending WhatsApp to ${phoneNumber}: ${message}`);

        // Ensure numbers have 'whatsapp:' prefix
        const to = phoneNumber.startsWith('whatsapp:') ? phoneNumber : `whatsapp:${phoneNumber}`;
        const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

        const body = new URLSearchParams({
            From: from,
            To: to,
            Body: message,
        });

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Twilio API Error:", errorData);
            throw new Error(errorData.message || "Failed to send message via Twilio");
        }

        const result = await response.json();
        console.log("Twilio Send Result SID:", result.sid);

        return NextResponse.json({ success: true, status: "Message sent via Twilio", sid: result.sid });
    } catch (error: any) {
        console.error("WhatsApp Send Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
