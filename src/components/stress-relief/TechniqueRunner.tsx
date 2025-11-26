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

    const handleNext = () => {
        if (!technique) return;
        if (currentStepIndex < technique.script.steps.length) {
            setCurrentStepIndex(prev => prev + 1);
            setUserInput(''); // Reset input for next step
        } else {
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
        <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    key={currentVideo} // Force reload on change
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
                >
                    <source src={currentVideo} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Controls */}
            <div className="absolute top-6 right-6 z-50 flex items-center space-x-4">
                <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button onClick={handleClose} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all">
                    <X size={20} />
                </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full"
                    >
                        {isIntro && (
                            <div className="text-center space-y-8">
                                <h1 className="text-5xl md:text-7xl font-bold font-montage tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                    {technique.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-white/80 font-petrona max-w-2xl mx-auto leading-relaxed">
                                    {technique.script.opening}
                                </p>
                                <div className="pt-12">
                                    <button
                                        onClick={handleNext}
                                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-black bg-white rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Begin Session <ArrowRight size={20} />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep && (
                            <div className="w-full max-w-2xl mx-auto">
                                <div className="mb-8 text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold font-montage mb-4">{currentStep.title}</h2>
                                    <p className="text-xl text-white/80 font-petrona leading-relaxed">{currentStep.tts_text}</p>
                                </div>

                                <LiquidGlass className="p-1">
                                    <div className="p-6 md:p-8 space-y-6">
                                        {currentStep.ui_type === 'text_input' && (
                                            <textarea
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                placeholder="Type your thoughts here..."
                                                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-petrona resize-none"
                                                autoFocus
                                            />
                                        )}

                                        {currentStep.ui_type === 'timer' && (
                                            <div className="flex justify-center py-8">
                                                <div className="w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center text-5xl font-mono text-white/90 relative">
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
                                                    className="w-64 h-64 rounded-full bg-blue-400/20 blur-3xl absolute"
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                                    className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 z-10 flex items-center justify-center"
                                                >
                                                    <span className="text-white/50 font-montage">Breathe</span>
                                                </motion.div>
                                            </div>
                                        )}

                                        {/* Generic Next Button for all steps */}
                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleNext}
                                                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white font-medium"
                                            >
                                                Next Step <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </LiquidGlass>
                            </div>
                        )}

                        {isClosing && (
                            <div className="text-center space-y-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                                >
                                    <Check size={48} className="text-green-400" />
                                </motion.div>
                                <h2 className="text-5xl font-bold font-montage">Session Complete</h2>
                                <p className="text-xl text-white/70 font-petrona max-w-lg mx-auto leading-relaxed">
                                    {technique.script.closing}
                                </p>
                                <div className="pt-12">
                                    <button
                                        onClick={handleClose}
                                        className="bg-white text-black px-10 py-4 rounded-full font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    >
                                        Return to Center
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Indicator */}
            {!isIntro && !isClosing && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-2 z-50">
                    {technique.script.steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx <= currentStepIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
