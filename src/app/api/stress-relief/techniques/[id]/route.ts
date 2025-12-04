import { NextRequest, NextResponse } from 'next/server';
import { TECHNIQUES } from '@/lib/stress-relief/data';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    console.log(`[TechniqueAPI] Fetching ID: ${id}`);
    const technique = TECHNIQUES.find(t => t.id === id);
    console.log(`[TechniqueAPI] Found: ${technique ? technique.id : 'None'}`);

    if (!technique) {
        return NextResponse.json({ error: 'Technique not found' }, { status: 404 });
    }

    return NextResponse.json(technique);
}
