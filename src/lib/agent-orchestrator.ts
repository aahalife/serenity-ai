import { anthropic } from './anthropic';
import { externalApi } from './external-api';
import { supermemory } from './supermemory';

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
    reasoning?: string;
    plan?: string;
    needsMoreInfo?: boolean;
}

export class AgentOrchestrator {
    // Pure Agentic Mode: Everything is an agent action request
    static classifyIntent(query: string): 'AGENT_ACTION' {
        return 'AGENT_ACTION';
    }

    static async processRequest(query: string, userProfile: any, token?: string, agenda?: any): Promise<OrchestratorResponse> {
        const intent = this.classifyIntent(query);

        // 0. Retrieve Context from Supermemory
        let memoryContext = "";
        try {
            const memories = await supermemory.query(query, 3);
            if (memories && memories.length > 0) {
                // Format memories (assuming they have 'content' field)
                const memoryText = memories.map((m: any) => m.content).join('\n- ');
                memoryContext = `\nRelevant Memory:\n- ${memoryText}`;
            }
        } catch (e) {
            console.warn("Supermemory service unavailable", e);
        }

        // 1. Behavioral Agent ("Why") - Analyze request for tools
        const lowerQuery = query.toLowerCase();
        let agentName = 'Orchestrator';
        let response = "I'm analyzing your request...";
        let actions: AgentAction[] = [];

        // Stress Logic
        if (lowerQuery.includes('stress') || lowerQuery.includes('panic')) {
            agentName = 'Stress Manager';
            response = "I've detected high stress. I recommend immediate intervention.";

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

            return {
                agentName,
                response,
                actions,
                reasoning: "User indicates stress/panic. Immediate physiological regulation is required.",
                plan: "1. Guide user through Box Breathing.\n2. Offer personalized stress relief tools."
            };
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

            return {
                agentName,
                response,
                actions,
                reasoning: "User mentions sleep issues/fatigue. Schedule adjustment needed.",
                plan: "1. Block 'Wind Down' time in calendar to ensure rest."
            };
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

            return {
                agentName,
                response,
                actions,
                reasoning: "User is planning work. Task decomposition is helpful.",
                plan: "1. Create a structured task list."
            };
        }

        return {
            agentName,
            response: "I'm ready to help with tasks. Try asking me to schedule something or manage stress.",
            actions,
            reasoning: "No specific intent detected.",
            plan: "Waiting for user instruction."
        };
    }
}
