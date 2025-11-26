'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Technique, TechniqueStep } from '@/lib/stress-relief/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Mic, X, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LiquidGlass from '@/components/LiquidGlass';
import styles from '@/components/TheWork.module.css'; // Re-use TheWork styles for video bkg

interface TechniqueRunnerProps {
    techniqueId: string;
}

export const TechniqueRunner: React.FC<TechniqueRunnerProps> = ({ techniqueId }) => {
    const router = useRouter();
    const [technique, setTechnique] = useState<Technique | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 for intro
    const [isLoading, setIsLoading] = useState(true);
    const [userInput, setUserInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Video Backgrounds (cycling through available ones)
    const videos = [
        "/videos/theworkbkgs/650057f73744d6f9a46e25e3_AdobeStock_291299852 loop-transcode.mp4",
        "/videos/theworkbkgs/650057f73744d6f9a46e25f8_LightRays-transcode.mp4",
        "/videos/theworkbkgs/650057f73744d6f9a46e25fb_alforreca-comp-v2-transcode.mp4",
        "/videos/theworkbkgs/650057f73744d6f9a46e25fd_caustics-loop-comp-v2-transcode.mp4",
        "/videos/theworkbkgs/650057f73744d6f9a46e2600_above-water-comp-v2-transcode.mp4"
    ];

    useEffect(() => {
        const fetchTechnique = async () => {
            try {
                const res = await fetch(`/api/stress-relief/techniques/${techniqueId}`);
                if (!res.ok) throw new Error('Failed to load technique');
                const data = await res.json();
                setTechnique(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTechnique();
    }, [techniqueId]);

    // TTS Effect
    useEffect(() => {
        if (!technique || isMuted) return;

        const playTTS = async () => {
            // Stop previous
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            let textToSpeak = "";
            if (currentStepIndex === -1) {
                textToSpeak = technique.script.opening;
            } else if (currentStepIndex < technique.script.steps.length) {
                textToSpeak = technique.script.steps[currentStepIndex].tts_text;
            } else {
                textToSpeak = technique.script.closing;
            }

            if (textToSpeak) {
                try {
                    const res = await fetch("/api/tts", {
                        method: "POST",
                        body: JSON.stringify({ text: textToSpeak })
                    });
                    if (res.ok) {
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);
                        audioRef.current = audio;
                        audio.play();
                    }
                } catch (e) {
                    console.error("TTS Error", e);
                }
            }
        };

        // Small delay to allow transition
        const timer = setTimeout(playTTS, 500);
        return () => {
            clearTimeout(timer);
            if (audioRef.current) audioRef.current.pause();
        };
    }, [currentStepIndex, technique, isMuted]);

    // Audio Background
    const bgAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio once
        bgAudioRef.current = new Audio('/audio/work.mp3');
        bgAudioRef.current.loop = true;
        bgAudioRef.current.volume = 0.3;

        return () => {
            if (bgAudioRef.current) {
                bgAudioRef.current.pause();
                bgAudioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (bgAudioRef.current) {
            if (isMuted) {
                bgAudioRef.current.pause();
            } else {
                bgAudioRef.current.play().catch(e => console.log("Audio play failed", e));
            }
        }
    }, [isMuted]);

    const saveWin = () => {
        if (!technique) return;

        const newWin = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            stressfulThought: technique.title,
            turnaround: "Completed Stress Relief Session",
            emotionBefore: "Stressed",
            emotionAfter: "Relieved"
        };

        const existingWins = JSON.parse(localStorage.getItem("wins") || "[]");
        localStorage.setItem("wins", JSON.stringify([newWin, ...existingWins]));
    };

    const handleNext = () => {
        if (!technique) return;
        if (currentStepIndex < technique.script.steps.length) {
            setCurrentStepIndex(prev => prev + 1);
            setUserInput(''); // Reset input for next step
        } else {
            saveWin();
            router.push('/stress-relief');
        }
    };

    const handleClose = () => {
        router.push('/stress-relief');
    };

    if (isLoading) return <div className="text-white/50 p-8 flex items-center justify-center h-screen">Loading...</div>;
    if (!technique) return <div className="text-red-400 p-8 flex items-center justify-center h-screen">Technique not found</div>;

    const isIntro = currentStepIndex === -1;
    const isClosing = currentStepIndex === technique.script.steps.length;
    const currentStep = !isIntro && !isClosing ? technique.script.steps[currentStepIndex] : null;

    // Select video based on step index (cycling)
    const currentVideo = videos[(currentStepIndex + 1) % videos.length];

    return (
        <div className={styles.container}>
            {/* Video Background */}
            <div className={styles.videoBackground}>
                <video
                    src={currentVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.video}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Controls */}
            <button onClick={handleClose} className={styles.closeButton}>
                <X size={24} />
            </button>
            <div className="fixed top-8 right-20 z-50">
                <button onClick={() => setIsMuted(!isMuted)} className={styles.closeButton} style={{ right: 'auto' }}>
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>

            {/* Main Content */}
            <div className={styles.section}>
                <div className={styles.overlay}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="w-full flex flex-col items-center text-center"
                        >
                            {isIntro && (
                                <>
                                    <h1 className={styles.title}>{technique.title}</h1>
                                    <p className={styles.subtitle}>{technique.script.opening}</p>
                                    <button onClick={handleNext} className={styles.button}>
                                        Begin Session <ArrowRight size={20} />
                                    </button>
                                </>
                            )}

                            {currentStep && (
                                <>
                                    <h2 className={styles.question}>{currentStep.title}</h2>
                                    <p className={styles.thoughtDisplay}>{currentStep.tts_text}</p>

                                    <div className="w-full max-w-xl mx-auto mt-8">
                                        {currentStep.ui_type === 'text_input' && (
                                            <div className={styles.inputContainer}>
                                                <textarea
                                                    value={userInput}
                                                    onChange={(e) => setUserInput(e.target.value)}
                                                    placeholder="Type your thoughts here..."
                                                    className={styles.textarea}
                                                    autoFocus
                                                />
                                            </div>
                                        )}

                                        {currentStep.ui_type === 'timer' && (
                                            <div className="flex justify-center py-8">
                                                <div className="w-56 h-56 rounded-full border-4 border-white/10 flex items-center justify-center text-6xl font-mono text-white/90 relative bg-white/5 backdrop-blur-sm">
                                                    <div
                                                        className="absolute inset-0 rounded-full border-4 border-t-blue-400 animate-spin"
                                                        style={{ animationDuration: `${currentStep.duration_sec || 60}s` }}
                                                    />
                                                    {Math.floor((currentStep.duration_sec || 0) / 60)}:{(currentStep.duration_sec || 0) % 60 < 10 ? '0' : ''}{(currentStep.duration_sec || 0) % 60}
                                                </div>
                                            </div>
                                        )}

                                        {currentStep.ui_type === 'breath_visual' && (
                                            <div className="flex justify-center py-12 relative">
                                                <motion.div
                                                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                                    className="w-72 h-72 rounded-full bg-blue-400/20 blur-3xl absolute"
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                                    className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 z-10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                                >
                                                    <span className="text-white/60 font-montage text-xl">Breathe</span>
                                                </motion.div>
                                            </div>
                                        )}

                                        <div className="flex justify-center mt-8">
                                            <button onClick={handleNext} className={styles.button}>
                                                Next Step <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {isClosing && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_50px_rgba(74,222,128,0.3)]"
                                    >
                                        <Check size={56} className="text-green-400" />
                                    </motion.div>
                                    <h2 className={styles.title}>Session Complete</h2>
                                    <p className={styles.subtitle}>{technique.script.closing}</p>
                                    <button onClick={handleClose} className={styles.button}>
                                        Return to Center
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Indicator */}
            {!isIntro && !isClosing && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-50">
                    {technique.script.steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-500 shadow-lg ${idx <= currentStepIndex ? 'w-10 bg-white' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
