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
        <div className="relative flex flex-col h-screen w-full overflow-hidden bg-black">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/videos/chatbkg2.m4v" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-[#0a0a0f]/20 z-10"></div>
            </div>

            {/* Header */}
            <div className="relative z-20 p-6 flex justify-center items-center">
                <div className="flex flex-col items-center text-center gap-1">
                    <h3 className="font-montage text-2xl text-white tracking-wide drop-shadow-lg">Team Sync</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                        <p className="text-xs text-white/60 uppercase tracking-widest font-medium">Orchestrator Active</p>
                    </div>
                </div>

                {!authToken && (
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="absolute right-6 top-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold text-white transition-all border border-white/10 uppercase tracking-wider backdrop-blur-md"
                    >
                        Connect Guide
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-[15%] py-8 space-y-6 scrollbar-hide">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
                    >
                        {/* Sender Name */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 ${msg.role === 'user' ? 'mr-2' : 'ml-2'}`}>
                            {msg.role === 'user' ? 'You' : msg.agentName}
                        </span>

                        <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-[24px] text-sm leading-relaxed shadow-lg backdrop-blur-xl border ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/10 border-blue-500/20 text-white rounded-br-sm'
                                : 'bg-white/10 border-white/10 text-white/90 rounded-bl-sm'
                            }`}>
                            {msg.content}
                        </div>

                        {/* Actions */}
                        {msg.actions && msg.actions.length > 0 && (
                            <div className="flex flex-col gap-3 mt-2 w-full max-w-[320px]">
                                {msg.actions.map(action => (
                                    <LiquidGlass key={action.id} className={`p-0 overflow-hidden !rounded-2xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 ${action.status === 'approved' ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold tracking-wider uppercase ${action.priority === 'CRITICAL' ? 'border-red-500/50 text-red-300 bg-red-500/10' :
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
                                            <p className="text-xs text-white/60 mb-4 leading-relaxed">{action.description}</p>

                                            {/* Action Buttons */}
                                            {action.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(msg.id, action.id, 'approve')}
                                                        className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-[10px] font-bold text-green-100 transition-all flex items-center justify-center gap-1.5 group"
                                                    >
                                                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
                                                            <Check size={10} />
                                                        </div>
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(msg.id, action.id, 'refine')}
                                                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white transition-all flex items-center justify-center gap-1.5 group"
                                                    >
                                                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                            <Edit2 size={10} />
                                                        </div>
                                                        Refine
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(msg.id, action.id, 'reject')}
                                                        className="w-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-200 transition-all"
                                                        title="Cancel"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-white/50 italic bg-black/20 p-2 rounded-lg">
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
                                                        className="rounded-xl shadow-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </LiquidGlass>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-2 px-6 py-4 bg-white/10 rounded-[24px] rounded-bl-sm border border-white/10 backdrop-blur-md">
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-75" />
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-20 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex justify-center">
                <LiquidGlass className="w-full max-w-3xl !rounded-[50px] p-1.5 border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-2 pl-4 pr-1.5">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Tell your team how you're feeling..."
                            className="flex-1 bg-transparent border-none text-white placeholder-white/40 focus:outline-none font-petrona text-base py-3"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </LiquidGlass>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <LiquidGlass className="p-8 max-w-sm w-full !rounded-3xl border border-white/20 shadow-2xl">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-blue-500/20 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                <Sparkles size={32} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3 font-montage text-center">Connect Serenity Guide</h2>
                        <p className="text-white/60 mb-8 text-sm leading-relaxed text-center">
                            Connect to the advanced behavioral health engine to get personalized guidance and deep profile insights.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleLogin}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            >
                                Connect Now
                            </button>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-bold transition-colors border border-white/10"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </LiquidGlass>
                </div>
            )}
        </div>
    );
}
