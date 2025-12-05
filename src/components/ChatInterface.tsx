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

import { useSession } from "next-auth/react";

export default function ChatInterface() {
    const { data: session } = useSession();
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

    // Auto-sync with backend if logged in via NextAuth but no backend token
    useEffect(() => {
        const syncAuth = async () => {
            // Check if we have a NextAuth session (we can't access it directly here easily without useSession, 
            // but let's assume the user might have profile data in localStorage from Onboarding or we fetch it)

            // Actually, better to use the profile data we already have.
            const savedUserProfile = localStorage.getItem("userProfile");
            const token = localStorage.getItem("external_api_token");

            if (savedUserProfile && !token) {
                try {
                    const profile = JSON.parse(savedUserProfile);
                    if (profile.email) {
                        console.log("Syncing Google user with backend...");
                        // Try to register/login
                        // We use a dummy password for OAuth users or a specific endpoint if available.
                        // For now, we'll use a consistent hash or ID as password for this "shadow" account.
                        const shadowPassword = `google_oauth_${profile.email}_secret`;

                        try {
                            // Try login first
                            const data = await externalApi.login(profile.email, shadowPassword);
                            localStorage.setItem("external_api_token", data.access_token);
                            console.log("Backend sync successful (login)");
                        } catch (e) {
                            // Login failed, try register
                            console.log("Login failed, trying registration...");
                            await externalApi.register({
                                email: profile.email,
                                password: shadowPassword,
                                name: profile.name || "User",
                                age: parseInt(profile.age) || 25,
                                gender_identity: profile.gender || "Prefer not to say",
                                location: profile.location || "Unknown",
                                stress_level: "5"
                            });
                            // Login again
                            const data = await externalApi.login(profile.email, shadowPassword);
                            localStorage.setItem("external_api_token", data.access_token);
                            console.log("Backend sync successful (register)");
                        }
                    }
                } catch (err) {
                    console.error("Backend sync failed", err);
                }
            }
        };

        syncAuth();
    }, []);

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
            let token = localStorage.getItem("external_api_token");
            const savedDeepProfile = localStorage.getItem("deepProfile");
            const savedUserProfile = localStorage.getItem("userProfile");
            const userGoal = localStorage.getItem("userGoal") || "General Wellness";

            // Auto-login / Fallback if no token
            if (!token) {
                console.warn("No external API token found, using fallback/demo token.");
                // In a real app, we might trigger a background login here.
                // For now, let's allow it to proceed, assuming the backend might handle it 
                // or we use a temporary session.
                token = "demo_token_" + Date.now();
                localStorage.setItem("external_api_token", token);
            }

            const profile = {
                ...JSON.parse(savedUserProfile || "{}"),
                ...JSON.parse(savedDeepProfile || "{}"),
            };

            // Inject Goal Context if it's the first message or periodically
            let finalMessage = textToSend;
            if (messages.length <= 1) {
                finalMessage = `${externalApi.formatGoalMessage(userGoal)}\n\nUser Message: ${textToSend}`;
            }

            // Call External API
            // Note: If externalApi.chat fails with invalid token, we catch it below.
            const data = await externalApi.chat(finalMessage, token, { userProfile: profile });

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm listening...",
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiResponse]);

            if (isVoice || isCallMode) {
                speak(aiResponse.text);
            }
        } catch (error: any) {
            console.error("Chat Error:", error);

            // Auto-Registration on 401
            if (error.message && error.message.includes("401")) {
                const savedUserProfile = localStorage.getItem("userProfile");
                if (savedUserProfile) {
                    try {
                        const profile = JSON.parse(savedUserProfile);

                        // Use session email if profile email is missing
                        const emailToUse = profile.email || session?.user?.email;

                        if (emailToUse) {
                            console.log("401 detected. Attempting auto-registration for:", emailToUse);

                            // Update profile with email if missing
                            if (!profile.email) {
                                profile.email = emailToUse;
                                localStorage.setItem("userProfile", JSON.stringify(profile));
                            }

                            // 1. Register
                            const shadowPassword = `google_oauth_${emailToUse}_secret`;
                            try {
                                await externalApi.register({
                                    email: emailToUse,
                                    password: shadowPassword,
                                    name: profile.name || session?.user?.name || "User",
                                    age: parseInt(profile.age) || 25, // Ensure int
                                    gender_identity: profile.gender || "Prefer not to say",
                                    location: profile.location || "Unknown",
                                    stress_level: "5" // Default
                                });
                                console.log("Registration successful.");
                            } catch (regError) {
                                console.warn("Registration might have failed (user exists?), trying login...", regError);
                            }

                            // 2. Login
                            const data = await externalApi.login(emailToUse, shadowPassword);
                            if (data && data.access_token) {
                                localStorage.setItem("external_api_token", data.access_token);
                                console.log("Login successful, retrying chat...");

                                const successMsg: Message = {
                                    id: (Date.now() + 1).toString(),
                                    text: "Account connected successfully! Please send your message again.",
                                    sender: "ai",
                                    timestamp: new Date(),
                                };
                                setMessages((prev) => [...prev, successMsg]);
                                return;
                            }
                        } else {
                            console.error("Cannot auto-register: No email found in profile or session.");
                        }
                    } catch (authError) {
                        console.error("Auto-registration failed", authError);
                    }
                }
            }

            let errorMsg = "I'm having trouble connecting. Please try again.";
            if (error instanceof Error) {
                errorMsg += ` (Details: ${error.message})`;
            }
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: errorMsg,
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
                            onClick={() => {
                                if (confirm("Start a new session? This will clear current chat.")) {
                                    setMessages([]);
                                    localStorage.removeItem("chatHistory");
                                    setMessages([{
                                        id: Date.now().toString(),
                                        text: "Session cleared. How can I help you now?",
                                        sender: "ai",
                                        timestamp: new Date(),
                                    }]);
                                }
                            }}
                            className={styles.debugButton}
                            title="New Session"
                        >
                            <Zap size={18} />
                        </button>
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
