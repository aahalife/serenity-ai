"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Heart, Flower2, Globe, CircleDot, X, Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    useEffect(() => {
        const combined = Math.max(faceBreathValue, audioBreathValue);
        setBreathValue(combined);
    }, [faceBreathValue, audioBreathValue]);

    useEffect(() => {
        audioRef.current = new Audio('/audio/coolBreathe2.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => setIsMuted(true));
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
        { id: 'sphere', icon: Globe },
        { id: 'heart', icon: Heart },
        { id: 'flower', icon: Flower2 },
        { id: 'saturn', icon: CircleDot },
    ];

    const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
            {/* Full-screen 3D Canvas */}
            <BreathingCanvas breathValue={breathValue} shape={shape} color={color} />

            {/* Dark overlay for readability */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent 40%, rgba(0,0,0,0.4))', pointerEvents: 'none', zIndex: 1 }} />

            {/* Top Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
                {/* Close Button */}
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                    <X size={20} />
                </button>

                {/* Title - Centered */}
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0, fontFamily: 'var(--font-montage)' }}>Cool Breathing</h1>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0' }}>Inhale to expand • Exhale to contract</p>
                </div>

                {/* Audio Button */}
                <button
                    onClick={toggleMute}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Detection Controls - Floating Right */}
            <div style={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 10 }}>
                {/* Camera Toggle */}
                <button
                    onClick={() => setIsFaceEnabled(!isFaceEnabled)}
                    style={{
                        width: 50, height: 50, borderRadius: 12,
                        background: isFaceEnabled ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${isFaceEnabled ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: isFaceEnabled ? '#93c5fd' : 'rgba(255,255,255,0.6)'
                    }}
                >
                    {isFaceEnabled ? <Camera size={22} /> : <CameraOff size={22} />}
                </button>

                {/* Mic Toggle */}
                <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    style={{
                        width: 50, height: 50, borderRadius: 12,
                        background: isAudioEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${isAudioEnabled ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: isAudioEnabled ? '#86efac' : 'rgba(255,255,255,0.6)'
                    }}
                >
                    {isAudioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
                </button>

                {/* Breath Meter */}
                <div style={{ width: 50, height: 100, borderRadius: 12, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ flex: 1, width: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                        <motion.div
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, #3b82f6, #22d3ee)', borderRadius: 3 }}
                            animate={{ height: `${breathValue * 100}%` }}
                        />
                    </div>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Breath</span>
                </div>
            </div>

            {/* Camera Preview - Top Right when enabled */}
            <AnimatePresence>
                {isFaceEnabled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ position: 'absolute', top: 70, right: 16, zIndex: 10 }}
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
                <div style={{ display: 'none' }}>
                    <BreathingAudioDetector
                        onBreathChange={setAudioBreathValue}
                        isEnabled={isAudioEnabled}
                        onToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                    />
                </div>
            )}

            {/* Bottom Controls */}
            <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 10 }}>
                {/* Instructions */}
                {!isFaceEnabled && !isAudioEnabled && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '8px 16px', background: 'rgba(0,0,0,0.4)', borderRadius: 12, backdropFilter: 'blur(8px)' }}>
                        Tap camera or mic to control with your breath
                    </div>
                )}

                {/* Shape Selector */}
                <div style={{ display: 'flex', gap: 8, padding: 8, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                    {shapes.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setShape(s.id as any)}
                            style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: shape === s.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                                border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                color: shape === s.id ? 'white' : 'rgba(255,255,255,0.5)',
                                transform: shape === s.id ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <s.icon size={24} />
                        </button>
                    ))}
                </div>

                {/* Color Selector */}
                <div style={{ display: 'flex', gap: 10, padding: 10, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: c,
                                border: color === c ? '2px solid white' : '2px solid transparent',
                                boxShadow: color === c ? '0 0 15px rgba(255,255,255,0.4)' : 'none',
                                cursor: 'pointer',
                                transform: color === c ? 'scale(1.15)' : 'scale(1)',
                                transition: 'all 0.2s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
