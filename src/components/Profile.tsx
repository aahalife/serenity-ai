"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, Shield, Activity, Brain } from "lucide-react";
import { getUserStressProfile, saveUserStressProfile, StressProfile } from "@/lib/stress-relief/user-preferences";
import styles from "./Profile.module.css";

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);
    const [stressProfile, setStressProfile] = useState<StressProfile>({ triggers: [], copingStyle: 'cognitive', intensity: 'medium' });
    const [isMounted, setIsMounted] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const handleGenerateProfile = async () => {
        setIsGenerating(true);
        setGenerationError(null);
        try {
            console.log("Manually triggering profile inference...");
            const inferenceRes = await fetch('/api/inference/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    age: profile.age,
                    gender: profile.gender,
                    location: profile.location,
                    occupation: profile.occupation,
                    family: profile.family
                })
            });

            if (inferenceRes.ok) {
                const inferenceData = await inferenceRes.json();
                if (inferenceData.profile) {
                    const deepData = inferenceData.profile;
                    console.log("Inference successful", deepData);

                    localStorage.setItem("deepProfile", JSON.stringify(deepData));

                    setProfile((prev: any) => ({
                        ...prev,
                        ...deepData,
                        deepProfileText: JSON.stringify(deepData, null, 2),
                        ocean: deepData.traits || deepData.ocean || {}
                    }));
                } else {
                    setGenerationError("Analysis returned empty. Please check your details and try again.");
                }
            } else {
                const errorText = await inferenceRes.text();
                console.error("Inference API returned error", errorText);
                setGenerationError("Failed to generate profile. Please try again.");
            }
        } catch (error) {
            console.error("Manual generation failed", error);
            setGenerationError("Network error. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        const loadProfile = async () => {
            try {
                const savedUserProfile = localStorage.getItem("userProfile");
                const savedDeepProfile = localStorage.getItem("deepProfile");
                const savedStressProfile = getUserStressProfile();
                setStressProfile(savedStressProfile);

                let currentProfile: any = {};

                if (savedUserProfile) {
                    const basic = JSON.parse(savedUserProfile);
                    currentProfile = { ...basic };
                } else {
                    currentProfile = { name: "User" };
                }

                // Try to fetch latest deep profile from API
                let deepData = null;
                try {
                    const res = await fetch('/api/chat/details');
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.user_profile) {
                            deepData = typeof data.user_profile === 'string'
                                ? JSON.parse(data.user_profile)
                                : data.user_profile;

                            // Check if it's the empty object or valid
                            if (Object.keys(deepData).length === 0) {
                                deepData = null; // Treat empty object as null to trigger fallback
                            }
                        }
                    }
                } catch (err) {
                    console.warn("Failed to fetch latest deep profile from chat API", err);
                }

                // Fallback: Call Inference API if chat API failed or returned empty
                if (!deepData) {
                    console.log("Deep profile missing, attempting inference...");
                    try {
                        const inferenceRes = await fetch('/api/inference/profile', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: currentProfile.name,
                                age: currentProfile.age,
                                gender: currentProfile.gender,
                                location: currentProfile.location,
                                occupation: currentProfile.occupation,
                                family: currentProfile.family
                            })
                        });

                        if (inferenceRes.ok) {
                            const inferenceData = await inferenceRes.json();
                            if (inferenceData.profile) {
                                deepData = inferenceData.profile;
                                console.log("Inferred profile successfully");
                            }
                        }
                    } catch (infErr) {
                        console.error("Inference failed", infErr);
                    }
                }

                // Final Merge
                if (deepData) {
                    localStorage.setItem("deepProfile", JSON.stringify(deepData));
                    currentProfile = {
                        ...currentProfile,
                        ...deepData,
                        deepProfileText: JSON.stringify(deepData, null, 2),
                        ocean: deepData.traits || deepData.ocean || {} // Keep backward compat if needed
                    };
                } else if (savedDeepProfile) {
                    // Last resort: local storage
                    try {
                        const saved = JSON.parse(savedDeepProfile);
                        currentProfile = { ...currentProfile, ...saved };
                    } catch (e) {
                        console.error("Failed to parse saved profile", e);
                    }
                }

                setProfile(currentProfile);

            } catch (e) {
                console.error("Failed to load profile data", e);
                setProfile({ name: "User", ocean: {} });
            }
        };

        loadProfile();
    }, []);

    // Helper to render sections
    const renderSection = (title: string, data: any) => {
        if (!data) return null;
        return (
            <div className="mb-6 last:mb-0">
                <h3 className="text-sm font-bold text-purple-300 mb-2 uppercase tracking-wider">{title}</h3>
                <div className="grid grid-cols-1 gap-2 text-sm text-white/80">
                    {Object.entries(data).map(([key, value]) => {
                        if (!value || key === 'confidence_notes') return null;
                        return (
                            <div key={key} className="flex flex-col sm:flex-row sm:justify-between border-b border-white/5 pb-2 last:border-0">
                                <span className="text-white/50 capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-right font-medium">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!isMounted) return null;

    // Show loading state only until effect runs
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
                    {/* Identity Inputs (Name, Age, etc.) - Keeping existing inputs */}
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Name</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={profile.name || ""}
                            onChange={(e) => {
                                const newProfile = { ...profile, name: e.target.value };
                                setProfile(newProfile);
                                localStorage.setItem("userProfile", JSON.stringify(newProfile));
                            }}
                        />
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Age</span>
                        <input
                            type="number"
                            className={styles.input}
                            value={profile.age || ""}
                            onChange={(e) => {
                                const newProfile = { ...profile, age: e.target.value };
                                setProfile(newProfile);
                                localStorage.setItem("userProfile", JSON.stringify(newProfile));
                            }}
                        />
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Gender</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={profile.gender || ""}
                            onChange={(e) => {
                                const newProfile = { ...profile, gender: e.target.value };
                                setProfile(newProfile);
                                localStorage.setItem("userProfile", JSON.stringify(newProfile));
                            }}
                        />
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Location</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={profile.location?.city || profile.location || ""}
                            onChange={(e) => {
                                const newProfile = { ...profile, location: e.target.value };
                                setProfile(newProfile);
                                localStorage.setItem("userProfile", JSON.stringify(newProfile));
                            }}
                        />
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Occupation</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={profile.occupation || ""}
                            onChange={(e) => {
                                const newProfile = { ...profile, occupation: e.target.value };
                                setProfile(newProfile);
                                localStorage.setItem("userProfile", JSON.stringify(newProfile));
                            }}
                        />
                    </div>
                </motion.div>

                {/* Deep Profile Card - Expanded */}
                <motion.div
                    className={`${styles.card} col-span-1 md:col-span-2`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.cardHeader}>
                        <Brain className={styles.icon} />
                        <h2>Deep Profile Analysis</h2>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {profile.professional_financial || profile.psychological_social ? (
                            <>
                                {renderSection("Professional & Financial", profile.professional_financial)}
                                {renderSection("Psychological & Social", profile.psychological_social)}
                                {renderSection("Lifestyle Preferences", profile.lifestyle_preferences)}
                                {renderSection("Health & Wellness", profile.health_wellness)}
                                {renderSection("Future Aspirations", profile.future_aspirations)}
                                {renderSection("Habits & Behaviors", profile.habits_behaviors)}

                                {profile.behaviour_change && profile.behaviour_change.goals && (
                                    <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <h4 className="text-sm font-bold text-blue-300 mb-2">Current Goal</h4>
                                        <p className="text-sm text-white/90">
                                            {Array.isArray(profile.behaviour_change.goals)
                                                ? profile.behaviour_change.goals.join(", ")
                                                : profile.behaviour_change.goals}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-white/60 mb-4">Complete your profile details to generate a deep analysis.</p>
                                {generationError && (
                                    <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-3 py-2 rounded">{generationError}</p>
                                )}
                                <button
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleGenerateProfile}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? "Generating..." : "Generate Deep Profile"}
                                </button>
                            </div>
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
                        <span>WhatsApp Number</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="tel"
                                placeholder="+1234567890"
                                className={styles.input}
                                value={profile.phoneNumber || ""}
                                onChange={(e) => {
                                    const newProfile = { ...profile, phoneNumber: e.target.value };
                                    setProfile(newProfile);
                                    localStorage.setItem("userProfile", JSON.stringify(newProfile));
                                }}
                            />
                            <button
                                className={styles.connectButton}
                                onClick={() => window.open(`https://wa.me/16696006540?text=Hi`, '_blank')}
                                title="Send test message to opt-in"
                            >
                                Test
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className={styles.cardHeader}>
                        <Activity className={styles.icon} />
                        <h2>Stress Relief Preferences</h2>
                    </div>

                    <div className={styles.settingRow}>
                        <span>Coping Style</span>
                        <select
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-400"
                            value={stressProfile.copingStyle}
                            onChange={(e) => {
                                const newProfile = { ...stressProfile, copingStyle: e.target.value as any };
                                setStressProfile(newProfile);
                                saveUserStressProfile(newProfile);
                            }}
                        >
                            <option value="cognitive">Cognitive (Thinking)</option>
                            <option value="somatic">Somatic (Body)</option>
                            <option value="creative">Creative (Expressive)</option>
                            <option value="structured">Structured (Planning)</option>
                        </select>
                    </div>

                    <div className={styles.settingRow}>
                        <span>Intensity Preference</span>
                        <select
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-400"
                            value={stressProfile.intensity}
                            onChange={(e) => {
                                const newProfile = { ...stressProfile, intensity: e.target.value as any };
                                setStressProfile(newProfile);
                                saveUserStressProfile(newProfile);
                            }}
                        >
                            <option value="low">Low (Gentle)</option>
                            <option value="medium">Medium (Balanced)</option>
                            <option value="high">High (Intense)</option>
                        </select>
                    </div>

                    <div className={styles.settingRow}>
                        <div className="flex flex-col w-full">
                            <span className="mb-2">Triggers (comma separated)</span>
                            <input
                                type="text"
                                placeholder="e.g. deadlines, public speaking, noise"
                                className={styles.input}
                                value={stressProfile.triggers.join(", ")}
                                onChange={(e) => {
                                    const triggers = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                                    const newProfile = { ...stressProfile, triggers };
                                    setStressProfile(newProfile);
                                    saveUserStressProfile(newProfile);
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
