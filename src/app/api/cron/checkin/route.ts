import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

if (process.env.NEXT_PUBLIC_serenity_SUPABASE_URL && process.env.NEXT_PUBLIC_serenity_SUPABASE_ANON_KEY) {
    supabase = createClient(
        process.env.NEXT_PUBLIC_serenity_SUPABASE_URL,
        process.env.NEXT_PUBLIC_serenity_SUPABASE_ANON_KEY
    );
}

export async function GET(req: Request) {
    try {
        // 1. Fetch users who haven't been seen in 24 hours
        // For this demo, we'll simulate fetching a user from localStorage/Supabase context passed via query or just a mock
        // In production: SELECT * FROM profiles WHERE last_seen < NOW() - INTERVAL '24 hours'

        console.log("[Cron] Checking for inactive users...");

        // Mock user for demonstration
        const mockUser = {
            phoneNumber: "+1234567890", // Replace with real data
            lastSeen: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
            name: "Friend"
        };

        // 2. Check for "Psychologically Rich" suggestions in their calendar
        // Mock suggestion
        const suggestion = "Take a different route to work to spark curiosity.";
        const hasSuggestion = true;

        let message = "";

        if (hasSuggestion) {
            message = `Hi ${mockUser.name}! Serenity here. Did you get a chance to ${suggestion.toLowerCase()} today?`;
        } else {
            message = `Hi ${mockUser.name}, just checking in. How is your day going?`;
        }

        // 3. Send WhatsApp Message
        if (mockUser.phoneNumber) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/whatsapp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: mockUser.phoneNumber, message })
            });
        }

        return NextResponse.json({ status: "Check-in complete", messaged: mockUser.phoneNumber });
    } catch (error: any) {
        console.error("Check-in Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
