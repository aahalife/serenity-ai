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
    const { play, stop, toggleMute, isMuted } = useAudio();
    const [videoState, setVideoState] = useState<"splash" | "journal">("splash");
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Play Intro once, then Onboarding loop
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
            const response = await fetch("/api/inference/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, answers })
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

            <button onClick={toggleMute} className={styles.muteButton}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <AnimatePresence mode="wait">
                {showContent && step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.cardWrapper}
                    >
                        <LiquidGlass className={styles.card}>
                            <h1 className={styles.title}>Welcome to Serenity</h1>
                            <p className={styles.description}>Let's get to know you better. What should we call you?</p>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                            />
                            <button className={styles.button} onClick={handleNext} disabled={!name.trim()}>
                                Continue <ChevronRight size={20} />
                            </button>
                        </LiquidGlass>
                    </motion.div>
                )}

                {showContent && step > 0 && step <= questions.length && (
                    <motion.div
                        key={`step${step}`}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className={styles.cardWrapper}
                    >
                        <LiquidGlass className={styles.card}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${(step / questions.length) * 100}%` }} />
                            </div>
                            <h2 className={styles.question}>{questions[step - 1].text}</h2>
                            <div className={styles.options}>
                                {questions[step - 1].options.map((option) => (
                                    <button
                                        key={option}
                                        className={`${styles.option} ${answers[questions[step - 1].id] === option ? styles.selected : ""}`}
                                        onClick={() => handleOptionSelect(questions[step - 1].id, option)}
                                    >
                                        {option}
                                        {answers[questions[step - 1].id] === option && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </LiquidGlass>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
