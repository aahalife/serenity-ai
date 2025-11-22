import { ComposioToolSet } from "composio-core";

// Initialize Composio ToolSet
// Using the API Key provided by the user
export const composioToolset = new ComposioToolSet({
    apiKey: process.env.COMPOSIO_API_KEY || "ak_w5v6SAFvuZGNN3_GxOhA",
});

export async function getComposioAuthUrl(entityId: string, appName: string) {
    try {
        // Get or create the entity
        const entity = await composioToolset.getEntity(entityId);

        // Initiate connection for the specific app (e.g., "instagram", "google_people")
        const connection = await entity.initiateConnection({
            appName: appName,
            redirectUri: `${process.env.NEXTAUTH_URL}/profile`, // Redirect back to profile after auth
        });

        return connection.redirectUrl;
    } catch (error) {
        console.error("Composio Auth Error:", error);
        throw error;
    }
}

export async function executeComposioAction(entityId: string, actionName: string, params: any = {}) {
    try {
        const entity = await composioToolset.getEntity(entityId);
        const response = await entity.execute({
            actionName: actionName,
            params: params
        });
        return response;
    } catch (error) {
        console.error(`Composio Action ${actionName} Error:`, error);
        return null;
    }
}
