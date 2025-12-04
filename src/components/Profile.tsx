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
        const loadProfile = () => {
            try {
                const savedUserProfile = localStorage.getItem("userProfile");
                const savedDeepProfile = localStorage.getItem("deepProfile");
                const savedStressProfile = getUserStressProfile();
                setStressProfile(savedStressProfile);

                if (savedUserProfile) {
                    const basic = JSON.parse(savedUserProfile);
                    let deep = {};
                    let deepText = "";

                    if (savedDeepProfile) {
                        try {
                            deep = JSON.parse(savedDeepProfile);
                            // If it's a string wrapped in quotes from JSON.stringify
                            if (typeof deep === 'string') {
                                deepText = deep;
                                deep = {};
                            }
                        } catch (e) {
                            // It's a raw string
                            deepText = savedDeepProfile;
                        }
                    }

                    setProfile({
                        ...basic,
                        ...deep,
                        deepProfileText: deepText,
                        ocean: (deep as any).traits || (deep as any).ocean || {} // Handle both formats
                    });
                } else {
                    // Set default empty profile if nothing found
                    setProfile({ name: "User", ocean: {} });
                }
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
                            <code className="bg-white/10 px-3 py-1 rounded text-sm font-mono text-blue-300">
                                {profile.familyCode || "FAM-" + Math.random().toString(36).substr(2, 6).toUpperCase()}
                            </code>
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
