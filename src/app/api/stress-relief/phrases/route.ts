import { NextRequest, NextResponse } from 'next/server';
import { PHRASES } from '@/lib/stress-relief/data';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const q = searchParams.get('q');

    let phrases = PHRASES;

    if (category) {
        phrases = phrases.filter(p => p.category === category);
    }

    if (q) {
        const lowerQ = q.toLowerCase();
        phrases = phrases.filter(p => p.text.toLowerCase().includes(lowerQ));
    }

    return NextResponse.json(phrases);
}
