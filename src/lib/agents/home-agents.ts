import { FunctionDeclaration, SchemaType } from "@google/generative-ai";

// --- Sub-Agent Definitions ---

export const AGENTS = {
    BURSAR: {
        name: "Bursar",
        description: "Manages household finances, budget, and purchasing.",
    },
    FACILITY_MANAGER: {
        name: "Facility Manager",
        description: "Handles maintenance, repairs, and physical home systems.",
    },
    ARCHIVIST: {
        name: "Archivist",
        description: "Organizes documents, memories, and digital records.",
    },
    COORDINATOR: {
        name: "Coordinator",
        description: "Manages schedules, events, and family logistics.",
    },
};

// --- Tool Definitions (Function Declarations) ---

export const listEventsTool: FunctionDeclaration = {
    name: "listEvents",
    description: "List upcoming events from the calendar.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            count: {
                type: SchemaType.NUMBER,
                description: "Number of events to fetch.",
            },
        },
        required: ["count"],
    },
};

export const checkPermissionsTool: FunctionDeclaration = {
    name: "checkPermissions",
    description: "Check if the system has necessary permissions for a service.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            service: {
                type: SchemaType.STRING,
                description: "The service to check (e.g., 'calendar', 'gmail', 'docs').",
            },
        },
        required: ["service"],
    },
};

export const requestPermissionTool: FunctionDeclaration = {
    name: "requestPermission",
    description: "Request specific permissions from the user.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            service: {
                type: SchemaType.STRING,
                description: "The service to request access for.",
            },
            reason: {
                type: SchemaType.STRING,
                description: "The reason why access is needed.",
            },
        },
        required: ["service", "reason"],
    },
};

// --- System Prompt ---

export const ORCHESTRATOR_SYSTEM_PROMPT = `
You remain the Central Home Orchestrator, powered by Gemini 3.0.
Your goal is to be a proactive, intelligent, and helpful home management system.

You have access to four specialist sub-agents, but YOU are the primary interface.
1. **Bursar**: Finances & Budget.
2. **Facility Manager**: Home Maintenance.
3. **Archivist**: Digital Organization & Memories.
4. **Coordinator**: Schedule & Logistics.

**Principles:**
- **Proactive**: Don't just wait for commands. Suggest things based on context.
- **Concise**: Speak naturally but efficiently.
- **Agentic**: When a task clearly falls under a sub-agent's domain, acknowledge it and mention you are consulting them (physically represented by using provided tools/data).
- **Permissions**: You respect user privacy. If you need to access personal data (Calendar, etc.) and don't have permission, you MUST ask using the \`requestPermission\` tool or checking with \`checkPermissions\`.

**Current User Context:**
The user is at home.

**Response Style:**
- Use a warm, professional, yet slightly "liquid/fluid" tone, matching the "Serenity" aesthetic.
- If you need to perform an action, use the available tools.
`;

// --- Mock Tool Implementations ---

export async function handleToolCall(functionCall: any) {
    const { name, args } = functionCall;

    switch (name) {
        case "listEvents":
            return {
                events: [
                    { title: "Team Meeting", time: "Tomorrow 10 AM" },
                    { title: "Grocery Run", time: "Saturday 11 AM" },
                ],
            };
        case "checkPermissions":
            // Mock: Calendar is missing, others are present
            return { hasPermission: args.service !== "calendar" };
        case "requestPermission":
            return { status: "requested", message: `Permission request sent for ${args.service}` };
        default:
            return { error: "Unknown tool" };
    }
}
