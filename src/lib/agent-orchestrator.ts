import { externalApi } from './external-api';

export type AgentType = 'ORCHESTRATOR' | 'BEHAVIORAL' | 'SLEEP' | 'STRESS' | 'BALANCE' | 'EXTERNAL_CHAT';

export interface AgentAction {
    id: string;
    type: 'internal_feature' | 'composio_tool' | 'music' | 'response';
    title: string;
    description: string;
    data?: any; // Link to feature, tool name, etc.
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface OrchestratorResponse {
    agentName: string;
    response: string;
    actions: AgentAction[];
    needsMoreInfo?: boolean;
}

export class AgentOrchestrator {
    // Simple keyword-based classifier for now (can be upgraded to LLM)
    static classifyIntent(query: string): 'AGENT_ACTION' | 'CASUAL_CHAT' {
        const actionKeywords = [
            'stress', 'anxious', 'panic', 'sleep', 'tired', 'insomnia',
            'work', 'deadline', 'schedule', 'calendar', 'plan', 'remind',
            'overwhelmed', 'break', 'breathe', 'music'
        ];

        const lowerQuery = query.toLowerCase();
        if (actionKeywords.some(k => lowerQuery.includes(k))) {
            return 'AGENT_ACTION';
        }
        return 'CASUAL_CHAT';
    }

    static async processRequest(query: string, userProfile: any, token?: string): Promise<OrchestratorResponse> {
        const intent = this.classifyIntent(query);

        // 1. External Chat Integration
        if (intent === 'CASUAL_CHAT' && token) {
            try {
                const extResponse = await externalApi.chat(query, token);
                // Assuming extResponse has a 'response' field or similar. 
                // The API docs didn't specify the exact response schema, so I'll assume it returns a message.
                // If the API returns a complex object, we'd parse it here.
                return {
                    agentName: 'Serenity Guide',
                    response: JSON.stringify(extResponse), // Placeholder until we know exact format
                    actions: []
                };
            } catch (e) {
                console.error("External API failed, falling back to local", e);
            }
        }

        // 2. Behavioral Agent ("Why")
        // In a real system, this would be an LLM call.
        // Here we simulate the "Why" analysis.
        const lowerQuery = query.toLowerCase();
        let agentName = 'Orchestrator';
        let response = "I'm listening.";
        let actions: AgentAction[] = [];

        // Stress Logic
        if (lowerQuery.includes('stress') || lowerQuery.includes('panic')) {
            agentName = 'Stress Manager';
            response = "I hear that you're stressed. Let's take immediate action to calm your nervous system.";

            // Internal Feature: Box Breathing
            actions.push({
                id: 'breathing-1',
                type: 'internal_feature',
                title: 'Box Breathing',
                description: '4-minute guided breathing to lower cortisol.',
                priority: 'CRITICAL',
                data: { url: '/breathing' }
            });

            // Internal Feature: Stress Relief
            actions.push({
                id: 'stress-relief-1',
                type: 'internal_feature',
                title: 'Stress Relief Tools',
                description: 'Personalized techniques for your coping style.',
                priority: 'HIGH',
                data: { url: '/stress-relief' }
            });

            // Music
            actions.push({
                id: 'music-1',
                type: 'music',
                title: 'Calming Playlist',
                description: 'Playing 40Hz binaural beats.',
                priority: 'MEDIUM',
                data: { spotifyId: '37i9dQZF1DWZqd5JICZI0u' } // Example playlist
            });
        }
        // Sleep Logic
        else if (lowerQuery.includes('sleep') || lowerQuery.includes('tired')) {
            agentName = 'Sleep Guardian';
            response = "Your sleep debt seems high. Let's adjust your schedule.";

            // Composio Tool: Calendar
            actions.push({
                id: 'calendar-1',
                type: 'composio_tool',
                title: 'Block Sleep Time',
                description: 'Schedule "Wind Down" at 10:00 PM.',
                priority: 'HIGH',
                data: { tool: 'google_calendar_create_event', params: { summary: 'Wind Down', start: '22:00' } }
            });
        }
        // Work/Balance Logic
        else if (lowerQuery.includes('work') || lowerQuery.includes('plan')) {
            agentName = 'Balance Keeper';
            response = "Let's break this down into manageable tasks.";

            actions.push({
                id: 'plan-1',
                type: 'composio_tool',
                title: 'Create Task List',
                description: 'Generate a checklist for your project.',
                priority: 'MEDIUM',
                data: { tool: 'todo_list_create' }
            });
        }

        return {
            agentName,
            response,
            actions
        };
    }
}
