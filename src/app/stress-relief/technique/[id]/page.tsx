import React from 'react';
import { TechniqueRunner } from '@/components/stress-relief/TechniqueRunner';

export default async function TechniquePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-full max-w-4xl">
                <TechniqueRunner techniqueId={id} />
            </div>
        </div>
    );
}
