"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Mic, Volume2, VolumeX } from "lucide-react";
import styles from "./TheWork.module.css";

const questions = [
    "Is it true?",
    "Can you absolutely know that it's true?",
    "How do you react, what happens, when you believe that thought?",
    "Who would you be without the thought?"
];

export default function TheWork() {
    const [step, setStep] = useState(0);
    const [thought, setThought] = useState("");
    const [answers, setAnswers] = useState<string[]>([]);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const audio = new Audio("/audio/work.mp3");
        audio.loop = true;
        if (!isMuted) {
            audio.play().catch(e => console.log("Audio play failed", e));
        }
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [isMuted]);

    const nextStep = () => {
        if (step < questions.length + 2) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.videoBackground}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.video}
                >
                    <source src="/videos/herobookbkg.mp4" type="video/mp4" />
                </video>
                <div className={styles.videoOverlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((step + 1) / (questions.length + 2)) * 100}%` }}
                    />
                </div>

                <button
                    className={styles.muteButton}
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={styles.card}
                        >
                            <h1 className={styles.title}>The Work</h1>
                            <p className={styles.description}>
                                Identify a stressful thought. We will question it together.
                            </p>
                            <textarea
                                className={styles.textArea}
                                placeholder="I am angry with... because..."
                                value={thought}
                                onChange={(e) => setThought(e.target.value)}
                            />
                            <button
                                className={styles.primaryButton}
                                onClick={nextStep}
                                disabled={!thought.trim()}
                            >
                                Begin Inquiry <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="pause"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className={styles.card}
                        >
                            <h2 className={styles.question}>Close your eyes.</h2>
                            <p className={styles.description}>
                                Hold the thought: "{thought}"
                            </p>
                            <p className={styles.subtext}>
                                Be still. Witness the thought.
                            </p>
                            <button className={styles.primaryButton} onClick={nextStep}>
                                I am ready
                            </button>
                        </motion.div>
                    )}

                    {step >= 2 && step < 6 && (
                        <motion.div
                            key={`q${step}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className={styles.card}
                        >
                            <h2 className={styles.question}>{questions[step - 2]}</h2>
                            <p className={styles.thoughtDisplay}>"{thought}"</p>

                            <textarea
                                className={styles.textArea}
                                placeholder="Your answer..."
                                value={answers[step - 2] || ""}
                                onChange={(e) => {
                                    const newAnswers = [...answers];
                                    newAnswers[step - 2] = e.target.value;
                                    setAnswers(newAnswers);
                                }}
                                style={{ minHeight: '150px' }}
                            />

                            <div className={styles.buttonGroup}>
                                <button className={styles.button} onClick={prevStep}>Back</button>
                                <button className={styles.primaryButton} onClick={nextStep}>Next</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div
                            key="turnaround"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.card}
                        >
                            <CheckCircle size={48} className={styles.successIcon} />
                            <h2 className={styles.title}>Turn it around</h2>
                            <p className={styles.description}>
                                Consider the opposite of your thought. Could it be as true or truer?
                            </p>
                            <div className={styles.buttonGroup}>
                                <button className={styles.button} onClick={() => setStep(0)}>New Inquiry</button>
                                <button className={styles.primaryButton} onClick={() => window.location.href = '/'}>Complete</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
