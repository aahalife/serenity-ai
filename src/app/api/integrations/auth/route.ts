import { composioToolset } from "@/lib/composio";
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

        // Initiate connection using shared toolset
        const connection = await composioToolset.connectedAccounts.initiate({
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

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const appName = searchParams.get('appName');

        if (!appName) {
            return NextResponse.json({ error: "appName is required" }, { status: 400 });
        }

        const entityId = session?.user?.email || "default_user";

        const connection = await composioToolset.connectedAccounts.initiate({
            appName: appName,
            entityId: entityId,
            redirectUri: `${process.env.NEXTAUTH_URL}/profile`,
        });

        if (connection.redirectUrl) {
            return NextResponse.redirect(connection.redirectUrl);
        }

        return NextResponse.json({ error: "No redirect URL returned" }, { status: 500 });
    } catch (error) {
        console.error("Auth GET Error:", error);
        return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
    }
}
