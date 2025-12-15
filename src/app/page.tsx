"use client";

import { useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function Home() {
    const { profile, isLoading, isAuthenticated } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            // If logged in but no profile data (specifically missing key fields like age/name), redirect to onboarding
            // But if we have even a partial profile from sync, let them through to Dashboard
            const hasBasicProfile = profile && (profile.age || profile.location || profile.occupation);

            if (isAuthenticated && !hasBasicProfile) {
                // Double check local storage just in case context sync missed it briefly (redundancy)
                const localProfile = localStorage.getItem("userProfile");
                if (!localProfile) {
                    router.push("/onboarding");
                }
            }
            // If not authenticated, we let them stay (Dashboard might have limited view or trigger sidebar login)
            // Or force login? Usually Dashboard is fine as a landing, sidebar prompts login.
        }
    }, [isLoading, isAuthenticated, profile, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
                <div className="text-white/50 animate-pulse">Loading Serenity AI...</div>
            </div>
        );
    }

    return (
        <main>
            <Dashboard />
        </main>
    );
}
