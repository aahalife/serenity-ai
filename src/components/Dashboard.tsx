"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Zap, Activity, MessageCircle, PenTool, Wind, Volume2, VolumeX } from "lucide-react";
import styles from "./Dashboard.module.css";
import { useRouter } from "next/navigation";
import { useAudio } from "@/hooks/useAudio";
import SmartSchedule from "@/components/SmartSchedule";

import StressModal from "@/components/StressModal";
import StressSelfReportModal from "@/components/StressSelfReportModal";

export default function Dashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState("Friend");
    const { toggleMute, isMuted, play } = useAudio();
    const [flowState, setFlowState] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isStressModalOpen, setIsStressModalOpen] = useState(false);
    const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);

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
            stress: 25, // Low stress for now
            energy: 80,
            insight: "You are in a high-drive state. Perfect for deep work."
        };
        setFlowState(mockFlowState);
    }, []);

    // Check for stress/energy levels to trigger modal whenever flowState changes
    useEffect(() => {
        if (flowState && (flowState.stress > 70 || flowState.energy < 30)) {
            const timer = setTimeout(() => setIsStressModalOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [flowState]);

    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    }, []);

    // Subtle status indicator color
    const getStatusColor = () => {
        if (!flowState) return "var(--primary)";
        if (flowState.stress > 70) return "#ef4444"; // Red
        if (flowState.stress > 40) return "#f59e0b"; // Orange
        return "#10b981"; // Green
    };

    const handleDebugUpdate = (stress: number, energy: number) => {
        setFlowState((prev: any) => ({
            ...prev,
            stress,
            energy
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.videoBackground}>
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.video}
                >
                    <source src="/videos/dashboardbkg.webm" type="video/webm" />
                </video>
                <div className={styles.videoOverlay}></div>
            </div>
            <button onClick={toggleMute} className={styles.muteButton}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <header className={styles.header}>
                <div className={styles.greeting}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1>Good Morning, {userName}</h1>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(),
                                boxShadow: `0 0 10px ${getStatusColor()}`,
                                transition: 'all 0.5s ease',
                                cursor: 'pointer'
                            }}
                            title="Debug: Click to set Stress Level"
                            onClick={() => setIsDebugModalOpen(true)}
                        />
                    </div>
                    <p>Your mind is clear. Your potential is limitless.</p>
                </div>
                <div className={styles.date}>{currentDate}</div>
            </header>

            <div className={styles.grid}>
                <section className={styles.mainSection}>
                    {flowState ? (
                        <SmartSchedule flowState={flowState} userProfile={userProfile} habits={habits} />
                    ) : (
                        <div className={styles.loading}>Analyzing your flow...</div>
                    )}
                </section>
            </div>

            <StressModal
                isOpen={isStressModalOpen}
                onClose={() => setIsStressModalOpen(false)}
                stressLevel={flowState?.stress || 0}
                energyLevel={flowState?.energy || 100}
            />

            <StressSelfReportModal
                isOpen={isDebugModalOpen}
                onClose={() => setIsDebugModalOpen(false)}
                currentStress={flowState?.stress || 0}
                currentEnergy={flowState?.energy || 100}
                onUpdate={handleDebugUpdate}
            />
        </div>
    );
}
