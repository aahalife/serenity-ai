"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Zap, Activity, MessageCircle, PenTool, Wind, Volume2, VolumeX } from "lucide-react";
import styles from "./Dashboard.module.css";
import { useRouter } from "next/navigation";
import { useAudio } from "@/hooks/useAudio";
import SmartSchedule from "@/components/SmartSchedule";

export default function Dashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState("Friend");
    const { toggleMute, isMuted, play } = useAudio();
    const [flowState, setFlowState] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Mock habits for now - in a real app, these would come from a database or user input
    const habits = [
        "Morning Meditation",
        "Evening Reading",
        "Daily Walk"
    ];

    useEffect(() => {
        // Play background music
        play("/audio/homebkg.m4a", { volume: 0.3, loop: true, fadeInDuration: 2000 });
    }, [play]);

    useEffect(() => {
        const storedProfile = localStorage.getItem("userProfile");
        const deepProfile = localStorage.getItem("deepProfile");

        if (storedProfile) {
            const { name } = JSON.parse(storedProfile);
            setUserName(name || "Friend");
        }

        if (deepProfile) {
            setUserProfile(JSON.parse(deepProfile));
        }

        // Simulate fetching flow state (replace with real inference later)
        // In a real app, this would be triggered by data updates
        const mockFlowState = {
            score: 78,
            drive: 85,
            ease: 60,
            optimism: 70,
            focus: 90,
            insight: "You are in a high-drive state. Perfect for deep work."
        };
        setFlowState(mockFlowState);
    }, []);

    return (
        <div className={styles.container}>
            <button onClick={toggleMute} className={styles.muteButton}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <header className={styles.header}>
                <div className={styles.greeting}>
                    <h1>Good Morning, {userName}</h1>
                    <p>Your mind is clear. Your potential is limitless.</p>
                </div>
                <div className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            </header>

            <div className={styles.grid}>
                <section className={styles.mainSection}>
                    {flowState ? (
                        <SmartSchedule flowState={flowState} userProfile={userProfile} habits={habits} />
                    ) : (
                        <div className={styles.loading}>Analyzing your flow...</div>
                    )}
                </section>

                <aside className={styles.sidebar}>
                    <div className={styles.statusCard}>
                        <h3>Current State</h3>
                        <div className={styles.statusItem}>
                            <Zap size={18} className="text-accent" />
                            <span>Energy</span>
                            <div className={styles.bar}><div className={styles.fill} style={{ width: '80%' }} /></div>
                        </div>
                        <div className={styles.statusItem}>
                            <Activity size={18} className="text-primary" />
                            <span>Stress</span>
                            <div className={styles.bar}><div className={styles.fill} style={{ width: '30%' }} /></div>
                        </div>
                    </div>

                    <div className={styles.quickActions}>
                        <button className={styles.actionBtn} onClick={() => router.push('/journal')}>
                            <PenTool size={20} /> Journal
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/breathing')}>
                            <Wind size={20} /> Breathe
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/chat')}>
                            <MessageCircle size={20} /> Chat
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
