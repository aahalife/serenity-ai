import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // In a real app, we would save this to a database
        // For now, we'll just mock a successful response with a generated ID
        const sessionId = `s_${Date.now()}`;

        console.log('Creating session:', { ...body, sessionId });

        return NextResponse.json({
            session_id: sessionId,
            technique_id: body.technique_id,
            created_at: new Date().toISOString()
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
