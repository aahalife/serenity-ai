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

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I'm Serenity. How are you feeling today?",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { play, toggleMute, isMuted, duck, unduck } = useAudio();

    useEffect(() => {
        play("/audio/chatbkg.m4a", { volume: 0.2, loop: true, fadeInDuration: 2000 });
    }, [play]);

    const [showDebug, setShowDebug] = useState(false);
    const [emotions, setEmotions] = useState<any[]>([]);
    const { connect: connectHume, disconnect: disconnectHume, isConnected: isHumeConnected } = useHume({
        onEmotion: (newEmotions) => {
            // Keep top 3 emotions
            const topEmotions = newEmotions
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, 3);
            setEmotions(topEmotions);
        }
    });

    const { isListening, isSpeaking, transcript, startListening, stopListening, speak } = useVoice({
        onSpeechEnd: (text) => {
            handleSend(text);
        },
        onSpeakStart: () => duck(0, 0.05), // Duck background audio when AI speaks
        onSpeakEnd: () => unduck(0.2)     // Restore volume when AI stops
    });

    // Handle Call Mode toggle
    const toggleCallMode = () => {
        if (isListening) {
            stopListening();
            disconnectHume();
        } else {
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

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            // Retrieve profile and flow state
            const savedDeepProfile = localStorage.getItem("deepProfile");
            const savedUserProfile = localStorage.getItem("userProfile");
            const savedFlowState = localStorage.getItem("flowState");

            const profile = {
                ...JSON.parse(savedUserProfile || "{}"),
                ...JSON.parse(savedDeepProfile || "{}"),
                currentState: JSON.parse(savedFlowState || "{}")
            };

            // Construct rich context for LLM
            const llmPayload = {
                message: textToSend,
                history: messages.map(m => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] })),
                profile: {
                    ...profile,
                    currentEmotions: emotions, // Pass real-time emotions
                    location: Intl.DateTimeFormat().resolvedOptions().timeZone, // Simple location proxy
                }
            };

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(llmPayload),
            });

            const data = await response.json();
            console.log("Chat API Response:", data);

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm listening...",
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiResponse]);
            speak(aiResponse.text);
        } catch (error) {
            console.error("Chat Error:", error);
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
                            {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Always here for you"}
                        </p>
                    </div>
                    <div className={styles.headerControls}>
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
