"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";
import { Volume2, X, ArrowRight, ChevronDown, RefreshCw, Sparkles } from "lucide-react";
import styles from "./TheWork.module.css";
import LiquidGlass from "./LiquidGlass";
import { useAudio } from "@/hooks/useAudio";

const steps = [
    { id: "intro", title: "The Work", subtitle: "Identify a stressful thought.", video: "/videos/theworkbkgs/650057f73744d6f9a46e25e3_AdobeStock_291299852 loop-transcode.mp4" },
    { id: "q1", title: "Is it true?", subtitle: "Question 1", video: "/videos/theworkbkgs/650057f73744d6f9a46e25f8_LightRays-transcode.mp4" },
    { id: "q2", title: "Can you absolutely know that it's true?", subtitle: "Question 2", video: "/videos/theworkbkgs/650057f73744d6f9a46e25fb_alforreca-comp-v2-transcode.mp4" },
    { id: "q3", title: "How do you react when you believe that thought?", subtitle: "Question 3", video: "/videos/theworkbkgs/650057f73744d6f9a46e25fd_caustics-loop-comp-v2-transcode.mp4" },
    { id: "q4", title: "Who would you be without the thought?", subtitle: "Question 4", video: "/videos/theworkbkgs/650057f73744d6f9a46e2600_above-water-comp-v2-transcode.mp4" },
    { id: "turnaround", title: "Turn it around", subtitle: "Find the opposite.", video: "/videos/theworkbkgs/650057f73744d6f9a46e2602_AdobeStock_295232596-loop-comp-v2-transcode.mp4" }
];

export default function TheWork() {
    const [currentStep, setCurrentStep] = useState(0);
    const [thought, setThought] = useState("");
    const [answers, setAnswers] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [turnarounds, setTurnarounds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { play, toggleMute, isMuted } = useAudio();

    const [isGuidancePlaying, setIsGuidancePlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Play background audio on mount
    useEffect(() => {
        play("/audio/homebkg.m4a", { volume: 0.2, loop: true, fadeInDuration: 2000 });
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [play]);

    // Trigger guidance on step change
    useEffect(() => {
        const playGuidance = async () => {
            // Stop previous guidance immediately
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
                setIsGuidancePlaying(false);
            }

            try {
                // Get user profile for personalization
                const savedProfile = localStorage.getItem("userProfile");
                const userProfile = savedProfile ? JSON.parse(savedProfile) : {};

                const res = await fetch("/api/inference/work", {
                    method: "POST",
                    body: JSON.stringify({
                        mode: "guidance",
                        stepId: steps[currentStep].id,
                        input: thought,
                        context: answers, // Pass all previous answers for context
                        userProfile
                    })
                });

                if (res.ok) {
                    const { text } = await res.json();
                    if (text) {
                        // Generate TTS
                        const ttsRes = await fetch("/api/tts", {
                            method: "POST",
                            body: JSON.stringify({ text })
                        });

                        if (ttsRes.ok) {
                            const blob = await ttsRes.blob();
                            const url = URL.createObjectURL(blob);

                            // Double check if we moved on while fetching
                            if (audioRef.current) {
                                (audioRef.current as HTMLAudioElement).pause();
                            }

                            const audio = new Audio(url);
                            audioRef.current = audio;

                            audio.onplay = () => setIsGuidancePlaying(true);
                            audio.onended = () => setIsGuidancePlaying(false);

                            audio.play();
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to play guidance", e);
            }
        };

        // Small delay to allow transition
        const timer = setTimeout(playGuidance, 1000);

        return () => {
            clearTimeout(timer);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [currentStep, thought, answers]); // Re-run if thought changes (e.g. user selects a suggestion) or answers change

    // Auto-scroll to next section when step changes
    useEffect(() => {
        if (containerRef.current) {
            const sections = containerRef.current.querySelectorAll(`.${styles.section}`);
            if (sections[currentStep]) {
                sections[currentStep].scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [currentStep]);

    // Fetch suggestions on mount
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await fetch("/api/inference/work", {
                    method: "POST",
                    body: JSON.stringify({ mode: "suggestions" })
                });
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                }
            } catch (e) {
                console.error("Failed to fetch suggestions", e);
            }
        };
        fetchSuggestions();
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleTurnaround = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/inference/work", {
                method: "POST",
                body: JSON.stringify({
                    mode: "turnaround",
                    input: thought
                })
            });
            if (res.ok) {
                const data = await res.json();
                setTurnarounds(data);
                handleNext();
            }
        } catch (e) {
            console.error("Failed to fetch turnarounds", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (text: string) => {
        setThought(text);
    };

    const [isRecording, setIsRecording] = useState(false);
    const { startListening, stopListening, isListening } = useVoice({
        onSpeechEnd: async (audioBlob) => {
            // Transcribe and append
            try {
                const formData = new FormData();
                formData.append("audio", audioBlob, "recording.webm");

                const sttRes = await fetch("/api/stt", {
                    method: "POST",
                    body: formData
                });

                if (sttRes.ok) {
                    const { text } = await sttRes.json();
                    if (text) {
                        setThought(prev => prev ? `${prev} ${text}` : text);
                    }
                }
            } catch (e) {
                console.error("STT Error", e);
            } finally {
                setIsRecording(false);
            }
        }
    });

    const handleMicClick = () => {
        if (isRecording) {
            stopListening(); // This triggers onSpeechEnd
            setIsRecording(false);
        } else {
            startListening();
            setIsRecording(true);
        }
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <button className={styles.closeButton} onClick={() => window.location.href = '/'}>
                <X size={24} />
            </button>

            {steps.map((step, index) => (
                <div key={step.id} className={styles.section}>
                    <div className={styles.videoBackground}>
                        <video autoPlay muted loop playsInline className={styles.video}>
                            <source src={step.video} type="video/mp4" />
                        </video>
                        <div className={styles.overlay} />
                    </div>

                    <div className={styles.content}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className={styles.questionBox}
                        >
                            <h2>{step.title}</h2>
                            <p>{step.subtitle}</p>

                            {currentStep === index && (
                                <div className={styles.inputContainer}>
                                    {step.id === "turnaround" ? (
                                        <div className={styles.turnarounds}>
                                            {turnarounds.length > 0 ? (
                                                turnarounds.map((t, i) => (
                                                    <div key={i} className={styles.turnaroundCard}>
                                                        <h4>{t.text}</h4>
                                                        <p>{t.example}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>Click below to generate turnarounds.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <textarea
                                                value={step.id === "intro" ? thought : (answers[index - 1] || "")}
                                                onChange={(e) => {
                                                    if (step.id === "intro") {
                                                        setThought(e.target.value);
                                                    } else {
                                                        const newAnswers = [...answers];
                                                        newAnswers[index - 1] = e.target.value;
                                                        setAnswers(newAnswers);
                                                    }
                                                }}
                                                placeholder={step.id === "intro" ? "I am angry with... because..." : "Your answer..."}
                                                className={styles.textarea}
                                            />
                                            <button
                                                className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
                                                onClick={handleMicClick}
                                            >
                                                {isRecording ? <Volume2 className="animate-pulse" /> : <Volume2 />}
                                            </button>
                                        </>
                                    )}

                                    <div className={styles.actions}>
                                        {step.id === "intro" ? (
                                            <button onClick={handleNext} disabled={!thought}>
                                                Start Inquiry <ArrowRight size={16} />
                                            </button>
                                        ) : step.id === "turnaround" ? (
                                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                                <button onClick={handleTurnaround} disabled={isLoading}>
                                                    {isLoading ? <RefreshCw className="animate-spin" /> : "Find Turnarounds"}
                                                </button>
                                                {turnarounds.length > 0 && (
                                                    <button onClick={() => window.location.href = '/'}>
                                                        Complete <Sparkles size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <button onClick={handleNext}>
                                                Next <ChevronDown size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Show suggestions only for intro */}
                            {step.id === "intro" && suggestions.length > 0 && !thought && (
                                <div className={styles.suggestions}>
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            className={styles.suggestionChip}
                                            onClick={() => handleSuggestionClick(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            ))}
        </div>
    );
}
