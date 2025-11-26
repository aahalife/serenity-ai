import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { query } = await request.json();
        const lowerQuery = query.toLowerCase();

        // Simulate Orchestrator Logic
        let response = "I'm listening. Could you tell me more about that?";
        let agentName = "Orchestrator";
        let actions = [];

        // Sleep Agent Logic
        if (lowerQuery.includes('sleep') || lowerQuery.includes('tired') || lowerQuery.includes('awake') || lowerQuery.includes('insomnia')) {
            agentName = "Sleep Guardian";
            response = "I notice you're concerned about your rest. Your sleep patterns suggest a high sleep debt.";
            actions.push({
                id: 'sleep-1',
                type: 'schedule_adjustment',
                title: 'Adjust Bedtime',
                description: 'Shift bedtime to 10:30 PM tonight to recover 45m of sleep.',
                priority: 'HIGH'
            });
        }
        // Stress Agent Logic
        else if (lowerQuery.includes('stress') || lowerQuery.includes('anxious') || lowerQuery.includes('panic') || lowerQuery.includes('overwhelmed')) {
            agentName = "Stress Manager";
            response = "I'm detecting elevated stress markers in your language. Let's intervene before this escalates.";
            actions.push({
                id: 'stress-1',
                type: 'breathing_exercise',
                title: 'Box Breathing',
                description: 'Start a 3-minute guided breathing session to lower cortisol.',
                priority: 'CRITICAL'
            });
            actions.push({
                id: 'stress-2',
                type: 'music',
                title: 'Play Binaural Beats',
                description: 'Play 40Hz binaural beats for focus and calm.',
                priority: 'MEDIUM'
            });
        }
        // Work-Life Balance Logic
        else if (lowerQuery.includes('work') || lowerQuery.includes('busy') || lowerQuery.includes('deadline')) {
            agentName = "Balance Keeper";
            response = "You've been in high-focus mode for 4 hours. Productivity is likely dropping.";
            actions.push({
                id: 'work-1',
                type: 'break',
                title: 'Schedule Micro-Break',
                description: 'Block 15 minutes on your calendar now for a walk.',
                priority: 'HIGH'
            });
        }
        // Behavioral Logic (Default fallback for complex emotions)
        else if (lowerQuery.includes('feel') || lowerQuery.includes('sad') || lowerQuery.includes('happy')) {
            agentName = "Behavioral Intelligence";
            response = "It sounds like there's a lot of emotional weight there. Let's unpack the 'why' behind this feeling.";
        }

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json({
            response,
            agentName,
            actions
        });

    } catch (error) {
        console.error('Agent API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
