'use client';

import React, { useState } from 'react';
import { AgentCard } from '@/components/agents/AgentCard';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import LiquidGlass from '@/components/LiquidGlass';

export default function AgentsPage() {
    const [activeAgent, setActiveAgent] = useState<string | null>(null);

    const agents = [
        {
            id: 'behavioral',
            type: 'behavioral' as const,
            name: 'Behavioral Intelligence',
            description: 'Analyzes your emotional patterns and helps you understand the "why" behind your feelings.',
            isActive: true
        },
        {
            id: 'sleep',
            type: 'sleep' as const,
            name: 'Sleep Guardian',
            description: 'Optimizes your rest by analyzing sleep debt, patterns, and suggesting bedtime rituals.',
            isActive: true
        },
        {
            id: 'stress',
            type: 'stress' as const,
            name: 'Stress Manager',
            description: 'Detects rising tension and intervenes with real-time calming techniques and breaks.',
            isActive: true
        },
        {
            id: 'work_life',
            type: 'work_life' as const,
            name: 'Balance Keeper',
            description: 'Monitors your schedule to ensure you have time for yourself, not just your work.',
            isActive: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 pb-32">
            <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <Sparkles className="text-blue-400" size={24} />
                        <span className="text-blue-400 uppercase tracking-widest text-sm font-bold">Serenity Agents</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 font-montage mb-4">
                        Your Personal AI Team
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl font-petrona">
                        Specialized agents working together to optimize your well-being, sleep, and balance.
                    </p>
                </div>

                <Link href="/agents/chat" className="shrink-0">
                    <LiquidGlass className="px-8 py-4 flex items-center gap-3 bg-blue-500/20 hover:bg-blue-500/30 transition-all group">
                        <span className="text-lg font-bold text-blue-100">Start Team Session</span>
                        <Sparkles size={20} className="text-blue-300 group-hover:rotate-12 transition-transform" />
                    </LiquidGlass>
                </Link>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {agents.map((agent, index) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AgentCard
                                type={agent.type}
                                name={agent.name}
                                description={agent.description}
                                isActive={agent.isActive}
                                onClick={() => setActiveAgent(agent.id)}
                            />
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
