'use client';

import React, { useState, useEffect } from 'react';
import { Technique, TechniqueStep } from '@/lib/stress-relief/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Mic, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LiquidGlass from '@/components/LiquidGlass';

interface TechniqueRunnerProps {
    techniqueId: string;
}

export const TechniqueRunner: React.FC<TechniqueRunnerProps> = ({ techniqueId }) => {
    const router = useRouter();
    const [technique, setTechnique] = useState<Technique | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 for intro
    const [isLoading, setIsLoading] = useState(true);
    const [userInput, setUserInput] = useState('');

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

    const handleNext = () => {
        if (!technique) return;
        if (currentStepIndex < technique.script.steps.length) {
            setCurrentStepIndex(prev => prev + 1);
            setUserInput(''); // Reset input for next step
        } else {
            // Completed
            router.push('/stress-relief');
        }
    };

    const handleClose = () => {
        router.push('/stress-relief');
    };

    if (isLoading) return <div className="text-white/50 p-8">Loading technique...</div>;
    if (!technique) return <div className="text-red-400 p-8">Technique not found</div>;

    const isIntro = currentStepIndex === -1;
    const isClosing = currentStepIndex === technique.script.steps.length;
    const currentStep = !isIntro && !isClosing ? technique.script.steps[currentStepIndex] : null;

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 min-h-[600px] flex flex-col relative">
            <LiquidGlass className="min-h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2">
                        <ArrowRight className="rotate-180" size={16} /> Back
                    </button>
                    <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                {!isIntro && !isClosing && (
                    <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStepIndex + 1) / technique.script.steps.length) * 100}%` }}
                        />
                    </div>
                )}

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full"
                    >
                        {isIntro && (
                            <div className="text-center space-y-8">
                                <h1 className="text-5xl font-bold text-white/90 font-montage tracking-tight">{technique.title}</h1>
                                <p className="text-xl text-white/70 leading-relaxed font-petrona">{technique.script.opening}</p>
                                <div className="pt-8">
                                    <button
                                        onClick={handleNext}
                                        className="bg-white text-black px-10 py-4 rounded-full font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    >
                                        Begin Session
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep && (
                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold text-white/90 font-montage">{currentStep.title}</h2>
                                <p className="text-xl text-white/80 leading-relaxed font-petrona">{currentStep.tts_text}</p>

                                {/* Dynamic UI Components based on step type */}
                                <div className="min-h-[150px] py-6 flex flex-col justify-center">
                                    {currentStep.ui_type === 'text_input' && (
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder="Type your thoughts here..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-petrona"
                                            autoFocus
                                        />
                                    )}

                                    {currentStep.ui_type === 'timer' && (
                                        <div className="flex justify-center py-8">
                                            <div className="w-40 h-40 rounded-full border-4 border-white/10 flex items-center justify-center text-4xl font-mono text-white/90 relative">
                                                <div className="absolute inset-0 rounded-full border-4 border-t-blue-400 animate-spin duration-[120s]" style={{ animationDuration: `${currentStep.duration_sec}s` }} />
                                                {Math.floor((currentStep.duration_sec || 0) / 60)}:{(currentStep.duration_sec || 0) % 60 < 10 ? '0' : ''}{(currentStep.duration_sec || 0) % 60}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep.ui_type === 'breath_visual' && (
                                        <div className="flex justify-center py-8 relative">
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-2xl absolute"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border border-white/20 z-10"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        onClick={handleNext}
                                        className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-all flex items-center space-x-3 group"
                                    >
                                        <span>Next Step</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {isClosing && (
                            <div className="text-center space-y-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30"
                                >
                                    <Check size={48} className="text-green-400" />
                                </motion.div>
                                <h2 className="text-4xl font-bold text-white/90 font-montage">Session Complete</h2>
                                <p className="text-xl text-white/70 leading-relaxed font-petrona max-w-lg mx-auto">{technique.script.closing}</p>
                                <button
                                    onClick={handleClose}
                                    className="bg-white text-black px-10 py-4 rounded-full font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] mt-8"
                                >
                                    Return to Center
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </LiquidGlass>
        </div>
    );
};
