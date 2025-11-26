'use client';

import React, { useState, useEffect } from 'react';
import { Technique, TechniqueStep } from '@/lib/stress-relief/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Mic, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        <div className="max-w-2xl mx-auto p-6 min-h-[600px] flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors text-sm">
                    ← Back to Stress Relief
                </button>
                <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Progress Bar */}
            {!isIntro && !isClosing && (
                <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-white/40"
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
                    className="flex-1 flex flex-col justify-center"
                >
                    {isIntro && (
                        <div className="text-center space-y-6">
                            <h1 className="text-3xl font-bold text-white/90">{technique.title}</h1>
                            <p className="text-xl text-white/70 leading-relaxed">{technique.script.opening}</p>
                            <button
                                onClick={handleNext}
                                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-all mt-8"
                            >
                                Start
                            </button>
                        </div>
                    )}

                    {currentStep && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-semibold text-white/90">{currentStep.title}</h2>
                            <p className="text-lg text-white/70 leading-relaxed">{currentStep.tts_text}</p>

                            {/* Dynamic UI Components based on step type */}
                            <div className="min-h-[100px] py-4">
                                {currentStep.ui_type === 'text_input' && (
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Type here..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                )}

                                {currentStep.ui_type === 'timer' && (
                                    <div className="flex justify-center py-8">
                                        <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center text-2xl font-mono text-white/80">
                                            {Math.floor((currentStep.duration_sec || 0) / 60)}:{(currentStep.duration_sec || 0) % 60 < 10 ? '0' : ''}{(currentStep.duration_sec || 0) % 60}
                                        </div>
                                    </div>
                                )}

                                {currentStep.ui_type === 'breath_visual' && (
                                    <div className="flex justify-center py-8">
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1] }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-32 h-32 rounded-full bg-white/10 blur-xl"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleNext}
                                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all flex items-center space-x-2"
                                >
                                    <span>Next</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {isClosing && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white/90">Complete</h2>
                            <p className="text-xl text-white/70 leading-relaxed">{technique.script.closing}</p>
                            <button
                                onClick={handleClose}
                                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-all mt-8"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
