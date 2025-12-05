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

    useEffect(() => {
        setIsMounted(true);
        // Move all localStorage logic inside useEffect to avoid hydration mismatch
        const loadProfile = async () => {
            try {
                const savedUserProfile = localStorage.getItem("userProfile");
                const savedDeepProfile = localStorage.getItem("deepProfile");
                const savedStressProfile = getUserStressProfile();
                setStressProfile(savedStressProfile);

                let currentProfile = {};

                if (savedUserProfile) {
                    const basic = JSON.parse(savedUserProfile);
                    currentProfile = { ...basic };
                } else {
                    currentProfile = { name: "User" };
                }

                // Try to fetch latest deep profile from API
                try {
                    const res = await fetch('/api/chat/details');
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.user_profile) {
                            // Merge and save
                            const deepData = typeof data.user_profile === 'string'
                                ? JSON.parse(data.user_profile)
                                : data.user_profile;

                            localStorage.setItem("deepProfile", JSON.stringify(deepData));

                            currentProfile = {
                                ...currentProfile,
                                ...deepData,
                                deepProfileText: typeof data.user_profile === 'string' ? data.user_profile : JSON.stringify(data.user_profile, null, 2),
                                ocean: deepData.traits || deepData.ocean || {}
                            };
                        }
                    }
                } catch (err) {
                    console.warn("Failed to fetch latest deep profile", err);
                }

                // Fallback to local storage if API didn't return new data or failed
                if (!currentProfile.hasOwnProperty('ocean') && savedDeepProfile) {
                    let deep = {};
                    let deepText = "";
                    try {
                        deep = JSON.parse(savedDeepProfile);
                        if (typeof deep === 'string') {
                            deepText = deep;
                            deep = {};
                        }
                    } catch (e) {
                        deepText = savedDeepProfile;
                    }
                    currentProfile = {
                        ...currentProfile,
                        ...deep,
                        deepProfileText: deepText,
                        ocean: (deep as any).traits || (deep as any).ocean || {}
                    };
                }

                setProfile(currentProfile);

            } catch (e) {
                console.error("Failed to load profile data", e);
                setProfile({ name: "User", ocean: {} });
            }
        };

        loadProfile();
    }, []);

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
                        <span className={styles.label}>Birthday</span>
                        <input
                            type="date"
                            className={styles.input}
                            value={profile.birthday || ""}
                            onChange={(e) => {
                                const newProfile = { ...profile, birthday: e.target.value };
                                setProfile(newProfile);
                                localStorage.setItem("userProfile", JSON.stringify(newProfile));
                            }}
                        />
                    </div>
                    {profile.birthday && (
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Zodiac</span>
                            <div className="flex items-center gap-2 text-white/80">
                                {(() => {
                                    const { getZodiacSign } = require('@/utils/zodiac');
                                    const z = getZodiacSign(profile.birthday);
                                    return <span className="font-bold text-purple-300">{z.symbol} {z.name}</span>;
                                })()}
                            </div>
                        </div>
                    )}
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
                            value={profile.location || ""}
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
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Family</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={profile.family || ""}
                            onChange={(e) => {
                                const newProfile = { ...profile, family: e.target.value };
                                setProfile(newProfile);
                                localStorage.setItem("userProfile", JSON.stringify(newProfile));
                            }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <div className={styles.cardHeader}>
                        <div className="p-2 rounded-full bg-purple-500/20 text-purple-300">
                            <User className={styles.icon} />
                        </div>
                        <h2>Family Circle</h2>
                    </div>

                    <div className={styles.infoRow}>
                        <span className={styles.label}>Family Code</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="bg-white/10 px-3 py-1 rounded text-sm font-mono text-blue-300 border border-white/10 focus:outline-none focus:border-blue-400 w-32"
                                value={profile.familyCode || ""}
                                placeholder="Enter Code"
                                onChange={(e) => {
                                    const newProfile = { ...profile, familyCode: e.target.value.toUpperCase() };
                                    setProfile(newProfile);
                                    localStorage.setItem("userProfile", JSON.stringify(newProfile));
                                }}
                            />
                            <span className="text-xs text-white/40">(Share this)</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-white/80 mb-3">Members</h3>
                        <div className="space-y-3">
                            {/* Current User */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 text-xs font-bold">
                                    You
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{profile.name || "You"}</p>
                                    <p className="text-xs text-white/50">{profile.family || "Member"}</p>
                                </div>
                            </div>

                            {/* Mock Family Members (only if family code is set/simulated) */}
                            {profile.familyCode && (
                                <>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-bold">
                                            JS
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Jane Smith</p>
                                            <p className="text-xs text-white/50">Wife • Deep Profile: Conscientious</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-300 text-xs font-bold">
                                            TS
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Timmy Smith</p>
                                            <p className="text-xs text-white/50">Son • Deep Profile: Energetic</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!profile.familyCode && (
                                <p className="text-xs text-white/40 italic">Register others with your code to see them here.</p>
                            )}
                        </div>
                    </div>
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
                        {profile.ocean && typeof profile.ocean === 'object' && Object.entries(profile.ocean).length > 0 ? (
                            <>
                                {Object.entries(profile.ocean).map(([trait, score]: [string, any]) => (
                                    <div key={trait} className={styles.trait}>
                                        <span className={styles.traitName}>{trait}</span>
                                        <div className={styles.traitBar}>
                                            <div
                                                className={styles.traitFill}
                                                style={{ width: `${(typeof score === 'number' ? score : 0.5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {/* Display Goal if available */}
                                {profile.behaviour_change && profile.behaviour_change.goals && (
                                    <div className="col-span-2 mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <h4 className="text-sm font-bold text-blue-300 mb-1">Current Goal</h4>
                                        <p className="text-sm text-white/90">
                                            {Array.isArray(profile.behaviour_change.goals)
                                                ? profile.behaviour_change.goals.join(", ")
                                                : profile.behaviour_change.goals}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : profile.deepProfileText ? (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                                {profile.deepProfileText}
                            </div>
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
                            onClick={() => window.location.href = "/api/integrations/auth?appName=google-people"}
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
