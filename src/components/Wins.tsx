"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";
import styles from "./Wins.module.css";
import LiquidGlass from "./LiquidGlass";

interface Win {
    id: string;
    date: string;
    stressfulThought: string;
    turnaround: string;
    emotionBefore: string;
    emotionAfter: string;
}

export default function Wins() {
    const [wins, setWins] = useState<Win[]>([]);

    useEffect(() => {
        const loadWins = () => {
            const savedWins = localStorage.getItem("wins");
            if (savedWins) {
                try {
                    setWins(JSON.parse(savedWins));
                } catch (e) {
                    console.error("Failed to parse wins", e);
                }
            } else {
                // Mock data for demonstration if nothing saved
                setWins([
                    {
                        id: "1",
                        date: "Today",
                        stressfulThought: "I'm not making progress fast enough.",
                        turnaround: "I am making steady progress at my own pace.",
                        emotionBefore: "Anxious",
                        emotionAfter: "Calm"
                    }
                ]);
            }
        };

        loadWins();

        // Listen for storage updates (in case of multiple tabs or updates)
        window.addEventListener('storage', loadWins);
        return () => window.removeEventListener('storage', loadWins);
    }, []);

    const clearWins = () => {
        localStorage.removeItem("wins");
        setWins([]);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className="flex justify-between items-start w-full">
                    <div className={styles.titleWrapper}>
                        <Trophy size={32} className={styles.icon} />
                        <h1 className={`${styles.title} font-montage`}>Your Wins</h1>
                    </div>
                    {wins.length > 0 && (
                        <button
                            onClick={clearWins}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1 rounded-full border border-white/10 hover:bg-white/5"
                        >
                            Clear History
                        </button>
                    )}
                </div>
                <p className={styles.subtitle}>Transforming stress into strength, one thought at a time.</p>
            </header>

            <div className={styles.list}>
                {wins.map((win, index) => (
                    <motion.div
                        key={win.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <LiquidGlass className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.date}>{win.date}</span>
                                <div className={styles.emotions}>
                                    <span className={styles.emotionBad}>{win.emotionBefore}</span>
                                    <ArrowRight size={14} className={styles.arrow} />
                                    <span className={styles.emotionGood}>{win.emotionAfter}</span>
                                </div>
                            </div>

                            <div className={styles.transformation}>
                                <div className={styles.thoughtSection}>
                                    <div className={styles.label}>Stressful Thought</div>
                                    <p className={styles.thought}>{win.stressfulThought}</p>
                                </div>

                                <div className={styles.divider}>
                                    <div className={styles.line}></div>
                                    <div className={styles.sparkle}><Sparkles size={16} /></div>
                                    <div className={styles.line}></div>
                                </div>

                                <div className={styles.thoughtSection}>
                                    <div className={styles.label}>Turnaround</div>
                                    <p className={styles.turnaround}>{win.turnaround}</p>
                                </div>
                            </div>
                        </LiquidGlass>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
