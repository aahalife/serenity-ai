"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, Shield, Activity, Brain, Sparkles } from "lucide-react";
import { getUserStressProfile, saveUserStressProfile, StressProfile } from "@/lib/stress-relief/user-preferences";
import MeshBackground from "@/components/MeshBackground";
import { GradientCard } from "@/components/ui/gradient-card";
import styles from "./Profile.module.css";
import { useUser } from "@/context/UserContext";

export default function Profile() {
    const { profile, updateProfile, refreshDeepProfile, isLoading } = useUser();
    const [stressProfile, setStressProfile] = useState<StressProfile>({ triggers: [], copingStyle: 'cognitive', intensity: 'medium' });

    // Local state just for the generation spinner/error
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Load Stress Profile separately (as it's a distinct system for now, though could be merged later)
    useEffect(() => {
        const savedStressProfile = getUserStressProfile();
        setStressProfile(savedStressProfile);
    }, []);

    // Helper to format profile data
    const formatProfileValue = (value: any): string => {
        if (!value) return '';
        if (typeof value === 'string' || typeof value === 'number') return String(value);
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') {
            const meaningfulKeys = ['value', 'description', 'details', 'most_likely'];
            for (const key of meaningfulKeys) {
                if (value[key]) return formatProfileValue(value[key]);
            }
            return Object.values(value).filter(v => typeof v === 'string').join('; ');
        }
        return String(value);
    };

    const formatKeyName = (key: string): string => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const handleGenerateProfile = async () => {
        if (!profile) return;
        setIsGenerating(true);
        setGenerationError(null);
        try {
            console.log("Triggering profile inference...");
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
                    console.log("Inference successful", inferenceData.profile);
                    // Update Context (which handles syncing and local storage)
                    updateProfile(inferenceData.profile);
                } else {
                    setGenerationError("Analysis returned empty. Please check your details.");
                }
            } else {
                setGenerationError("Failed to generate profile.");
            }
        } catch (error) {
            console.error("Generation failed", error);
            setGenerationError("Network error.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return <div className={styles.loading}>Loading profile...</div>;

    // If no profile at all, show empty state or redirect (handled by Home usually)
    const currentProfile = profile || {};

    return (
        <div className={styles.container}>
            <MeshBackground />

            <header className={styles.header}>
                <h1 className={styles.title}>Your Profile</h1>
                <p className={styles.subtitle}>Manage your journey and preferences.</p>
            </header>

            <div className={styles.grid}>
                {/* Identity Card */}
                <GradientCard icon={<User size={24} />} className="col-span-1 min-h-[400px]">
                    <h2 className="text-2xl font-semibold text-white mb-6">Identity</h2>
                    <div className="space-y-4">
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Name</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={currentProfile.name || ""}
                                onChange={(e) => updateProfile({ ...currentProfile, name: e.target.value })}
                            />
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Age</span>
                            <input
                                type="number"
                                className={styles.input}
                                value={currentProfile.age || ""}
                                onChange={(e) => updateProfile({ ...currentProfile, age: e.target.value })}
                            />
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Gender</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={currentProfile.gender || ""}
                                onChange={(e) => updateProfile({ ...currentProfile, gender: e.target.value })}
                            />
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Location</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={typeof currentProfile.location === 'object' ? currentProfile.location.city : (currentProfile.location || "")}
                                onChange={(e) => updateProfile({ ...currentProfile, location: e.target.value })}
                            />
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Occupation</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={currentProfile.occupation || ""}
                                onChange={(e) => updateProfile({ ...currentProfile, occupation: e.target.value })}
                            />
                        </div>
                    </div>
                </GradientCard>

                {/* Integration Card */}
                <GradientCard icon={<Shield size={24} />} className="col-span-1 min-h-[400px]">
                    <h2 className="text-2xl font-semibold text-white mb-6">Integrations</h2>
                    <div className={styles.settingRow}>
                        <span>WhatsApp Number</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="tel"
                                placeholder="+1234567890"
                                className={styles.input}
                                value={currentProfile.phoneNumber || ""}
                                onChange={(e) => updateProfile({ ...currentProfile, phoneNumber: e.target.value })}
                            />
                            <button
                                className={styles.connectButton}
                                onClick={() => window.open(`https://wa.me/16696006540?text=Hi`, '_blank')}
                            >
                                Test
                            </button>
                        </div>
                    </div>
                </GradientCard>

                {/* Deep Profile Sections */}
                {/* Dynamically render these robustly */}
                {['professional_financial', 'psychological_social', 'lifestyle_preferences', 'health_wellness', 'future_aspirations', 'habits_behaviors'].map(sectionKey => {
                    const data = currentProfile[sectionKey];
                    if (!data) return null;

                    return (
                        <GradientCard key={sectionKey} icon={<Brain size={24} />} className="col-span-1">
                            <h2 className="text-xl font-semibold text-white mb-4">{formatKeyName(sectionKey)}</h2>
                            <div className="space-y-4">
                                {Object.entries(data).map(([k, v]) => {
                                    if (!v || k === 'confidence_notes') return null;
                                    const valStr = formatProfileValue(v);
                                    if (!valStr) return null;
                                    return (
                                        <div key={k} className="border-b border-white/10 pb-4 last:border-0">
                                            <span className="text-cyan-400 font-semibold text-sm block mb-1">{formatKeyName(k)}</span>
                                            <span className="text-white/90 text-sm leading-relaxed">{valStr}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </GradientCard>
                    );
                })}

                {/* Controls */}
                <GradientCard icon={<Settings size={24} />} className="col-span-1 md:col-span-2">
                    <div className="flex flex-col items-center justify-center text-center py-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Deep Profile Controls</h2>
                        {generationError && (
                            <p className="text-red-400 text-sm mb-3 bg-red-500/10 px-3 py-2 rounded">{generationError}</p>
                        )}
                        <button
                            className="px-6 py-3 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50 glass-btn"
                            onClick={handleGenerateProfile}
                            disabled={isGenerating}
                        >
                            {isGenerating ? "Analyzing..." : "Refresh Deep Profile Analysis"}
                        </button>
                        <p className="text-white/40 text-xs mt-2">Update your analysis with the latest profile data</p>
                    </div>
                </GradientCard>

                {/* Stress Relief (Separate System for now) */}
                <GradientCard icon={<Activity size={24} />} className="col-span-1 md:col-span-2">
                    <h2 className="text-2xl font-semibold text-white mb-6">Stress Relief Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={styles.settingRow}>
                            <span>Coping Style</span>
                            <select
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
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
                            <span>Intensity</span>
                            <select
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                value={stressProfile.intensity}
                                onChange={(e) => {
                                    const newProfile = { ...stressProfile, intensity: e.target.value as any };
                                    setStressProfile(newProfile);
                                    saveUserStressProfile(newProfile);
                                }}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                </GradientCard>
            </div>
        </div>
    );
}
