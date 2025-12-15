"use client";

import React from "react";
import { motion } from "framer-motion";
import ProactiveList from "@/components/home-ai/ProactiveList";
import OrchestratorChat from "@/components/home-ai/OrchestratorChat";

export default function HomeAIPage() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-foreground">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 opacity-40">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/assets/videos/aurora.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 backdrop-blur-[2px]" />
            </div>

            {/* Content Grid */}
            <div className="relative z-10 w-full h-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-20">
                {/* Left Column: Proactive List & Status */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 h-full flex flex-col gap-6"
                >
                    <div className="flex-1 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <ProactiveList />
                    </div>

                    {/* Agent Status Cards (Placeholder) */}
                    <div className="h-1/3 grid grid-cols-2 gap-4">
                        {['Bursar', 'Facility', 'Archivist', 'Coordinator'].map((agent) => (
                            <div key={agent} className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4 flex flex-col justify-center items-center hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mb-2 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-shadow" />
                                <span className="text-sm font-medium text-foreground/80">{agent}</span>
                                <span className="text-xs text-foreground/40">Active</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Column: Orchestrator Chat */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 h-full"
                >
                    <OrchestratorChat />
                </motion.div>
            </div>
        </div>
    );
}
