"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, Shield, Activity, Brain } from "lucide-react";
import styles from "./Profile.module.css";

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const savedUserProfile = localStorage.getItem("userProfile");
        const savedDeepProfile = localStorage.getItem("deepProfile");

        if (savedUserProfile) {
            const basic = JSON.parse(savedUserProfile);
            const deep = savedDeepProfile ? JSON.parse(savedDeepProfile) : {};

            setProfile({
                ...basic,
                ...deep,
                ocean: deep.traits || deep.ocean || {} // Handle both formats
            });
        }
    }, []);

    if (!profile) {
        return <div className={styles.loading}>Loading profile...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Your Profile</h1>
                <p className={styles.subtitle}>Manage your journey and preferences.</p>
            </header>

            <div className={styles.grid}>
                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.cardHeader}>
                        <User className={styles.icon} />
                        <h2>Identity</h2>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Name</span>
                        <span className={styles.value}>{profile.name || "User"}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Joined</span>
                        <span className={styles.value}>{new Date().toLocaleDateString()}</span>
                    </div>
                    {profile.identity && (
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Archetype</span>
                            <span className={styles.value}>{profile.identity}</span>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.cardHeader}>
                        <Brain className={styles.icon} />
                        <h2>Deep Profile</h2>
                    </div>
                    <div className={styles.oceanGrid}>
                        {profile.ocean && Object.entries(profile.ocean).length > 0 ? (
                            Object.entries(profile.ocean).map(([trait, score]: [string, any]) => (
                                <div key={trait} className={styles.trait}>
                                    <span className={styles.traitName}>{trait}</span>
                                    <div className={styles.traitBar}>
                                        <div
                                            className={styles.traitFill}
                                            style={{ width: `${(typeof score === 'number' ? score : 0.5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.emptyState}>Complete onboarding to generate your deep profile.</p>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className={styles.cardHeader}>
                        <Shield className={styles.icon} />
                        <h2>Integrations</h2>
                    </div>
                    <div className={styles.settingRow}>
                        <span>Instagram</span>
                        <button
                            className={styles.connectButton}
                            onClick={() => window.location.href = "/api/integrations/auth?appName=instagram"}
                        >
                            Connect
                        </button>
                    </div>
                    <div className={styles.settingRow}>
                        <span>Google People</span>
                        <button
                            className={styles.connectButton}
                            onClick={() => window.location.href = "/api/integrations/auth?appName=google_people"}
                        >
                            Connect
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className={styles.cardHeader}>
                        <Settings className={styles.icon} />
                        <h2>Preferences</h2>
                    </div>
                    <div className={styles.settingRow}>
                        <span>Voice Input</span>
                        <div className={styles.toggle}>On</div>
                    </div>
                    <div className={styles.settingRow}>
                        <span>Notifications</span>
                        <div className={styles.toggle}>Off</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
