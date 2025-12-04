"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Heart, Flower2, Globe, CircleDot } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamic imports for components that use browser APIs
const FaceTracker = dynamic(() => import('@/components/cool-breathing/FaceTracker'), { ssr: false });
const BreathingCanvas = dynamic(() => import('@/components/cool-breathing/BreathingCanvas'), { ssr: false });
const BreathingAudioDetector = dynamic(() => import('@/components/cool-breathing/BreathingAudioDetector'), { ssr: false });

export default function CoolBreathingPage() {
    const [breathValue, setBreathValue] = useState(0);
    const [faceBreathValue, setFaceBreathValue] = useState(0);
    const [audioBreathValue, setAudioBreathValue] = useState(0);

    const [shape, setShape] = useState<'sphere' | 'heart' | 'flower' | 'saturn'>('sphere');
    const [color, setColor] = useState('#4f46e5');
    const [isMuted, setIsMuted] = useState(false);

    const [isFaceEnabled, setIsFaceEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Combine breath values from both sources
    useEffect(() => {
        // Take the max of both detection methods
        const combined = Math.max(faceBreathValue, audioBreathValue);
        setBreathValue(combined);
    }, [faceBreathValue, audioBreathValue]);

    // Audio playback
    useEffect(() => {
        audioRef.current = new Audio('/audio/coolBreathe2.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                setIsMuted(true);
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
        { id: 'flower', icon: Flower2, label: 'Flower' },
        { id: 'saturn', icon: CircleDot, label: 'Saturn' },
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

            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-6 md:p-8">

                {/* Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="max-w-[60%] sm:max-w-none">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-montage tracking-wider">
                            Cool Breathing
                        </h1>
                        <p className="text-white/60 text-xs sm:text-sm mt-1 hidden sm:block">
                            Inhale to expand. Exhale to contract.
                        </p>
                    </div>

                    {/* Audio Control */}
                    <button
                        onClick={toggleMute}
                        className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>

                {/* Detection Controls - Top Right Area */}
                <div className="absolute top-16 sm:top-20 right-4 sm:right-6 md:right-8 pointer-events-auto flex flex-col gap-3">
                    <FaceTracker
                        onBreathChange={setFaceBreathValue}
                        isEnabled={isFaceEnabled}
                        onToggle={() => setIsFaceEnabled(!isFaceEnabled)}
                    />
                    <BreathingAudioDetector
                        onBreathChange={setAudioBreathValue}
                        isEnabled={isAudioEnabled}
                        onToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                    />
                </div>

                {/* Controls - Bottom */}
                <div className="pointer-events-auto flex flex-col gap-4 sm:gap-6 items-center mb-4 sm:mb-8">

                    {/* Instructions when no detection enabled */}
                    {!isFaceEnabled && !isAudioEnabled && (
                        <div className="text-white/60 text-xs sm:text-sm text-center px-4 py-2 bg-black/30 rounded-lg backdrop-blur-md">
                            Enable camera or mic (top right) to control with your breath
                        </div>
                    )}

                    {/* Shape Selector */}
                    <div className="flex gap-2 sm:gap-4 bg-black/30 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/10">
                        {shapes.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setShape(s.id as any)}
                                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all flex flex-col items-center gap-0.5 sm:gap-1 min-w-[50px] sm:min-w-[70px] ${shape === s.id
                                        ? 'bg-white/20 text-white shadow-lg scale-105'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <s.icon size={18} className="sm:w-5 sm:h-5" />
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">{s.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Color Selector */}
                    <div className="flex gap-2 sm:gap-3 bg-black/30 backdrop-blur-md p-2 sm:p-3 rounded-full border border-white/10">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all border-2 ${color === c
                                        ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                                        : 'border-transparent hover:scale-105'
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Breath Indicator */}
            <div className="absolute bottom-20 sm:bottom-8 right-4 sm:right-8 z-10 pointer-events-none">
                <div className="w-2 h-24 sm:h-32 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                    <motion.div
                        className="w-full bg-white/80 bottom-0 absolute rounded-full"
                        animate={{ height: `${breathValue * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>
                <p className="text-white/40 text-[8px] sm:text-[10px] text-center mt-1">Breath</p>
            </div>
        </div>
    );
}
