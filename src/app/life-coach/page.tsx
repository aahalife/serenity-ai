"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Mic, Loader2, StopCircle, Phone } from "lucide-react";
import { generateLifeCoachResponse } from "@/lib/life-coach/agent";
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
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, newMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // In a real app, this should be an API call to avoid exposing secrets on client
            // But since this is a Next.js server component/action file, we can invoke it via a proxy or API route
            // For now, simpler to use a dedicated API route again to be safe and compatible with edge

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
                setMessages(prev => [...prev, { role: 'assistant', content: "[worried] I'm having trouble connecting. Please try again.." }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "[worried] Something went wrong. Please check your connection.." }]);
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
        <div className="relative w-full h-screen overflow-hidden bg-black text-foreground">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 opacity-30">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/assets/videos/aurora.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 w-full h-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col pt-20">

                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-xl rounded-t-3xl border border-white/10 border-b-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-medium text-white tracking-wide">The Mentor</h1>
                            <p className="text-sm text-white/50">Life Strategy & Wisdom • Gemini 3.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`p-2 rounded-xl transition-all border ${isPaused ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
                            title={isPaused ? "Resume Daily Check-ins" : "Pause Daily Check-ins"}
                        >
                            <StopCircle className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/10 mx-1" />
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-colors">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm font-medium">WhatsApp</span>
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-black/20 backdrop-blur-xl border-x border-white/10 p-6 overflow-y-auto space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] rounded-3xl p-5 ${msg.role === 'user'
                                        ? 'bg-indigo-600/20 border border-indigo-500/30 rounded-tr-sm text-right'
                                        : 'bg-white/10 border border-white/5 rounded-tl-sm'
                                    }`}>
                                    <p className="text-base text-white/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white/5 border border-white/5 rounded-3xl rounded-tl-sm p-4 flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                                <span className="text-sm text-white/50">Consulting the playbook...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 backdrop-blur-xl rounded-b-3xl border border-white/10 border-t-0">
                    <div className="relative flex items-center gap-3">
                        <button className="p-4 rounded-full hover:bg-white/10 transition-colors text-white/60">
                            <Mic className="w-6 h-6" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Share a thought, or paste a link to analyze..."
                            disabled={isLoading}
                            className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-6 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
