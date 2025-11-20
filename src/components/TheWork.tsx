"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, X, Sparkles, RefreshCw } from "lucide-react";
import styles from "./TheWork.module.css";
import LiquidGlass from "./LiquidGlass";

const steps = [
    { id: "intro", title: "The Work", subtitle: "Identify a stressful thought." },
    { id: "q1", title: "Is it true?", subtitle: "Question 1" },
    { id: "q2", title: "Can you absolutely know that it's true?", subtitle: "Question 2" },
    { id: "q3", title: "How do you react when you believe that thought?", subtitle: "Question 3" },
    { id: "q4", title: "Who would you be without the thought?", subtitle: "Question 4" },
    { id: "turnaround", title: "Turn it around", subtitle: "Find the opposite." }
];

export default function TheWork() {
    const [currentStep, setCurrentStep] = useState(0);
    const [thought, setThought] = useState("");
    const [answers, setAnswers] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [turnarounds, setTurnarounds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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
                        <source src="/videos/herobookbkg.mp4" type="video/mp4" />
                    </video>
                    <div className={styles.overlay} />
                </div>

                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className={styles.title}>The Work</h1>
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

                    <div style={{ marginTop: '2rem' }}>
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
                            <source src="/videos/herobookbkg.mp4" type="video/mp4" />
                        </video>
                        <div className={styles.overlay} />
                    </div>

                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className={styles.question}>{steps[qIndex + 1].title}</h2>
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

                        <div style={{ marginTop: '2rem' }}>
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
                        <source src="/videos/herobookbkg.mp4" type="video/mp4" />
                    </video>
                    <div className={styles.overlay} />
                </div>

                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <h2 className={styles.title}>Turn it Around</h2>
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
