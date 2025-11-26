'use client';

import React from 'react';
import AgentChat from '@/components/agents/AgentChat';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AgentChatPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 pb-32">
            <header className="max-w-4xl mx-auto mb-8">
                <Link href="/agents" className="inline-flex items-center text-white/40 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Link>
                <div className="flex items-center space-x-3 mb-2">
                    <Sparkles className="text-blue-400" size={24} />
                    <span className="text-blue-400 uppercase tracking-widest text-sm font-bold">Live Session</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 font-montage">
                    Team Sync
                </h1>
            </header>

            <main className="flex justify-center">
                <AgentChat />
            </main>
        </div>
    );
}
