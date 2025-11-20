"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowRight, RefreshCw, Check } from "lucide-react";
import styles from "./TheWork.module.css";

type Step = "intro" | "identify" | "q1" | "q2" | "q3" | "q4" | "turnaround" | "camera" | "complete";

export default function TheWork() {
    const [step, setStep] = useState<Step>("intro");
    const [thought, setThought] = useState("");
    const [responses, setResponses] = useState<Record<string, string>>({});

    const handleNext = (nextStep: Step) => {
        setStep(nextStep);
    };

    const renderStep = () => {
        switch (step) {
            case "intro":
                return (
                    <div className={styles.card}>
                        <h1 className={styles.question}>The Work</h1>
                        <p className={styles.subtext}>
                            Identify a stressful thought, and let's question it together.
                        </p>
                        <button onClick={() => handleNext("identify")} className={styles.button}>
                            Start <ArrowRight size={18} style={{ marginLeft: 8, display: "inline" }} />
                        </button>
                    </div>
                );
            case "identify":
                return (
                    <div className={styles.card}>
                        <h2 className={styles.question}>What is bothering you?</h2>
                        <p className={styles.subtext}>Write down a specific thought that is causing you stress.</p>
                        <textarea
                            className={styles.textarea}
                            value={thought}
                            onChange={(e) => setThought(e.target.value)}
                            placeholder="e.g., He doesn't listen to me."
                        />
                        <button
                            onClick={() => handleNext("camera")}
                            className={styles.button}
                            disabled={!thought.trim()}
                        >
                            Continue
                        </button>
                    </div>
                );
            case "camera":
                return (
                    <div className={styles.card}>
                        <h2 className={styles.question}>Capture the moment</h2>
                        <p className={styles.subtext}>
                            Let's take a moment to see how this thought feels in your body.
                            Please position yourself comfortably.
                        </p>
                        <div className={styles.cameraMock}>
                            <Camera size={48} />
                            <span>Camera Preview (Simulated)</span>
                        </div>
                        <button onClick={() => handleNext("q1")} className={styles.button}>
                            Capture & Continue
                        </button>
                    </div>
                );
            case "q1":
                return (
                    <div className={styles.card}>
                        <h2 className={styles.question}>Is it true?</h2>
                        <p className={styles.subtext}>"{thought}"</p>
                        <div className={styles.buttonGroup}>
                            <button onClick={() => handleNext("q2")} className={styles.button}>Yes</button>
                            <button onClick={() => handleNext("q3")} className={`${styles.button} ${styles.buttonSecondary}`}>No</button>
                        </div>
                    </div>
                );
            case "q2":
                return (
                    <div className={styles.card}>
                        <h2 className={styles.question}>Can you absolutely know that it's true?</h2>
                        <div className={styles.buttonGroup}>
                            <button onClick={() => handleNext("q3")} className={styles.button}>Yes</button>
                            <button onClick={() => handleNext("q3")} className={`${styles.button} ${styles.buttonSecondary}`}>No</button>
                        </div>
                    </div>
                );
            case "q3":
                return (
                    <div className={styles.card}>
                        <h2 className={styles.question}>How do you react when you believe that thought?</h2>
                        <textarea
                            className={styles.textarea}
                            placeholder="I feel angry, I withdraw..."
                        />
                        <button onClick={() => handleNext("q4")} className={styles.button}>Next</button>
                    </div>
                );
            case "q4":
                return (
                    <div className={styles.card}>
                        <h2 className={styles.question}>Who would you be without the thought?</h2>
                        <textarea
                            className={styles.textarea}
                            placeholder="I would be free, I would be calm..."
                        />
                        <button onClick={() => handleNext("turnaround")} className={styles.button}>Next</button>
                    </div>
                );
            case "turnaround":
                return (
                    <div className={styles.card}>
                        <h2 className={styles.question}>Turn it around</h2>
                        <p className={styles.subtext}>
                            Find the opposite of "{thought}". <br />
                            Example: "He does listen to me" or "I don't listen to myself."
                        </p>
                        <textarea
                            className={styles.textarea}
                            placeholder="The turnaround is..."
                        />
                        <button onClick={() => handleNext("complete")} className={styles.button}>
                            <RefreshCw size={18} style={{ marginRight: 8, display: "inline" }} />
                            Transform
                        </button>
                    </div>
                );
            case "complete":
                return (
                    <div className={styles.card}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                            <div style={{ background: "var(--secondary)", padding: "1rem", borderRadius: "50%" }}>
                                <Check size={32} color="white" />
                            </div>
                        </div>
                        <h2 className={styles.question}>Transformation Complete</h2>
                        <p className={styles.subtext}>
                            You have shifted your perspective. Carry this freedom with you.
                        </p>
                        <div className={styles.cameraMock} style={{ background: "linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%)", color: "#333" }}>
                            <Sparkles size={48} className="text-primary" />
                            <span>(Simulated Generated Image of "Peaceful You")</span>
                        </div>
                        <button onClick={() => window.location.href = "/"} className={styles.button}>
                            Return Home
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className={styles.container}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ width: "100%" }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

import { Sparkles } from "lucide-react";
