'use client';

import React, { useState } from 'react';
import { AgentCard } from '@/components/agents/AgentCard';
import { Sparkles, Brain, Activity, Calendar, CheckCircle, Layers, Zap, Music } from 'lucide-react';
import Link from 'next/link';
import LiquidGlass from '@/components/LiquidGlass';

type ViewState = 'AGENTS' | 'TASKS' | 'SERVICES';

export default function AgentsPage() {
    const [viewState, setViewState] = useState<ViewState>('AGENTS');

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-montage mb-2 bg-gradient-to-r from-blue-200 via-purple-200 to-white bg-clip-text text-transparent">
                            Agent Command Center
                        </h1>
                        <p className="text-white/60">Manage your AI workforce and integrations.</p>
                    </div>
                    <Link href="/agents/chat">
                        <button className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-100 font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center gap-2">
                            <Sparkles size={18} /> Start Team Session
                        </button>
                    </Link>
                </div>

                {/* Toggles */}
                <div className="flex justify-center">
                    <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setViewState('AGENTS')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${viewState === 'AGENTS'
                                ? 'bg-blue-500/20 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/30'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                }`}
                        >
                            <Brain size={14} /> Agents
                        </button>
                        <button
                            onClick={() => setViewState('TASKS')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${viewState === 'TASKS'
                                ? 'bg-purple-500/20 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-400/30'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                }`}
                        >
                            <CheckCircle size={14} /> Tasks
                        </button>
                        <button
                            onClick={() => setViewState('SERVICES')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${viewState === 'SERVICES'
                                ? 'bg-green-500/20 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)] border border-green-400/30'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                }`}
                        >
                            <Zap size={14} /> Services
                        </button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 gap-6">
                    {viewState === 'AGENTS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            <AgentCard
                                name="Sleep Guardian"
                                role="Circadian Rhythm Optimizer"
                                status="active"
                                description="Monitors sleep patterns and suggests schedule adjustments for optimal rest."
                                capabilities={['Sleep Tracking', 'Schedule Optimization', 'Wind-down Routines']}
                                icon="moon"
                            />
                            <AgentCard
                                name="Stress Manager"
                                role="Cortisol Regulation"
                                status="active"
                                description="Detects stress markers in communication and intervenes with calming techniques."
                                capabilities={['Stress Detection', 'Breathing Exercises', 'Somatic Relief']}
                                icon="wind"
                            />
                            <AgentCard
                                name="Balance Keeper"
                                role="Work-Life Integration"
                                status="idle"
                                description="Ensures boundaries between professional and personal time."
                                capabilities={['Calendar Management', 'Break Reminders', 'Focus Time']}
                                icon="scale"
                            />
                            <AgentCard
                                name="Behavioral Intelligence"
                                role="Deep Insight Engine"
                                status="learning"
                                description="Analyzes underlying patterns to understand the 'why' behind your actions."
                                capabilities={['Pattern Recognition', 'Root Cause Analysis', 'Personalization']}
                                icon="brain"
                            />
                        </div>
                    )}

                    {viewState === 'TASKS' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <LiquidGlass className="p-6 flex items-center justify-between border border-white/10 bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-green-500/20 text-green-300">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Schedule Wind Down</h3>
                                        <p className="text-sm text-white/60">Sleep Guardian • Completed 2h ago</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-xs font-bold border border-green-500/20">Executed</span>
                            </LiquidGlass>

                            <LiquidGlass className="p-6 flex items-center justify-between border border-white/10 bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Box Breathing Session</h3>
                                        <p className="text-sm text-white/60">Stress Manager • In Progress</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-500/20">Active</span>
                            </LiquidGlass>
                        </div>
                    )}

                    {viewState === 'SERVICES' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            <LiquidGlass className="p-6 border border-white/10 bg-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png"
                                                alt="GCal"
                                                className="w-6 h-6 object-contain"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Google Calendar</h3>
                                            <p className="text-xs text-white/50">Via Composio</p>
                                        </div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                </div>
                                <p className="text-sm text-white/70 mb-4">Allows agents to view and schedule events on your behalf.</p>
                                <button
                                    onClick={() => alert("Configuration coming soon!")}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-colors"
                                >
                                    Configure
                                </button>
                            </LiquidGlass>

                            <LiquidGlass className="p-6 border border-white/10 bg-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#1DB954] flex items-center justify-center">
                                            <Music className="text-black" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Spotify</h3>
                                            <p className="text-xs text-white/50">Direct Integration</p>
                                        </div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                </div>
                                <p className="text-sm text-white/70 mb-4">Enables music playback for stress relief and focus sessions.</p>
                                <button
                                    onClick={() => alert("Configuration coming soon!")}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-colors"
                                >
                                    Configure
                                </button>
                            </LiquidGlass>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
