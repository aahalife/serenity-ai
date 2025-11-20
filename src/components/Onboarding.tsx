"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import styles from "./Onboarding.module.css";
import clsx from "clsx";
import { useRouter } from "next/navigation";

type Step = "welcome" | "name" | "personality" | "complete";

const personalityQuestions = [
    {
        id: "q1",
        question: "How do you usually recharge?",
        options: [
            "Spending time alone (Introversion)",
            "Socializing with friends (Extraversion)",
            "A mix of both",
        ],
    },
    {
        id: "q2",
        question: "When facing a new challenge, you tend to...",
        options: [
            "Plan everything out (Conscientiousness)",
            "Go with the flow (Openness)",
            "Worry about outcomes (Neuroticism)",
        ],
    },
    // Add more simplified OCEAN questions as needed
];

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("welcome");
    const [name, setName] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleStart = () => setStep("name");

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) setStep("personality");
    };

    const handleOptionSelect = (option: string) => {
        setAnswers({ ...answers, [personalityQuestions[currentQuestionIndex].id]: option });

        if (currentQuestionIndex < personalityQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setStep("complete");
        }
    };

    const handleComplete = async () => {
        // Save initial profile
        const initialProfile = { name, answers };
        localStorage.setItem("userProfile", JSON.stringify(initialProfile));

        // Trigger background inference (simulated for now as we can't call server actions directly from here without setup)
        // In a real app, this would be a server action or API call
        try {
            console.log("Inferring deep profile...");
            // const deepProfile = await inferProfile(initialProfile); 
            // localStorage.setItem("deepProfile", JSON.stringify(deepProfile));
        } catch (e) {
            console.error(e);
        }

        router.push("/dashboard");
    };

    return (
        <div className={styles.container}>
            <AnimatePresence mode="wait">
                {step === "welcome" && (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.card}
                    >
                        <h1 className={styles.title}>Welcome to Serenity AI</h1>
                        <p className={styles.description}>
                            Your personal companion for a balanced, stress-free life.
                        </p>
                        <button onClick={handleStart} className={styles.button}>
                            Get Started <ArrowRight size={18} style={{ marginLeft: 8, display: "inline" }} />
                        </button>
                    </motion.div>
                )}

                {step === "name" && (
                    <motion.div
                        key="name"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={styles.card}
                    >
                        <h2 className={styles.title}>What should we call you?</h2>
                        <form onSubmit={handleNameSubmit} className={styles.inputGroup}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className={styles.input}
                                autoFocus
                            />
                            <button type="submit" className={styles.button} disabled={!name.trim()}>
                                Continue
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === "personality" && (
                    <motion.div
                        key="personality"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={styles.card}
                    >
                        <div className={styles.progress}>
                            <div
                                className={styles.progressBar}
                                style={{ width: `${((currentQuestionIndex + 1) / personalityQuestions.length) * 100}%` }}
                            />
                        </div>
                        <h2 className={styles.title}>{personalityQuestions[currentQuestionIndex].question}</h2>
                        <div className={styles.options}>
                            {personalityQuestions[currentQuestionIndex].options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    className={styles.option}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === "complete" && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.card}
                    >
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                            <div style={{ background: "var(--secondary)", padding: "1rem", borderRadius: "50%" }}>
                                <Check size={32} color="white" />
                            </div>
                        </div>
                        <h2 className={styles.title}>All set, {name}!</h2>
                        <p className={styles.description}>
                            Your journey to serenity begins now.
                        </p>
                        <button onClick={handleComplete} className={styles.button}>
                            Go to Dashboard
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
