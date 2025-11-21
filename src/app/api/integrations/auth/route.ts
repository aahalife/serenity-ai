import { getComposioAuthUrl } from "@/lib/composio";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { appName } = await req.json();

        // Use user email as the unique Entity ID
        // Fallback to a default ID if no session (for dev/testing)
        const entityId = session?.user?.email || "default_user";

        const redirectUrl = await getComposioAuthUrl(entityId, appName);

        return NextResponse.json({ url: redirectUrl });
    } catch (error) {
        console.error("Auth URL Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
    }
}
