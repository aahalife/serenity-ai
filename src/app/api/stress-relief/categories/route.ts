import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/lib/stress-relief/data';

export async function GET() {
    return NextResponse.json(CATEGORIES);
}
