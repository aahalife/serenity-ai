"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Heart, Zap, Brain, Target } from "lucide-react";
import styles from "./Profile.module.css";

interface DeepProfile {
    ocean: {
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
    };
    values: string[];
    stressors: string[];
    communicationStyle: string;
}

export default function Profile() {
    const [profile, setProfile] = useState<DeepProfile | null>(null);
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        const savedDeepProfile = localStorage.getItem("deepProfile");
        const savedUserProfile = localStorage.getItem("userProfile");

        if (savedDeepProfile) setProfile(JSON.parse(savedDeepProfile));
        if (savedUserProfile) setUserName(JSON.parse(savedUserProfile).name);
    }, []);

    if (!profile) return <div className={styles.loading}>Loading Profile...</div>;

    return (
        <div className={styles.container}>
            <div className="ambient-glow" />

            <header className={styles.header}>
                <div className={styles.avatar}>
                    {userName.charAt(0)}
                </div>
                <h1 className={styles.name}>{userName}</h1>
                <p className={styles.tagline}>The Architect of Serenity</p>
            </header>

            <div className={styles.grid}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${styles.card} liquid-border`}
                >
                    <h2 className={styles.cardTitle}><Brain size={20} /> Personality (OCEAN)</h2>
                    <div className={styles.traits}>
                        {Object.entries(profile.ocean).map(([trait, score]) => (
                            <div key={trait} className={styles.traitRow}>
                                <span className={styles.traitName}>{trait}</span>
                                <div className={styles.traitBar}>
                                    <div className={styles.traitFill} style={{ width: `${score * 10}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${styles.card} liquid-border`}
                >
                    <h2 className={styles.cardTitle}><Heart size={20} /> Core Values</h2>
                    <div className={styles.tags}>
                        {profile.values.map(val => (
                            <span key={val} className={styles.tag}>{val}</span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`${styles.card} liquid-border`}
                >
                    <h2 className={styles.cardTitle}><Shield size={20} /> Stressors</h2>
                    <div className={styles.tags}>
                        {profile.stressors.map(stress => (
                            <span key={stress} className={styles.tagRed}>{stress}</span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${styles.card} liquid-border`}
                >
                    <h2 className={styles.cardTitle}><Zap size={20} /> Communication Style</h2>
                    <p className={styles.text}>{profile.communicationStyle}</p>
                </motion.div>
            </div>
        </div>
    );
}
