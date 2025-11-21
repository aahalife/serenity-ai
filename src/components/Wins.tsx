"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";
import styles from "./Wins.module.css";

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
        // In a real app, this would fetch from an API or database.
        // For now, we'll use mock data or local storage if available.
        const savedWins = localStorage.getItem("wins");
        if (savedWins) {
            setWins(JSON.parse(savedWins));
        } else {
            // Mock data for demonstration
            setWins([
                {
                    id: "1",
                    date: "Today",
                    stressfulThought: "I'm not making progress fast enough.",
                    turnaround: "I am making steady progress at my own pace.",
                    emotionBefore: "Anxious",
                    emotionAfter: "Calm"
                },
                {
                    id: "2",
                    date: "Yesterday",
                    stressfulThought: "They don't appreciate my work.",
                    turnaround: "I appreciate my own work and effort.",
                    emotionBefore: "Resentful",
                    emotionAfter: "Empowered"
                }
            ]);
        }
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleWrapper}>
                    <Trophy size={32} className={styles.icon} />
                    <h1 className={styles.title}>Your Wins</h1>
                </div>
                <p className={styles.subtitle}>Transforming stress into strength, one thought at a time.</p>
            </header>

            <div className={styles.list}>
                {wins.map((win, index) => (
                    <motion.div
                        key={win.id}
                        className={styles.card}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
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
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
