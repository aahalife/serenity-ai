"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, X, Sparkles, RefreshCw, Volume2, VolumeX } from "lucide-react";
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

    return (
        <div className={styles.container} ref={containerRef}>
            <button className={styles.closeButton} onClick={() => window.location.href = '/'}>
                <X size={24} />
            </button>

            {/* Intro Section */}
            <section className={styles.section}>
                <div className={styles.videoBackground}>
                    <video autoPlay muted loop playsInline className={styles.video}>
                        <source src={steps[0].video} type="video/mp4" />
                    </video>
                    <div className={styles.overlay} />
                </div>

                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className={`${styles.title} font-montage`}>The Work</h1>
                    <p className={styles.subtitle}>Identify a stressful thought to investigate.</p>

                    <LiquidGlass className={styles.inputContainer}>
                        <textarea
                            className={styles.textarea}
                            placeholder="I am angry with... because..."
                            value={thought}
                            onChange={(e) => setThought(e.target.value)}
                        />
                    </LiquidGlass>

                    {suggestions.length > 0 && !thought && (
                        <div className={styles.suggestions}>
                            {suggestions.map((s, i) => (
                                <motion.button
                                    key={i}
                                    className={styles.suggestionChip}
                                    onClick={() => handleSuggestionClick(s)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {s}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <button
                            className={styles.button}
                            onClick={handleNext}
                            disabled={!thought.trim()}
                        >
                            Begin Inquiry <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>

                <div className={styles.scrollIndicator}>
                    <ChevronDown size={32} color="#fff" />
                </div>
            </section>

            {/* Questions 1-4 */}
            {[0, 1, 2, 3].map((qIndex) => (
                <section key={qIndex} className={styles.section}>
                    <div className={styles.videoBackground}>
                        <video autoPlay muted loop playsInline className={styles.video}>
                            <source src={steps[qIndex + 1].video} type="video/mp4" />
                        </video>
                        <div className={styles.overlay} />
                    </div>

                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className={`${styles.question} font-montage`}>{steps[qIndex + 1].title}</h2>
                        <div className={styles.thoughtDisplay}>"{thought}"</div>

                        <LiquidGlass className={styles.inputContainer}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Your answer..."
                                value={answers[qIndex] || ""}
                                onChange={(e) => {
                                    const newAnswers = [...answers];
                                    newAnswers[qIndex] = e.target.value;
                                    setAnswers(newAnswers);
                                }}
                            />
                        </LiquidGlass>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            {qIndex === 3 ? (
                                <button
                                    className={styles.button}
                                    onClick={handleTurnaround}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <RefreshCw className="animate-spin" /> : "Find Turnarounds"}
                                </button>
                            ) : (
                                <button className={styles.button} onClick={handleNext}>
                                    Next Question <ChevronDown size={20} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </section>
            ))}

            {/* Turnaround Section */}
            <section className={styles.section}>
                <div className={styles.videoBackground}>
                    <video autoPlay muted loop playsInline className={styles.video}>
                        <source src={steps[5].video} type="video/mp4" />
                    </video>
                    <div className={styles.overlay} />
                </div>

                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <h2 className={`${styles.title} font-montage`}>Turn it Around</h2>
                    <p className={styles.subtitle}>Consider the opposite. Could it be as true?</p>

                    <div className={styles.inputContainer} style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
                        {turnarounds.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.2 }}
                                style={{ marginBottom: '1rem' }}
                            >
                                <LiquidGlass>
                                    <div className={styles.turnaroundText}>{t.text}</div>
                                    <div className={styles.turnaroundExample}>Example: {t.example}</div>
                                </LiquidGlass>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button className={styles.button} onClick={() => window.location.href = '/'}>
                            Complete Session <Sparkles size={20} />
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
