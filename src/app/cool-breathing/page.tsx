"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Heart, Flower2, Globe, CircleDot, X, Camera, CameraOff, Mic, MicOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getZodiacSign } from '@/utils/zodiac';

const FaceTracker = dynamic(() => import('@/components/cool-breathing/FaceTracker'), { ssr: false });
const BreathingCanvas = dynamic(() => import('@/components/cool-breathing/BreathingCanvas'), { ssr: false });
const BreathingAudioDetector = dynamic(() => import('@/components/cool-breathing/BreathingAudioDetector'), { ssr: false });

type BreathingState = 'intro' | 'inhale' | 'hold' | 'exhale' | 'completed';
type ShapeType = 'sphere' | 'heart' | 'flower' | 'saturn' | 'zodiac';

export default function CoolBreathingPage() {
    const [breathValue, setBreathValue] = useState(0);
    const [faceBreathValue, setFaceBreathValue] = useState(0);
    const [audioBreathValue, setAudioBreathValue] = useState(0);

    const [shape, setShape] = useState<ShapeType>('sphere');
    const [color, setColor] = useState('#4f46e5');
    const [isMuted, setIsMuted] = useState(false);

    const [isFaceEnabled, setIsFaceEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    const [zodiac, setZodiac] = useState<{ name: string; symbol: string } | null>(null);
    const [breathingState, setBreathingState] = useState<BreathingState>('intro');
    const [instruction, setInstruction] = useState("Tap camera or mic to start");
    const [repCount, setRepCount] = useState(0);
    const [holdDuration, setHoldDuration] = useState(5); // 5s then 10s

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load User Profile & Zodiac
    useEffect(() => {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            if (profile.birthday) {
                const z = getZodiacSign(profile.birthday);
                setZodiac(z);
                setShape('zodiac'); // Default to zodiac
            }
        }
    }, []);

    // Sensor Fusion Logic
    useEffect(() => {
        // Heuristic:
        // Exhale (Contract): Mouth Open (high face val) OR High Audio Volume
        // Inhale (Expand): Mouth Closed (low face val) AND Audio Volume Present (but not too loud?)
        // Actually, user said: "mouth closed ... and breathe value in mic increases -> inhaling"

        // Let's simplify:
        // Face Value (0-1): 0 = Closed, 1 = Open
        // Audio Value (0-1): Volume

        let calculatedBreath = 0;

        if (isFaceEnabled && isAudioEnabled) {
            // Combined Logic
            const isMouthOpen = faceBreathValue > 0.3;
            const isNoisy = audioBreathValue > 0.1;

            if (isMouthOpen) {
                // Exhaling (Contracting) -> Breath Value goes to 0? 
                // Wait, typically "Expand" = Inhale (Lungs fill), "Contract" = Exhale (Lungs empty).
                // So Inhale -> 1, Exhale -> 0.

                // If mouth is open, we assume exhaling -> target 0.
                // But we want smooth control.
                // Let's map mouth openness to contraction.
                // Open (1) -> 0 (Empty lungs)
                // Closed (0) -> 1 (Full lungs)? No, closed mouth doesn't mean full lungs.

                // User Logic:
                // "Mouth open... means exhaling... animation contract" -> Target 0
                // "Mouth closed... mic increase... means inhaling... animation expand" -> Target 1

                if (isMouthOpen) {
                    // Exhale mode
                    // The wider the mouth/louder the sound, the more we contract (towards 0)
                    // Let's say current state is X. We want to go to 0.
                    calculatedBreath = Math.max(0, 1 - Math.max(faceBreathValue, audioBreathValue));
                } else {
                    // Inhale mode (Mouth closed)
                    // The louder the nose breathing, the more we expand (towards 1)
                    calculatedBreath = Math.min(1, audioBreathValue * 3); // Amplify nose breathing
                }
            } else if (isFaceEnabled) {
                // Only Face
                // Open -> Exhale (0), Closed -> Inhale (1)? 
                // Hard to track inhale with just face.
                // Let's invert: Open = 0, Closed = 1 (Default full?)
                calculatedBreath = 1 - faceBreathValue;
            } else if (isAudioEnabled) {
                // Only Audio
                // Loud = Exhale (0)? Or Loud = Inhale (1)?
                // Usually "blowing" into mic is exhale.
                // So Loud = 0. Quiet = 1?
                // This is ambiguous. Let's stick to: Loud = Active Breath.
                // Let's assume Audio = Expansion (Inhale) for visualization fun if only audio.
                calculatedBreath = audioBreathValue;
            }
        } else {
            // No sensors, auto-breathe or manual
            // For now, just 0 if disabled
            calculatedBreath = 0;
        }

        // State Machine Progression
        // We only progress if user MATCHES the target state
        if (breathingState !== 'intro' && breathingState !== 'completed') {
            checkProgress(calculatedBreath);
        }

        setBreathValue(calculatedBreath);
    }, [faceBreathValue, audioBreathValue, isFaceEnabled, isAudioEnabled, breathingState]);

    const stateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressRef = useRef(0); // 0 to 100% completion of current step

    const checkProgress = (currentBreath: number) => {
        // Thresholds
        const INHALE_TARGET = 0.8; // Must reach 80% expansion
        const EXHALE_TARGET = 0.2; // Must reach 20% contraction (0.2 or less)

        // We accumulate progress if user is in correct zone
        const stepSize = 2; // Speed of progress

        if (breathingState === 'inhale') {
            if (currentBreath > 0.5) {
                progressRef.current = Math.min(100, progressRef.current + stepSize);
            }
        } else if (breathingState === 'exhale') {
            if (currentBreath < 0.5) {
                progressRef.current = Math.min(100, progressRef.current + stepSize);
            }
        } else if (breathingState === 'hold') {
            // Hold breath (either full or empty? Usually full after inhale)
            // Let's assume hold after inhale -> High breath value
            if (currentBreath > 0.5) {
                progressRef.current = Math.min(100, progressRef.current + (stepSize * (100 / (holdDuration * 60)))); // Approx based on frame rate? 
                // Actually this is called on render/sensor update which is fast.
                // Better to use time.
            }
        }

        // Logic handled in the interval below instead for reliability
    };

    // Main Game Loop for Breathing State
    useEffect(() => {
        if (breathingState === 'intro' || breathingState === 'completed') return;

        const interval = setInterval(() => {
            // Check if we can move to next state
            // We need "Sensor Confirmation"
            // For simplicity in this version, we'll use a mix of Timer + Sensor Gating
            // i.e. Timer doesn't advance unless sensor value is roughly correct

            let isUserComplying = false;
            if (!isFaceEnabled && !isAudioEnabled) {
                isUserComplying = true; // Auto-mode if sensors off
            } else {
                if (breathingState === 'inhale') isUserComplying = breathValue > 0.2; // Growing
                if (breathingState === 'exhale') isUserComplying = breathValue < 0.8; // Shrinking
                if (breathingState === 'hold') isUserComplying = true; // Hard to validate hold, assume yes
            }

            if (isUserComplying) {
                progressRef.current += 1; // 1% per 50ms = 5 seconds total roughly
            }

            if (progressRef.current >= 100) {
                // Next State
                progressRef.current = 0;

                if (breathingState === 'inhale') {
                    setBreathingState('hold');
                    setInstruction(`Hold for ${holdDuration}s`);
                } else if (breathingState === 'hold') {
                    setBreathingState('exhale');
                    setInstruction("Exhale slowly...");
                } else if (breathingState === 'exhale') {
                    // End of Rep
                    if (repCount < 2) { // 3 reps total (0, 1, 2)
                        setRepCount(prev => prev + 1);
                        setBreathingState('inhale');
                        setInstruction("Inhale deeply...");
                    } else {
                        // Finished set
                        if (holdDuration === 5) {
                            // Move to Level 2
                            setHoldDuration(10);
                            setRepCount(0);
                            setBreathingState('inhale');
                            setInstruction("Level 2: Inhale...");
                        } else {
                            // Done
                            setBreathingState('completed');
                            setInstruction("Session Complete. Well done!");
                        }
                    }
                }
            }
        }, 50);

        return () => clearInterval(interval);
    }, [breathingState, breathValue, isFaceEnabled, isAudioEnabled, repCount, holdDuration]);

    const startSession = () => {
        if (!isFaceEnabled && !isAudioEnabled) {
            alert("Please enable camera or microphone for the interactive experience.");
            return;
        }
        setBreathingState('inhale');
        setInstruction("Inhale deeply...");
        setRepCount(0);
        progressRef.current = 0;
    };

    // Audio playback
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
        ...(zodiac ? [{ id: 'zodiac', icon: Sparkles, label: zodiac.symbol }] : []),
        { id: 'sphere', icon: Globe, label: 'Sphere' },
        { id: 'heart', icon: Heart, label: 'Heart' },
        { id: 'flower', icon: Flower2, label: 'Flower' },
        { id: 'saturn', icon: CircleDot, label: 'Saturn' },
    ];

    const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
            {/* Full-screen 3D Canvas */}
            <BreathingCanvas
                breathValue={breathValue}
                shape={shape as any}
                color={color}
                zodiacSymbol={zodiac?.symbol}
            />

            {/* Dark overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent 40%, rgba(0,0,0,0.4))', pointerEvents: 'none', zIndex: 1 }} />

            {/* Top Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                    <X size={20} />
                </button>

                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '100%', pointerEvents: 'none' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0, fontFamily: 'var(--font-montage)' }}>Cool Breathing</h1>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0', fontWeight: 500 }}>
                        {instruction}
                    </p>
                    {breathingState !== 'intro' && breathingState !== 'completed' && (
                        <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.2)', margin: '8px auto', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                                style={{ height: '100%', background: '#4f46e5' }}
                                animate={{ width: `${progressRef.current}%` }}
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={toggleMute}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Detection Controls - Moved Down to avoid overlap */}
            <div style={{ position: 'absolute', top: '40%', right: 16, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 10 }}>
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

            {/* Camera Preview - Moved to Bottom Left to be out of way */}
            <AnimatePresence>
                {isFaceEnabled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ position: 'absolute', bottom: 100, left: 16, zIndex: 10 }}
                    >
                        <FaceTracker
                            onBreathChange={setFaceBreathValue}
                            isEnabled={isFaceEnabled}
                            onToggle={() => setIsFaceEnabled(!isFaceEnabled)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {isAudioEnabled && (
                <div style={{ display: 'none' }}>
                    <BreathingAudioDetector
                        onBreathChange={setAudioBreathValue}
                        isEnabled={isAudioEnabled}
                        onToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                    />
                </div>
            )}

            {/* Start Overlay */}
            {breathingState === 'intro' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, background: 'rgba(0,0,0,0.4)' }}>
                    <button
                        onClick={startSession}
                        style={{ padding: '16px 32px', fontSize: '1.2rem', fontWeight: 'bold', background: 'white', color: 'black', borderRadius: 30, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,255,255,0.3)' }}
                    >
                        Start Session
                    </button>
                </div>
            )}

            {/* Bottom Controls */}
            <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 10 }}>
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
                                transition: 'all 0.2s',
                                fontSize: s.id === 'zodiac' ? '24px' : 'inherit'
                            }}
                        >
                            {s.id === 'zodiac' ? s.label : <s.icon size={24} />}
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
