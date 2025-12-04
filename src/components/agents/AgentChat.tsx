'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Check, X, Edit2, Play, Music, Activity, Link as LinkIcon, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from '@/components/LiquidGlass';
import styles from './AgentChat.module.css';
import { externalApi } from '@/lib/external-api';
import Link from 'next/link';
import { useVoice } from '@/hooks/useVoice';
import { useAudio } from '@/hooks/useAudio';

interface AgentMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    agentName?: string;
    actions?: AgentAction[];
    reasoning?: string;
    plan?: string;
}
// Force update for build system

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
    const [messages, setMessages] = useState<AgentMessage[]>([
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

    // Voice & Audio Hooks
    const { play, duck, unduck } = useAudio();
    const { isListening, isSpeaking, startListening, stopListening, speak } = useVoice({
        onSpeechEnd: async (audioBlob) => {
            // Process voice input
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            try {
                const sttRes = await fetch("/api/stt", {
                    method: "POST",
                    body: formData
                });

                if (sttRes.ok) {
                    const { text } = await sttRes.json();
                    if (text && text.trim()) {
                        // Check for voice commands first
                        const handled = handleVoiceCommand(text);
                        if (!handled) {
                            // If not a command, send as message
                            handleSend(text);
                        }
                    }
                }
            } catch (e) {
                console.error("Voice processing failed", e);
            }
        },
        onSpeakStart: () => duck(0, 0.1),
        onSpeakEnd: () => unduck(0.5)
    });

    // Play background audio on mount
    useEffect(() => {
        play("/audio/agentchatbkg.mp3", { volume: 0.3, loop: true, fadeInDuration: 2000 });
    }, [play]);

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

    const handleVoiceCommand = (text: string): boolean => {
        const lowerText = text.toLowerCase();

        // Find the last message with pending actions
        const lastActionMsg = [...messages].reverse().find(m => m.actions && m.actions.some(a => a.status === 'pending'));

        if (lastActionMsg && lastActionMsg.actions) {
            const pendingAction = lastActionMsg.actions.find(a => a.status === 'pending');
            if (pendingAction) {
                if (lowerText.includes('approve') || lowerText.includes('yes') || lowerText.includes('confirm') || lowerText.includes('do it')) {
                    handleAction(lastActionMsg.id, pendingAction.id, 'approve');
                    speak("Action approved.");
                    return true;
                }
                if (lowerText.includes('reject') || lowerText.includes('no') || lowerText.includes('cancel') || lowerText.includes('stop')) {
                    handleAction(lastActionMsg.id, pendingAction.id, 'reject');
                    speak("Action cancelled.");
                    return true;
                }
                // Refine logic could be added here
            }
        }
        return false;
    };

    const handleSend = async (textOverride?: string) => {
        if (isListening) stopListening();

        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        const userMsg: AgentMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const userProfile = localStorage.getItem("userProfile") ? JSON.parse(localStorage.getItem("userProfile")!) : {};
            const deepProfile = localStorage.getItem("deepProfile") ? JSON.parse(localStorage.getItem("deepProfile")!) : {};

            // Merge profiles
            const fullProfile = { ...userProfile, ...deepProfile };

            // Mock Agenda (In real app, fetch from GCal/Composio)
            const agenda = [
                { title: "Team Sync", time: "10:00 AM" },
                { title: "Focus Time", time: "2:00 PM" }
            ];

            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMsg.content,
                    token: authToken,
                    userProfile: fullProfile,
                    agenda: agenda
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

            const botMsg: AgentMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: content,
                timestamp: new Date(),
                agentName: data.agentName || 'Orchestrator',
                actions: data.actions?.map((a: any) => ({ ...a, status: 'pending' })),
                reasoning: data.reasoning,
                plan: data.plan
            };

            setMessages(prev => [...prev, botMsg]);

            // Speak response if using voice
            if (textOverride) { // Assume voice if override is present (simplification)
                speak(content);
            }

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
                        // If it's a composio tool, trigger auth flow
                        if (a.type === 'composio_tool') {
                            const toolName = a.data?.tool || 'google_calendar'; // Default or extract from data
                            // Open auth in new tab or redirect
                            window.open(`/api/integrations/auth?appName=${toolName}`, '_blank');
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
        <div className={styles.container}>
            <div className={styles.videoBackground}>
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.video}
                >
                    <source src="/videos/chatbkg2.m4v" type="video/mp4" />
                </video>
                <div className={styles.glassOverlay}></div>
            </div>

            <div className={styles.headerWrapper}>
                <div className={styles.headerContent}>
                    <div className={styles.headerInfo}>
                        <h3 className="font-montage">Team Sync</h3>
                        <p className={isListening ? styles.statusListening : ''}>
                            {isLoading ? "Thinking..." : isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Orchestrator Active"}
                        </p>
                    </div>

                    {!authToken && (
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className={styles.connectButton}
                        >
                            Connect Guide
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.messages}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                        >
                            {msg.content}

                            {/* Reasoning & Plan Block */}
                            {(msg.reasoning || msg.plan) && (
                                <div className="mt-4 mb-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm">
                                    {msg.reasoning && (
                                        <div className="mb-3">
                                            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                                                <Sparkles size={10} /> Reasoning
                                            </h4>
                                            <p className="text-white/80 leading-relaxed">{msg.reasoning}</p>
                                        </div>
                                    )}
                                    {msg.plan && (
                                        <div>
                                            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                                                <LinkIcon size={10} /> Plan
                                            </h4>
                                            <div className="text-white/80 leading-relaxed whitespace-pre-wrap font-mono text-xs bg-black/20 p-2 rounded-lg">
                                                {msg.plan}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {msg.actions && msg.actions.length > 0 && (
                                <div className="flex flex-col gap-3 mt-4 w-full">
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
                </AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`${styles.message} ${styles.aiMessage}`}
                    >
                        <span className="typing-dots">...</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputWrapper}>
                <LiquidGlass className={styles.liquidInput}>
                    <div className={styles.inputArea}>
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`${styles.sendButton} ${isListening ? styles.listening : ""}`}
                            style={{ background: isListening ? "var(--accent)" : "var(--surface-hover)", color: isListening ? "white" : "var(--foreground)" }}
                            title={isListening ? "Stop Listening" : "Start Listening"}
                        >
                            <Mic size={18} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isListening ? "Listening..." : "Tell your team how you're feeling..."}
                            className={styles.input}
                        />
                        <button
                            onClick={() => handleSend()}
                            className={styles.sendButton}
                            disabled={!input.trim() || isLoading}
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
