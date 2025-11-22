"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, Volume2, VolumeX } from "lucide-react";
import LiquidGlass from "./LiquidGlass";
import { useRouter } from "next/navigation";
import { useAudio } from "@/hooks/useAudio";
import styles from "./Onboarding.module.css";

// ... (imports remain the same)

const questions = [
    {
        id: 1,
        text: "How do you usually recharge?",
        options: ["Spending time alone", "Socializing with friends", "Engaging in a hobby", "Sleeping or resting"],
    },
    {
        id: 2,
        text: "When facing a difficult problem, you tend to...",
        options: ["Analyze it logically", "Follow your intuition", "Ask for advice", "Take immediate action"],
    },
    {
        id: 3,
        text: "What is your primary goal right now?",
        options: ["Reduce stress", "Improve focus", "Understand myself", "Find more joy"],
    },
];

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const { play, stop } = useAudio();
    const [videoState, setVideoState] = useState<"splash" | "journal">("splash");
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Audio Sequence Logic
        // 1. Play Intro.mp3 immediately
        // 2. When Intro ends, play onboarding.wav
        play("/audio/Intro.mp3", {
            volume: 0.6,
            loop: false,
            onEnded: () => {
                play("/audio/onboarding.wav", { volume: 0.3, loop: true, fadeInDuration: 2000 });
            }
        });
    }, [play]);

    const handleSplashEnded = () => {
        setVideoState("journal");
        setTimeout(() => setShowContent(true), 500);
    };

    const handleNext = () => {
        if (step === 0 && !name.trim()) return;
        setStep((prev) => prev + 1);
    };

    const finishOnboarding = async () => {
        localStorage.setItem("userProfile", JSON.stringify({ name }));
        localStorage.setItem("onboardingAnswers", JSON.stringify(answers));

        try {
            const signals = {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                userAgent: navigator.userAgent,
                location: "Unknown" // Could use Geolocation API if permission granted
            };

            const response = await fetch("/api/inference/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, answers, signals })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("deepProfile", JSON.stringify(data.profile));
            }
        } catch (e) {
            console.error("Inference failed", e);
        }

        stop(2000);
        router.push("/");
    };

    const handleOptionSelect = (questionId: number, option: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: option }));
        setTimeout(() => {
            if (step < questions.length) {
                setStep((prev) => prev + 1);
            } else {
                finishOnboarding();
            }
        }, 400);
    };

    // ... finishOnboarding ...

    return (
        <div className={styles.container}>
            {/* Background Video Layer */}
            <div className={styles.videoLayer}>
                <AnimatePresence mode="wait">
                    {videoState === "splash" ? (
                        <motion.video
                            key="splash"
                            src="/videos/splashbkg.mp4"
                            className={styles.video}
                            autoPlay
                            muted
                            playsInline
                            onEnded={handleSplashEnded}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        />
                    ) : (
                        <motion.video
                            key="journal"
                            src="/videos/journalbkg.mp4"
                            className={styles.video}
                            autoPlay
                            muted
                            loop
                            playsInline
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        />
                    )}
                </AnimatePresence>
                <div className={styles.overlay} />
            </div>

            {/* Main Content */}
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.contentWrapper}
                    >
                        {/* Header Outside Card */}
                        <div className={styles.header}>
                            <h1 className={styles.title}>Welcome to Serenity</h1>
                            <p className={styles.subtitle}>
                                {step === 0
                                    ? "Let's get to know you better. What should we call you?"
                                    : "Help us personalize your experience."}
                            </p>
                        </div>

                        <LiquidGlass className={styles.card}>
                            {step === 0 ? (
                                <div className={styles.stepContent}>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className={styles.input}
                                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                                        autoFocus
                                    />
                                    <button onClick={handleNext} className={styles.primaryButton}>
                                        Continue <ChevronRight size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.stepContent}>
                                    <h2 className={styles.question}>{questions[step - 1].text}</h2>
                                    <div className={styles.options}>
                                        {questions[step - 1].options.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleOptionSelect(questions[step - 1].id, option)}
                                                className={styles.optionButton}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </LiquidGlass>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
