"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Battery, Zap, Wind, BookOpen, MessageCircle, Sparkles, Send, Mic, Volume2, VolumeX } from "lucide-react";
import styles from "./ChatInterface.module.css";
import { useVoice } from "@/hooks/useVoice";
import { useAudio } from "@/hooks/useAudio";
import { useHume } from "@/hooks/useHume";
import { motion, AnimatePresence } from "framer-motion";
import LiquidGlass from "./LiquidGlass";
import HumeDebugModal from "./HumeDebugModal";
import { Activity } from "lucide-react";
import { externalApi } from "@/lib/external-api";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { play, toggleMute, isMuted, duck, unduck } = useAudio();

    // Load messages on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("chatHistory");
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                // Convert string timestamps back to Date objects
                const hydrated = parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                setMessages(hydrated);
            } catch (e) {
                console.error("Failed to load chat history", e);
            }
        } else {
            // Default welcome message if no history
            setMessages([{
                id: "1",
                text: "Hello! I'm Serenity. How are you feeling today?",
                sender: "ai",
                timestamp: new Date(),
            }]);
        }
    }, []);

    // Save messages on change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("chatHistory", JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        play("/audio/chatbkg.m4a", { volume: 0.2, loop: true, fadeInDuration: 2000 });
    }, [play]);

    const [showWhatsAppDebug, setShowWhatsAppDebug] = useState(false);
    const [waNumber, setWaNumber] = useState("");

    useEffect(() => {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
            const { phoneNumber } = JSON.parse(savedProfile);
            if (phoneNumber) setWaNumber(phoneNumber);
        }
    }, []);

    const saveWhatsAppNumber = () => {
        const savedProfile = localStorage.getItem("userProfile");
        const profile = savedProfile ? JSON.parse(savedProfile) : {};
        const newProfile = { ...profile, phoneNumber: waNumber };
        localStorage.setItem("userProfile", JSON.stringify(newProfile));
        alert("Number saved!");
    };

    const [showDebug, setShowDebug] = useState(false);
    const [emotions, setEmotions] = useState<any[]>([]);
    const [audioError, setAudioError] = useState<string | null>(null);

    const { connect: connectHume, disconnect: disconnectHume, isConnected: isHumeConnected } = useHume({
        onEmotion: (newEmotions) => {
            // Only update if we have valid emotions, otherwise keep the last known state
            if (newEmotions && newEmotions.length > 0) {
                const topEmotions = newEmotions
                    .sort((a: any, b: any) => b.score - a.score)
                    .slice(0, 3);
                setEmotions(topEmotions);
            }
        }
    });

    const [isCallMode, setIsCallMode] = useState(false);

    // Ensure AudioContext is resumed on first interaction
    const resumeAudioContext = async () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }
            }
        } catch (e) {
            console.error("Failed to resume AudioContext", e);
        }
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const { isListening, isSpeaking, transcript, startListening, stopListening, speak } = useVoice({
        onSpeechEnd: async (audioBlob) => {
            setIsProcessing(true);
            try {
                // 1. Transcribe (STT)
                const formData = new FormData();
                formData.append("audio", audioBlob, "recording.webm");

                const sttRes = await fetch("/api/stt", {
                    method: "POST",
                    body: formData
                });

                if (!sttRes.ok) throw new Error("Transcription failed");
                const { text } = await sttRes.json();

                if (text && text.trim()) {
                    // 2. Send to Chat (LLM)
                    await handleSend(text, true);
                }
            } catch (e) {
                console.error("Voice pipeline error", e);
            } finally {
                setIsProcessing(false);
            }
        },
        onSpeakStart: () => duck(0, 0.05),
        onSpeakEnd: () => {
            unduck(0.2);
            if (isCallMode) {
                // Small delay before listening again to avoid picking up echo
                setTimeout(() => startListening(), 500);
            }
        }
    });

    const toggleCallMode = async () => {
        await resumeAudioContext();

        if (isCallMode) {
            setIsCallMode(false);
            stopListening();
            disconnectHume();
        } else {
            setIsCallMode(true);
            startListening();
            connectHume();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textOverride?: string, isVoice: boolean = false) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        if (!isVoice) {
            setInputValue("");
        }
        setIsTyping(true);

        try {
            // Retrieve token and profiles
            const token = localStorage.getItem("external_api_token");
            const savedDeepProfile = localStorage.getItem("deepProfile");
            const savedUserProfile = localStorage.getItem("userProfile");
            const userGoal = localStorage.getItem("userGoal") || "General Wellness";

            if (!token) {
                // Fallback or prompt login (simplified for now)
                console.warn("No external API token found");
                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Please connect your account to chat.",
                    sender: "ai",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiResponse]);
                setIsTyping(false);
                return;
            }

            const profile = {
                ...JSON.parse(savedUserProfile || "{}"),
                ...JSON.parse(savedDeepProfile || "{}"),
            };

            // Inject Goal Context if it's the first message or periodically
            // For now, we prepend it to the message if it's the start of a session, 
            // but the API expects 'message' string. 
            // The user said: "pass this string as part of first chat... 'Goal is not medication adherence...'"
            // We'll check if messages length is 0 or 1 (just added).
            let finalMessage = textToSend;
            if (messages.length <= 1) {
                finalMessage = `${externalApi.formatGoalMessage(userGoal)}\n\nUser Message: ${textToSend}`;
            }

            // Call External API
            const data = await externalApi.chat(finalMessage, token, { userProfile: profile });

            // Parse response (assuming it returns { response: string } or similar)
            // The externalApi.chat returns json. Let's assume data.response holds the text.
            // If the API returns a different structure, we need to adjust.
            // Based on previous `AgentChat` usage, it seemed to return `response`.

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm listening...", // Fallback
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiResponse]);

            if (isVoice || isCallMode) {
                speak(aiResponse.text);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting. Please try again.",
                sender: "ai",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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
                        <h3 className="font-montage">Serenity</h3>
                        <p className={isListening ? styles.statusListening : ''}>
                            {isListening ? "Listening..." : isProcessing ? "Thinking..." : isSpeaking ? "Speaking..." : "Always here for you"}
                        </p>
                    </div>
                    <div className={styles.headerControls}>
                        <button
                            onClick={() => setShowWhatsAppDebug(!showWhatsAppDebug)}
                            className={styles.debugButton}
                            title="WhatsApp Debug"
                        >
                            <MessageCircle size={18} />
                        </button>
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className={styles.debugButton}
                            title="Toggle Hume Debugger"
                        >
                            <Activity size={18} />
                        </button>
                        <button onClick={toggleMute} className={styles.muteButton}>
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* WhatsApp Debug Modal */}
            {showWhatsAppDebug && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '12px', zIndex: 1000,
                    border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ color: 'white', marginBottom: '10px' }}>WhatsApp Debug</h3>
                    <input
                        type="tel"
                        value={waNumber}
                        onChange={(e) => setWaNumber(e.target.value)}
                        placeholder="+1234567890"
                        style={{
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '8px', borderRadius: '6px', width: '100%', marginBottom: '10px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={saveWhatsAppNumber} style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', borderRadius: '6px', border: 'none' }}>
                            Save
                        </button>
                        <button onClick={() => window.open(`https://wa.me/16696006540?text=Hi`, '_blank')} style={{ padding: '8px 16px', background: '#2196F3', color: 'white', borderRadius: '6px', border: 'none' }}>
                            Test
                        </button>
                        <button onClick={() => setShowWhatsAppDebug(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', border: 'none' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            <HumeDebugModal
                isOpen={showDebug}
                onClose={() => setShowDebug(false)}
                humeData={{ emotions, prosody: {} }}
                llmContext={{
                    emotions,
                    transcript,
                    isListening
                }}
                transcript={transcript}
                isConnected={isHumeConnected}
            />

            <div className={styles.messages}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.message} ${msg.sender === "user" ? styles.userMessage : styles.aiMessage
                                }`}
                        >
                            {msg.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isTyping && (
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
                            onClick={toggleCallMode}
                            className={`${styles.sendButton} ${isListening ? styles.listening : ""}`}
                            style={{ background: isListening ? "var(--accent)" : "var(--surface-hover)", color: isListening ? "white" : "var(--foreground)" }}
                            title={isListening ? "Stop Call" : "Start Call"}
                        >
                            <Mic size={18} />
                        </button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? "Listening..." : "Type a message..."}
                            className={styles.input}
                        />
                        <button
                            onClick={() => handleSend()}
                            className={styles.sendButton}
                            disabled={!inputValue.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </LiquidGlass>
            </div>
        </div>
    );
}
