"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import { useRouter } from "next/navigation";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userProfile = localStorage.getItem("userProfile");
        if (!userProfile) {
            router.push("/onboarding");
        } else {
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <main>
            <Dashboard />
        </main>
    );
}
