"use client";

import { useEffect, useState } from "react";
import { Calendar, Battery, Zap, Wind, BookOpen, MessageCircle } from "lucide-react";
import styles from "./Dashboard.module.css";
import { useRouter } from "next/navigation";
import AppNotification from "@/components/Notification";
import { AnimatePresence, motion } from "framer-motion";

interface UserProfile {
    name: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stressLevel, setStressLevel] = useState<"Low" | "Medium" | "High">("Low");
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        }
    }, []);

    useEffect(() => {
        // Simulate stress detection
        const interval = setInterval(() => {
            const random = Math.random();
            if (random > 0.7) {
                setStressLevel("High");
                setShowNotification(true);
            } else {
                setStressLevel("Low");
            }
        }, 10000); // Check every 10 seconds for demo

        return () => clearInterval(interval);
    }, []);

    const userName = profile?.name || "Friend";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className={styles.container}>
            <AnimatePresence>
                {showNotification && (
                    <AppNotification
                        title="Stress Detected"
                        message="Your heart rate variability is low. Take a moment to breathe."
                        onClose={() => setShowNotification(false)}
                    />
                )}
            </AnimatePresence>

            <header className={styles.header}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={styles.greeting}
                >
                    {greeting}, {userName}.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={styles.subtitle}
                >
                    {stressLevel === "High"
                        ? "We noticed some tension. Let's slow down and recenter."
                        : "Your energy is balanced. A perfect time for deep work or reflection."}
                </motion.p>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.timelineSection}>
                    <h2 className={styles.sectionTitle}>
                        Today's Flow
                    </h2>
                    <div className={styles.timeline}>
                        {[
                            { time: "09:00", title: "Deep Work Focus", desc: "Project planning and strategy.", color: "var(--primary)" },
                            { time: "12:30", title: "Lunch & Walk", desc: "Get some fresh air and movement.", color: "var(--secondary)" },
                            { time: "15:00", title: "Team Sync", desc: "Weekly status update.", color: "var(--accent)" },
                            { time: "18:00", title: "Wind Down", desc: "Breathing exercise recommended.", color: "var(--muted)" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                className={styles.timelineItem}
                            >
                                <span className={styles.time}>{item.time}</span>
                                <div className={styles.timelineContent} style={{ borderLeft: `3px solid ${item.color}` }}>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className={styles.glassCard}
                    >
                        <h3 className={styles.sectionTitle}>Current State</h3>
                        <div className={styles.statusGrid}>
                            <div className={styles.statusItem}>
                                <Battery className="text-primary" size={24} />
                                <span className={styles.statusValue}>{stressLevel === "High" ? "Low" : "High"}</span>
                                <span className={styles.statusLabel}>Energy</span>
                            </div>
                            <div className={styles.statusItem}>
                                <Zap className={stressLevel === "High" ? "text-red-400" : "text-accent"} size={24} />
                                <span className={styles.statusValue}>{stressLevel}</span>
                                <span className={styles.statusLabel}>Stress</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className={styles.glassCard}
                    >
                        <h3 className={styles.sectionTitle}>Quick Actions</h3>
                        <div className={styles.actionGrid}>
                            <button className={styles.actionButton} onClick={() => router.push("/breathing")}>
                                <Wind size={24} />
                                <span>Breathe</span>
                            </button>
                            <button className={styles.actionButton} onClick={() => router.push("/journal")}>
                                <BookOpen size={24} />
                                <span>Journal</span>
                            </button>
                            <button className={styles.actionButton} onClick={() => router.push("/chat")}>
                                <MessageCircle size={24} />
                                <span>Chat</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
