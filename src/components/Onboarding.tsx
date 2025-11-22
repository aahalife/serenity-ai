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
        // Play Intro once, then Onboarding loop
        // Ensure user interaction has occurred if browser blocks autoplay, 
        // but for onboarding we assume user clicked "Get Started" or similar previously.
        // If not, we might need a "Start" overlay. For now, we try to play.
        play("/audio/Intro.mp3", { volume: 0.5, loop: false });

        const timer = setTimeout(() => {
            play("/audio/onboarding.wav", { volume: 0.3, loop: true, fadeInDuration: 3000 });
        }, 10000); // Approx length of intro

        return () => clearTimeout(timer);
    }, [play]);

    const handleSplashEnded = () => {
        setVideoState("journal");
        setTimeout(() => setShowContent(true), 500); // Slight delay for smooth transition
    };

    const handleNext = () => {
        if (step === 0 && !name.trim()) return;
        setStep((prev) => prev + 1);
    };

    const handleOptionSelect = (questionId: number, option: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: option }));
        setTimeout(() => {
            if (step < questions.length) {
                setStep((prev) => prev + 1);
            } else {
                finishOnboarding();
            }
        }, 500);
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
                        key="step0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.cardWrapper}
                    >
                        <LiquidGlass className={styles.card}>
                            {step === 0 ? (
                                <div className={styles.stepContent}>
                                    <h1 className={styles.title}>Welcome to Serenity</h1>
                                    <p className={styles.subtitle}>Let's get to know you better. What should we call you?</p>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className={styles.input}
                                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                                    />
                                    <button onClick={handleNext} className={styles.button}>
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
