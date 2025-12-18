import { NextResponse } from 'next/server';
import { generateLifeCoachResponse } from '@/lib/life-coach/agent';

// Helper to determine active "Pillar" based on day of week or random
function getDailyTopic() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topics = {
        'Monday': 'Wealth & Career (The Engine)',
        'Tuesday': 'Health (Biological Engine)',
        'Wednesday': 'Connection (Social Network)',
        'Thursday': 'Happiness & Mindset (Operating System)',
        'Friday': 'Love & Relationships',
        'Saturday': 'Deep Work / hobbies',
        'Sunday': 'Rest & Reset'
    };
    const day = days[new Date().getDay()];
    // @ts-ignore
    return topics[day] || 'General Check-in';
}

export async function GET(req: Request) {
    // Cron job authentication (Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // In a real app, we would iterate over all users who have opted in
        // For this demo/MVP, we target the specific user/number configured in env

        const userPhone = process.env.TEST_USER_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER; // Fallback for demo

        if (!userPhone) {
            console.log("No usage phone number configured for check-ins.");
            return NextResponse.json({ status: "skipped", reason: "no_user_phone" });
        }

        const topic = getDailyTopic();
        const prompt = `[Proactive Check-in]
        The user hasn't logged interaction today. 
        It is 5 PM. 
        Topic: ${topic}.
        Generate a warm, one-line check-in message to start a conversation via WhatsApp. 
        Do not be annoying. Be helpful.`;

        // Generate message
        // We pass empty history as this is a new initiation
        const message = await generateLifeCoachResponse(prompt, [], "Proactive Check-in Triggered");

        // Send via WhatsApp (call our own internal send route or use Twilio directly)
        // Using existing send route logic for consistency (refactored here into direct call to avoid self-fetch issues in some envs)

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+16696006540';

        if (!accountSid || !authToken) {
            throw new Error("Twilio creds missing");
        }

        const to = userPhone.startsWith('whatsapp:') ? userPhone : `whatsapp:${userPhone}`;
        const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

        const bodyParams = new URLSearchParams({
            From: from,
            To: to,
            Body: message,
        });

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString(),
        });

        if (!twilioRes.ok) {
            const err = await twilioRes.json();
            console.error("Twilio Send Error in Cron:", err);
            throw new Error("Failed to send WhatsApp");
        }

        return NextResponse.json({ status: "success", sent_to: to, message: message });

    } catch (error: any) {
        console.error("Cron Check-in Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
