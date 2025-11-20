import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // TODO: Integrate actual Image Generation API (DALL-E 3, Imagen, etc.)
        // For now, we will return a placeholder image or a specific Unsplash URL based on keywords
        // to simulate the experience without burning API credits or requiring a new key immediately.

        // Simple keyword matching for demo purposes
        let imageUrl = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000"; // Default abstract

        const p = prompt.toLowerCase();
        if (p.includes("nature") || p.includes("forest") || p.includes("tree")) {
            imageUrl = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000";
        } else if (p.includes("ocean") || p.includes("water") || p.includes("sea")) {
            imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000";
        } else if (p.includes("city") || p.includes("urban")) {
            imageUrl = "https://images.unsplash.com/photo-1449824913929-651196d2858f?auto=format&fit=crop&q=80&w=1000";
        } else if (p.includes("space") || p.includes("sky")) {
            imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000";
        } else if (p.includes("book") || p.includes("read")) {
            imageUrl = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000";
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json({ imageUrl });
    } catch (error) {
        console.error("Image Generation Error:", error);
        return NextResponse.json({ error: "Error generating image" }, { status: 500 });
    }
}
