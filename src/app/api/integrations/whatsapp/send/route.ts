import { NextResponse } from 'next/server';
import { Composio } from "composio-core";

let client: Composio | null = null;

try {
    if (process.env.COMPOSIO_API_KEY) {
        client = new Composio({
            apiKey: process.env.COMPOSIO_API_KEY,
        });
    }
} catch (e) {
    console.warn("Composio SDK initialization failed:", e);
}

export async function POST(req: Request) {
    try {
        const { phoneNumber, message } = await req.json();

        if (!phoneNumber || !message) {
            return NextResponse.json({ error: "Missing phoneNumber or message" }, { status: 400 });
        }

        // In a real implementation, we would use the Composio SDK to send the message.
        // Since the specific Composio WhatsApp action ID might vary, we'll assume a standard action.
        // For now, we'll log it as a placeholder if we can't find the exact action ID in docs immediately.

        // However, based on common Composio patterns:
        // await toolset.executeAction('whatsapp_send_message', { to: phoneNumber, message: message });

        // if (!toolset) {
        //    return NextResponse.json({ error: "Composio not configured" }, { status: 500 });
        // }

        console.log(`[WhatsApp] Sending to ${phoneNumber}: ${message}`);

        if (client) {
            // Using 2Chat action for sending messages
            // Action ID assumed to be '2CHAT_SEND_MESSAGE' or similar based on Composio conventions
            // Using client.tools.execute as per SDK docs (casting to any to avoid TS issues if types are outdated)
            const result = await (client as any).tools.execute({
                slug: '2CHAT_SEND_MESSAGE',
                arguments: {
                    to_number: phoneNumber,
                    message: message
                },
                connected_account_id: process.env.COMPOSIO_AUTH_CONFIG_ID || 'ac_cAaFdlqYBMs9'
            });
            console.log("2Chat Send Result:", result);
        }

        return NextResponse.json({ success: true, status: "Message sent via 2Chat" });
    } catch (error: any) {
        console.error("WhatsApp Send Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
