import { ComposioToolSet } from "composio-core";
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

        // Initialize Composio ToolSet
        const toolset = new ComposioToolSet({
            apiKey: process.env.COMPOSIO_API_KEY,
        });

        // Initiate connection
        const connection = await toolset.connectedAccounts.initiate({
            appName: appName,
            entityId: entityId,
            redirectUri: `${process.env.NEXTAUTH_URL}/profile`,
        });

        return NextResponse.json({ url: connection.redirectUrl });
    } catch (error) {
        console.error("Auth URL Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
    }
}
