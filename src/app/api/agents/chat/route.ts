import { NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agent-orchestrator';

export async function POST(request: Request) {
    try {
        const { query, userProfile, token } = await request.json();

        // Use the Orchestrator to process the request
        const result = await AgentOrchestrator.processRequest(query, userProfile, token);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Agent API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
