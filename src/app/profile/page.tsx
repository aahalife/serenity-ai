"use client";

import { useState, useEffect } from "react";
import { User, Mail, Brain, Sparkles, Shield } from "lucide-react";
import styles from "./page.module.css";

export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<any>(null);
    const [deepProfile, setDeepProfile] = useState<any>(null);

    useEffect(() => {
        const storedProfile = localStorage.getItem("userProfile");
        const storedDeepProfile = localStorage.getItem("deepProfile");

        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
        }
        if (storedDeepProfile) {
            setDeepProfile(JSON.parse(storedDeepProfile));
        }
    }, []);

    if (!userProfile) {
        return <div className={styles.loading}>Loading profile...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {userProfile.name?.charAt(0) || "U"}
                </div>
                <div className={styles.headerInfo}>
                    <h1>{userProfile.name}</h1>
                    <p className={styles.email}><Mail size={14} /> {userProfile.email}</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Brain size={20} className="text-primary" />
                        <h3>Inferred Mindset</h3>
                    </div>
                    <div className={styles.cardContent}>
                        {deepProfile ? (
                            <ul className={styles.traitList}>
                                {deepProfile.traits?.map((trait: string, i: number) => (
                                    <li key={i} className={styles.trait}>{trait}</li>
                                )) || <p>No traits inferred yet.</p>}
                            </ul>
                        ) : (
                            <p className={styles.placeholder}>Interact with Serenity to build your deep profile.</p>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Sparkles size={20} className="text-accent" />
                        <h3>Core Values</h3>
                    </div>
                    <div className={styles.cardContent}>
                        {deepProfile ? (
                            <div className={styles.valuesList}>
                                {deepProfile.values?.map((value: string, i: number) => (
                                    <span key={i} className={styles.valueTag}>{value}</span>
                                )) || <p>No values inferred yet.</p>}
                            </div>
                        ) : (
                            <p className={styles.placeholder}>Your values will appear here as we get to know you.</p>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Shield size={20} className="text-secondary" />
                        <h3>Privacy & Data</h3>
                    </div>
                    <div className={styles.cardContent}>
                        <p className={styles.privacyText}>
                            Your data is stored locally and only used to enhance your personal experience.
                            We do not sell your personal information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
