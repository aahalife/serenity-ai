import { NextResponse } from 'next/server';
import { TECHNIQUES } from '@/lib/stress-relief/data';

export async function GET() {
    // Return lightweight version of techniques for the list view
    const lightweightTechniques = TECHNIQUES.map(({ id, title, short, time_min, tags, recommended_for }) => ({
        id,
        title,
        short,
        time_min,
        tags,
        recommended_for
    }));

    return NextResponse.json(lightweightTechniques);
}
