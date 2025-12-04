"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Heart, Flower, Globe, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamic imports for components that use browser APIs
const FaceTracker = dynamic(() => import('@/components/cool-breathing/FaceTracker'), { ssr: false });
const BreathingCanvas = dynamic(() => import('@/components/cool-breathing/BreathingCanvas'), { ssr: false });

export default function CoolBreathingPage() {
    const [breathValue, setBreathValue] = useState(0);
    const [shape, setShape] = useState<'sphere' | 'heart' | 'flower' | 'saturn'>('sphere');
    const [color, setColor] = useState('#4f46e5'); // Indigo default
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/audio/coolBreathe2.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        // Try to play automatically (might be blocked by browser)
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play prevented:", error);
                setIsMuted(true); // Default to muted if autoplay fails
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.play();
                audioRef.current.muted = false;
            } else {
                audioRef.current.muted = true;
            }
            setIsMuted(!isMuted);
        }
    };

    const shapes = [
        { id: 'sphere', icon: Globe, label: 'Sphere' },
        { id: 'heart', icon: Heart, label: 'Heart' },
        { id: 'flower', icon: Flower, label: 'Flower' },
        { id: 'saturn', icon: Disc, label: 'Saturn' },
    ];

    const colors = [
        '#4f46e5', // Indigo
        '#ec4899', // Pink
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Violet
    ];

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* 3D Canvas */}
            <div className="absolute inset-0 z-0">
                <BreathingCanvas breathValue={breathValue} shape={shape} color={color} />
            </div>

            {/* Face Tracker (Hidden/Small) */}
            <FaceTracker onBreathChange={setBreathValue} />

            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">

                {/* Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div>
                        <h1 className="text-4xl font-bold text-white font-montage tracking-wider">Cool Breathing</h1>
                        <p className="text-white/60 text-sm mt-1">Inhale to expand. Exhale to contract.</p>
                    </div>
                    <button
                        onClick={toggleMute}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white"
                    >
                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                </div>

                {/* Controls */}
                <div className="pointer-events-auto flex flex-col gap-6 items-center mb-8">

                    {/* Shape Selector */}
                    <div className="flex gap-4 bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                        {shapes.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setShape(s.id as any)}
                                className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[70px] ${shape === s.id ? 'bg-white/20 text-white shadow-lg scale-105' : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <s.icon size={20} />
                                <span className="text-[10px] uppercase tracking-wider font-bold">{s.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Color Selector */}
                    <div className="flex gap-3 bg-black/30 backdrop-blur-md p-3 rounded-full border border-white/10">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full transition-all border-2 ${color === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-105'
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Breath Indicator (Debug/Visual Feedback) */}
            <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
                <div className="w-2 h-32 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                    <motion.div
                        className="w-full bg-white/80 bottom-0 absolute"
                        style={{ height: `${breathValue * 100}%` }}
                        animate={{ height: `${breathValue * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>
        </div>
    );
}
