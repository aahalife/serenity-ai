"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface BreathingAudioDetectorProps {
    onBreathChange: (value: number) => void;
    isEnabled: boolean;
    onToggle: () => void;
}

export default function BreathingAudioDetector({ onBreathChange, isEnabled, onToggle }: BreathingAudioDetectorProps) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);

    const [volume, setVolume] = useState(0);
    const [hasPermission, setHasPermission] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    // Smoothing for breath detection
    const smoothedVolumeRef = useRef(0);
    const prevVolumeRef = useRef(0);
    const breathPhaseRef = useRef<'inhale' | 'exhale' | 'hold'>('hold');

    const startAudioAnalysis = useCallback(async () => {
        if (audioContextRef.current) return;

        setIsInitializing(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            setHasPermission(true);
            setIsInitializing(false);

            // Start analysis loop
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const analyze = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);

                // Calculate average volume
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const avg = sum / dataArray.length;

                // Normalize to 0-1 range (typical speaking is 50-150)
                const normalized = Math.min(1, avg / 100);
                setVolume(normalized);

                // Smooth the volume for breath detection
                smoothedVolumeRef.current = smoothedVolumeRef.current * 0.9 + normalized * 0.1;

                // Detect breath phase based on volume changes
                const volumeDelta = smoothedVolumeRef.current - prevVolumeRef.current;

                // Breathing typically causes gradual volume changes
                // Inhale: volume increases (air flow in)
                // Exhale: volume increases more (air flow out is louder)
                // Hold: volume stays low

                if (smoothedVolumeRef.current > 0.1) {
                    if (volumeDelta > 0.001) {
                        breathPhaseRef.current = 'inhale';
                    } else if (volumeDelta < -0.001) {
                        breathPhaseRef.current = 'exhale';
                    }
                } else {
                    breathPhaseRef.current = 'hold';
                }

                // Map breath phase to output value
                let breathValue = 0;
                if (breathPhaseRef.current === 'inhale') {
                    breathValue = Math.min(1, smoothedVolumeRef.current * 2);
                } else if (breathPhaseRef.current === 'exhale') {
                    breathValue = Math.max(0, 1 - smoothedVolumeRef.current * 2);
                }

                onBreathChange(breathValue);
                prevVolumeRef.current = smoothedVolumeRef.current;

                animationRef.current = requestAnimationFrame(analyze);
            };

            analyze();
        } catch (err) {
            console.error('Microphone access denied:', err);
            setHasPermission(false);
            setIsInitializing(false);
        }
    }, [onBreathChange]);

    const stopAudioAnalysis = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        analyserRef.current = null;
    }, []);

    useEffect(() => {
        if (isEnabled) {
            startAudioAnalysis();
        } else {
            stopAudioAnalysis();
        }

        return () => {
            stopAudioAnalysis();
        };
    }, [isEnabled, startAudioAnalysis, stopAudioAnalysis]);

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onToggle}
                disabled={isInitializing}
                className={`p-3 rounded-full backdrop-blur-md transition-all ${isEnabled
                        ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                        : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                    }`}
                title={isEnabled ? 'Disable Mic Breathing' : 'Enable Mic Breathing'}
            >
                {isEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            {isEnabled && (
                <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-400 transition-all duration-100"
                        style={{ width: `${volume * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
}
