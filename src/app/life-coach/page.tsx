"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Mic, Loader2, StopCircle, Phone, ArrowUp } from "lucide-react";
import { useSession } from "next-auth/react";

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function LifeCoachPage() {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "[warmly] Hey there. Good to connect. [curious] So, what's on your mind today? Or if you want, we can do a quick check-in — which of the five pillars feels like it needs the most attention right now: Health, Wealth, Love, Happiness, or Connection?.."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, newMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/life-coach/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: newMessage.content,
                    history: messages
                }),
            });

            const data = await response.json();
            if (data.error) {
                console.error("Chat Error:", data.error);
                setMessages(prev => [...prev, { role: 'assistant', content: "[worried] I'm having trouble connecting to my expert database. Please try again.." }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "[worried] Something went wrong with the connection. Please check your internet.." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-foreground font-sans">
            {/* Ambient Background Video */}
            <div className="absolute inset-0 z-0 opacity-40">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/assets/videos/aurora.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/95 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10 w-full h-full max-w-5xl mx-auto flex flex-col md:pt-6">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 mx-4 mt-4 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white tracking-wide">The Mentor</h1>
                            <p className="text-xs text-white/50 font-medium tracking-wider uppercase">Life Strategy & Wisdom</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`p-2.5 rounded-xl transition-all border flex items-center gap-2 cursor-pointer ${isPaused ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}
                            title={isPaused ? "Resume Daily Check-ins" : "Pause Daily Check-ins"}
                        >
                            <StopCircle className="w-4 h-4" />
                            <span className="text-xs font-medium hidden sm:inline">{isPaused ? "Paused" : "Active"}</span>
                        </button>
                        <a
                            href="https://wa.me/16696006540"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 rounded-xl transition-all font-medium text-sm cursor-pointer"
                        >
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollhider relative z-10">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] md:max-w-[70%] rounded-3xl p-5 shadow-xl ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 rounded-tr-sm text-right backdrop-blur-md'
                                    : 'bg-white/5 border border-white/10 rounded-tl-sm backdrop-blur-md'
                                    }`}>
                                    <p className="text-[15px] md:text-base text-white/90 leading-relaxed whitespace-pre-wrap font-light tracking-wide">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start pl-2"
                        >
                            <div className="bg-white/5 border border-white/5 rounded-3xl rounded-tl-sm px-5 py-3 flex items-center gap-3 backdrop-blur-sm">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                <span className="text-sm text-indigo-200/70 font-medium animate-pulse">Consulting the Playbook...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
                    <div className="relative max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-end gap-2 shadow-2xl ring-1 ring-white/5 focus-within:ring-indigo-500/30 transition-all">
                        <button className="p-3 rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white/80">
                            <Mic className="w-5 h-5" />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Share a thought, situation, or paste a link..."
                            disabled={isLoading}
                            rows={1}
                            className="flex-1 bg-transparent border-0 text-base text-white placeholder:text-white/20 focus:ring-0 focus:outline-none py-3 min-h-[48px] max-h-[120px] resize-none"
                            style={{ height: 'auto', minHeight: '48px' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />

                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-30 disabled:cursor-not-allowed group"
                        >
                            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-white/20 mt-3 font-medium uppercase tracking-widest">
                        Powered by Gemini Hybrid & Claude Sonnet
                    </p>
                </div>
            </div>
        </div>
    );
}
