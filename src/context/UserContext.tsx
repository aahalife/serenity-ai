"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { supermemory } from "@/lib/supermemory";

// Define the shape of the user profile
// Using 'any' for now to be flexible with existing data shapes, will tighten later
interface UserProfile {
    name?: string;
    email?: string;
    age?: string | number;
    gender?: string;
    location?: string | any;
    occupation?: string;
    family?: string;
    phoneNumber?: string;
    // Deep profile fields
    professional_financial?: any;
    psychological_social?: any;
    lifestyle_preferences?: any;
    health_wellness?: any;
    future_aspirations?: any;
    habits_behaviors?: any;
    behaviour_change?: any;
    deepProfileText?: string;
    ocean?: any;
    [key: string]: any;
}

interface UserContextType {
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    updateProfile: (newProfile: UserProfile) => void;
    syncMemory: (content: string, metadata?: any) => Promise<any>;
    refreshDeepProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Initial Load & Sync Effect
    useEffect(() => {
        const initUser = async () => {
            if (status === "loading") return;

            if (status === "unauthenticated") {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            if (status === "authenticated" && session?.user) {
                // A. Try Local Storage first (Fastest)
                const savedLocal = localStorage.getItem("userProfile");
                const savedDeep = localStorage.getItem("deepProfile");

                let currentProfile: UserProfile = savedLocal ? JSON.parse(savedLocal) : {};
                if (savedDeep) {
                    const deepData = JSON.parse(savedDeep);
                    currentProfile = { ...currentProfile, ...deepData };
                }

                // Ensure basic session info is merged if missing
                if (!currentProfile.email && session.user.email) currentProfile.email = session.user.email;
                if (!currentProfile.name && session.user.name) currentProfile.name = session.user.name;

                // B. Sync with Backend (Source of Truth)
                try {
                    const res = await fetch('/api/chat/details');
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.user_profile) {
                            const remoteProfile = typeof data.user_profile === 'string'
                                ? JSON.parse(data.user_profile)
                                : data.user_profile;

                            // Merge Remote into Current (Remote takes precedence for analysis data)
                            if (Object.keys(remoteProfile).length > 0) {
                                currentProfile = { ...currentProfile, ...remoteProfile };

                                // Update Local Storage to match
                                localStorage.setItem("deepProfile", JSON.stringify(remoteProfile));
                            }
                        }
                    }
                } catch (err) {
                    console.warn("Failed to sync profile with backend:", err);
                }

                setProfile(currentProfile);
                setIsLoading(false);
            }
        };

        initUser();
    }, [status, session]);

    // 2. Update Profile Function (Exposed to consumers)
    const updateProfile = (newProfile: UserProfile) => {
        setProfile((prev) => {
            const updated = { ...prev, ...newProfile };
            // Persist to Local Storage
            localStorage.setItem("userProfile", JSON.stringify(updated));
            return updated;
        });
        // We could also auto-save to backend here via debouncing in the future
    };

    // 3. Memory Sync Adapter
    const syncMemory = async (content: string, metadata: any = {}) => {
        if (!profile) return null;

        // Enrich metadata with user context
        const enrichedMetadata = {
            ...metadata,
            user_id: session?.user?.email || "anonymous",
            timestamp: new Date().toISOString()
        };

        return await supermemory.add(content, enrichedMetadata);
    };

    // 4. Force specific deep profile refresh
    const refreshDeepProfile = async () => {
        try {
            const res = await fetch('/api/chat/details');
            if (res.ok) {
                const data = await res.json();
                if (data && data.user_profile) {
                    const remoteProfile = typeof data.user_profile === 'string'
                        ? JSON.parse(data.user_profile)
                        : data.user_profile;

                    setProfile(prev => ({ ...prev, ...remoteProfile }));
                    localStorage.setItem("deepProfile", JSON.stringify(remoteProfile));
                }
            }
        } catch (error) {
            console.error("Deep profile refresh failed", error);
        }
    };

    return (
        <UserContext.Provider value={{
            profile,
            isLoading,
            isAuthenticated: status === "authenticated",
            updateProfile,
            syncMemory,
            refreshDeepProfile
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
