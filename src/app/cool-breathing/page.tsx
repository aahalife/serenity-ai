"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Heart, Flower2, Globe, CircleDot, X, Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        { hex: '#4f46e5', name: 'Indigo' },
        { hex: '#ec4899', name: 'Pink' },
        { hex: '#10b981', name: 'Emerald' },
        { hex: '#f59e0b', name: 'Amber' },
        { hex: '#ef4444', name: 'Red' },
        { hex: '#8b5cf6', name: 'Violet' },
    ];

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Full-screen 3D Canvas Background */}
            <div className="absolute inset-0 z-0">
                <BreathingCanvas breathValue={breathValue} shape={shape} color={color} />
            </div>

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

            {/* Close Button */}
            <button
                onClick={() => window.location.href = '/'}
                className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
                <X size={20} className="text-white" />
            </button>

            {/* Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-montage tracking-wider drop-shadow-2xl"
                >
                    Cool Breathing
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/60 text-sm sm:text-base mt-2"
                >
                    Inhale to expand • Exhale to contract
                </motion.p>
            </div>

            {/* Audio Control - Top Right */}
            <button
                onClick={toggleMute}
                className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
                {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
            </button>

            {/* Detection Controls Panel - Right Side */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 right-6 z-20 flex flex-col gap-4"
            >
                {/* Camera Toggle */}
                <div className="lg-wrap">
                    <div className="lg-shadow" />
                    <div className="lg-content">
                        <div className="lg-inner !p-3">
                            <button
                                onClick={() => setIsFaceEnabled(!isFaceEnabled)}
                                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isFaceEnabled
                                        ? 'bg-blue-500/30 text-blue-300'
                                        : 'bg-white/5 text-white/60 hover:text-white'
                                    }`}
                                title={isFaceEnabled ? 'Disable Camera' : 'Enable Camera'}
                            >
                                {isFaceEnabled ? <Camera size={24} /> : <CameraOff size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mic Toggle */}
                <div className="lg-wrap">
                    <div className="lg-shadow" />
                    <div className="lg-content">
                        <div className="lg-inner !p-3">
                            <button
                                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isAudioEnabled
                                        ? 'bg-green-500/30 text-green-300'
                                        : 'bg-white/5 text-white/60 hover:text-white'
                                    }`}
                                title={isAudioEnabled ? 'Disable Mic' : 'Enable Mic'}
                            >
                                {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Breath Indicator */}
                <div className="lg-wrap">
                    <div className="lg-shadow" />
                    <div className="lg-content">
                        <div className="lg-inner !p-3 flex flex-col items-center gap-2">
                            <div className="w-3 h-24 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                                    style={{ originY: 1 }}
                                    animate={{ height: `${breathValue * 100}%` }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            </div>
                            <span className="text-white/40 text-[10px] uppercase tracking-wider">Breath</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Camera Preview - Shows when face tracking enabled */}
            <AnimatePresence>
                {isFaceEnabled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-24 right-6 z-20"
                    >
                        <FaceTracker
                            onBreathChange={setFaceBreathValue}
                            isEnabled={isFaceEnabled}
                            onToggle={() => setIsFaceEnabled(!isFaceEnabled)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Audio Detector - Hidden but active */}
            {isAudioEnabled && (
                <div className="hidden">
                    <BreathingAudioDetector
                        onBreathChange={setAudioBreathValue}
                        isEnabled={isAudioEnabled}
                        onToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                    />
                </div>
            )}

            {/* Bottom Controls */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-6"
            >
                {/* Instructions when no detection enabled */}
                <AnimatePresence>
                    {!isFaceEnabled && !isAudioEnabled && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-white/60 text-sm text-center px-6 py-3 bg-black/30 rounded-2xl backdrop-blur-xl border border-white/10"
                        >
                            Enable camera or mic to control the animation with your breath
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shape Selector - Liquid Glass Style */}
                <div className="lg-wrap">
                    <div className="lg-shadow" />
                    <div className="lg-content">
                        <div className="lg-inner !p-2 flex gap-2">
                            {shapes.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setShape(s.id as any)}
                                    className={`px-4 py-3 sm:px-6 sm:py-4 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[70px] sm:min-w-[90px] ${shape === s.id
                                            ? 'bg-white/20 text-white shadow-lg scale-105'
                                            : 'text-white/50 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <s.icon size={24} className="sm:w-7 sm:h-7" />
                                    <span className="text-[10px] sm:text-xs uppercase tracking-wider font-medium">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Color Selector - Liquid Glass Style */}
                <div className="lg-wrap">
                    <div className="lg-shadow" />
                    <div className="lg-content">
                        <div className="lg-inner !p-3 flex gap-3 sm:gap-4">
                            {colors.map((c) => (
                                <button
                                    key={c.hex}
                                    onClick={() => setColor(c.hex)}
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all border-2 ${color === c.hex
                                            ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                                            : 'border-white/20 hover:scale-105 hover:border-white/40'
                                        }`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
