'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Check, X, Edit2, Play, Music, Activity, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from '@/components/LiquidGlass';
import { externalApi } from '@/lib/external-api';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    agentName?: string;
    actions?: AgentAction[];
}

interface AgentAction {
    id: string;
    type: 'internal_feature' | 'composio_tool' | 'music' | 'response';
    title: string;
    description: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    data?: any;
    status?: 'pending' | 'approved' | 'rejected' | 'executed';
}

export default function AgentChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello. I'm your Personal AI Team Orchestrator. I'm here to coordinate your Sleep, Stress, and Balance agents. How are you feeling today?",
            timestamp: new Date(),
            agentName: 'Orchestrator'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load token from local storage
    useEffect(() => {
        const token = localStorage.getItem('external_api_token');
        if (token) setAuthToken(token);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // For demo purposes, we'll just simulate a login or use a hardcoded one if the user provides one
        // In a real app, we'd have a form.
        // For now, let's just register a dummy user to get a token if needed, or ask user.
        // Since I can't ask user for real creds easily, I'll implement a simple "Connect" that tries to register a random user
        try {
            const randomUser = {
                email: `user${Date.now()}@example.com`,
                password: 'password123',
                name: 'Test User',
                age: 30,
                gender_identity: 'Non-binary',
                location: 'US',
                stress_level: '5'
            };
            await externalApi.register(randomUser);
            const data = await externalApi.login(randomUser.email, randomUser.password);
            setAuthToken(data.access_token);
            localStorage.setItem('external_api_token', data.access_token);
            setShowAuthModal(false);
        } catch (err) {
            console.error("Auth failed", err);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMsg.content,
                    token: authToken
                })
            });

            const data = await res.json();

            // Parse response if it's a stringified JSON from external API
            let content = data.response;
            try {
                const parsed = JSON.parse(data.response);
                if (parsed.response) content = parsed.response; // Adjust based on actual API structure
            } catch (e) {
                // Not JSON, keep as is
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: content,
                timestamp: new Date(),
                agentName: data.agentName || 'Orchestrator',
                actions: data.actions?.map((a: any) => ({ ...a, status: 'pending' }))
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (msgId: string, actionId: string, type: 'approve' | 'reject' | 'refine') => {
        setMessages(prev => prev.map(msg => {
            if (msg.id !== msgId || !msg.actions) return msg;
            return {
                ...msg,
                actions: msg.actions.map(a => {
                    if (a.id !== actionId) return a;
                    if (type === 'approve') {
                        // If it's a composio tool, we might need to trigger auth flow here
                        if (a.type === 'composio_tool') {
                            // Mocking the connection flow
                            alert(`Connecting to ${a.data?.tool || 'Service'}... (Mock)`);
                        }
                        return { ...a, status: 'approved' };
                    }
                    if (type === 'reject') return { ...a, status: 'rejected' };
                    return a; // Refine logic would go here (open input)
                })
            };
        }));
    };

    return (
        <div className="relative flex flex-col h-[calc(100vh-120px)] w-full max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-40"
                >
                    <source src="/videos/chatbkg2.m4v" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 backdrop-blur-[2px]"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 border-b border-white/10 bg-white/5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/30">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="font-montage text-lg text-white tracking-wide">Team Sync</h3>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">Orchestrator Active</p>
                    </div>
                </div>
                {!authToken && (
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold text-white transition-all border border-white/10 uppercase tracking-wider"
                    >
                        Connect Guide
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/20 ${msg.role === 'user' ? 'bg-white/10 backdrop-blur-md' : 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-md'
                                }`}>
                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                {msg.role === 'assistant' && (
                                    <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider ml-1">{msg.agentName}</span>
                                )}
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md ${msg.role === 'user'
                                        ? 'bg-white/90 text-black rounded-tr-none'
                                        : 'bg-black/40 text-white/90 border border-white/10 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>

                                {/* Actions */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex flex-col gap-3 mt-1 w-full max-w-[280px]"> {/* Constrained width */}
                                        {msg.actions.map(action => (
                                            <LiquidGlass key={action.id} className={`p-0 overflow-hidden !rounded-xl border border-white/10 bg-white/5 transition-all ${action.status === 'approved' ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                                                <div className="p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold tracking-wider uppercase ${action.priority === 'CRITICAL' ? 'border-red-500/50 text-red-300 bg-red-500/10' :
                                                                    action.priority === 'HIGH' ? 'border-orange-500/50 text-orange-300 bg-orange-500/10' :
                                                                        'border-blue-500/50 text-blue-300 bg-blue-500/10'
                                                                }`}>
                                                                {action.priority}
                                                            </span>
                                                        </div>
                                                        {action.type === 'music' && <Music size={14} className="text-white/40" />}
                                                        {action.type === 'internal_feature' && <Activity size={14} className="text-white/40" />}
                                                        {action.type === 'composio_tool' && <LinkIcon size={14} className="text-white/40" />}
                                                    </div>

                                                    <h4 className="font-bold text-white text-sm mb-1">{action.title}</h4>
                                                    <p className="text-xs text-white/60 mb-3 leading-snug">{action.description}</p>

                                                    {/* Task List Style for Description if needed, or just text */}

                                                    {/* Action Buttons */}
                                                    {action.status === 'pending' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAction(msg.id, action.id, 'approve')}
                                                                className="flex-1 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-[10px] font-bold text-green-100 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <Check size={12} /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(msg.id, action.id, 'refine')}
                                                                className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <Edit2 size={12} /> Refine
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(msg.id, action.id, 'reject')}
                                                                className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-100 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <X size={12} /> Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs text-white/50 italic">
                                                            {action.status === 'approved' && <><Check size={12} className="text-green-400" /> Approved & Executing...</>}
                                                            {action.status === 'rejected' && <><X size={12} className="text-red-400" /> Cancelled</>}
                                                        </div>
                                                    )}

                                                    {/* Execution View (Mock) */}
                                                    {action.status === 'approved' && action.type === 'music' && action.data?.spotifyId && (
                                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                                            <iframe
                                                                src={`https://open.spotify.com/embed/playlist/${action.data.spotifyId}?utm_source=generator`}
                                                                width="100%"
                                                                height="80"
                                                                frameBorder="0"
                                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                                loading="lazy"
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </LiquidGlass>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-2 p-4 bg-black/40 rounded-2xl rounded-tl-none border border-white/10 ml-11 backdrop-blur-md">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-75" />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative z-10 p-4 border-t border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tell your team how you're feeling..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-petrona shadow-inner"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <LiquidGlass className="p-6 max-w-sm w-full">
                        <h2 className="text-xl font-bold text-white mb-3 font-montage">Connect Serenity Guide</h2>
                        <p className="text-white/60 mb-6 text-xs leading-relaxed">
                            Connect to the advanced behavioral health engine to get personalized guidance and deep profile insights.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleLogin}
                                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Connect Now
                            </button>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold transition-colors border border-white/10"
                            >
                                Later
                            </button>
                        </div>
                    </LiquidGlass>
                </div>
            )}
        </div>
    );
}
