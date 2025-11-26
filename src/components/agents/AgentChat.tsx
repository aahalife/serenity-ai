'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Check, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from '@/components/LiquidGlass';

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
    type: string;
    title: string;
    description: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                body: JSON.stringify({ query: userMsg.content })
            });

            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                agentName: data.agentName || 'Orchestrator',
                actions: data.actions
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-500/20 text-blue-300">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-montage text-lg text-white">Team Chat</h3>
                        <p className="text-xs text-white/40">Orchestrator • Sleep • Stress • Balance</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-blue-500/20'}`}>
                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>

                            <div className="flex flex-col gap-2">
                                {msg.role === 'assistant' && (
                                    <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">{msg.agentName}</span>
                                )}
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-white text-black rounded-tr-none'
                                        : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>

                                {/* Actions */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex flex-col gap-3 mt-2">
                                        {msg.actions.map(action => (
                                            <LiquidGlass key={action.id} className="p-4 border border-white/10 bg-white/5 !rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${action.priority === 'CRITICAL' ? 'border-red-500/50 text-red-300 bg-red-500/10' :
                                                                action.priority === 'HIGH' ? 'border-orange-500/50 text-orange-300 bg-orange-500/10' :
                                                                    'border-blue-500/50 text-blue-300 bg-blue-500/10'
                                                            }`}>
                                                            {action.priority}
                                                        </span>
                                                        <h4 className="font-bold text-white text-sm">{action.title}</h4>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/60 mb-4">{action.description}</p>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
                                                        <Check size={14} /> Confirm
                                                    </button>
                                                    <button className="flex-1 py-2 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
                                                        <Clock size={14} /> Later
                                                    </button>
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
                        <div className="flex items-center gap-2 p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/10 ml-12">
                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tell your team how you're feeling..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-petrona"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
