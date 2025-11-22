import { useState, useEffect, useRef, useCallback } from "react";

interface AudioOptions {
    volume?: number;
    loop?: boolean;
    fadeInDuration?: number;
    fadeOutDuration?: number;
    onEnded?: () => void;
}

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const play = useCallback((src: string, options: AudioOptions = {}) => {
        const { volume = 1, loop = false, fadeInDuration = 0, onEnded } = options;

        if (audioRef.current) {
            // Fade out current audio if playing
            const currentAudio = audioRef.current;
            const fadeOutDuration = 1000; // Default fade out
            const startVolume = currentAudio.volume;
            const step = startVolume / (fadeOutDuration / 50);

            const fadeOutInterval = setInterval(() => {
                if (currentAudio.volume > step) {
                    currentAudio.volume -= step;
                } else {
                    currentAudio.volume = 0;
                    currentAudio.pause();
                    clearInterval(fadeOutInterval);
                }
            }, 50);
        }

        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = 0; // Start at 0 for fade in
        audioRef.current = audio;

        if (onEnded) {
            audio.onended = onEnded;
        }

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (!audioRef.current) return; // Check if unmounted/stopped
                setIsPlaying(true);
                // Fade in
                const step = 0.05;
                const interval = fadeInDuration / (volume / step);
                const fadeInterval = setInterval(() => {
                    if (!audioRef.current) {
                        clearInterval(fadeInterval);
                        return;
                    }
                    if (audio.volume < volume) {
                        audio.volume = Math.min(audio.volume + step, volume);
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, interval);
            }).catch(error => {
                if (error.name === 'AbortError') {
                    // Ignore abort errors caused by pausing/stopping immediately
                    return;
                }
                console.error("Audio playback failed:", error);
            });
        }
    }, []);

    const stop = useCallback((fadeOutDuration: number = 1000) => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const startVolume = audio.volume;
        const step = 0.05;
        const interval = fadeOutDuration / (startVolume / step);

        const fadeInterval = setInterval(() => {
            if (audio.volume > 0) {
                audio.volume = Math.max(audio.volume - step, 0);
            } else {
                clearInterval(fadeInterval);
                audio.pause();
                setIsPlaying(false);
                if (audioRef.current === audio) {
                    audioRef.current = null;
                }
            }
        }, interval);
    }, []);

    const duck = useCallback((duration: number = 0, targetVolume: number = 0.1) => {
        if (!audioRef.current) return;
        // Simple ducking: lower volume immediately
        const originalVolume = audioRef.current.volume;
        audioRef.current.volume = targetVolume;

        // Restore after duration if specified, else manual unduck needed
        if (duration > 0) {
            setTimeout(() => {
                if (audioRef.current) audioRef.current.volume = originalVolume;
            }, duration);
        }
    }, []);

    const unduck = useCallback((targetVolume: number = 0.5) => {
        if (audioRef.current) {
            audioRef.current.volume = targetVolume;
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setIsMuted(audioRef.current.muted);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return { play, stop, duck, unduck, toggleMute, isPlaying, isMuted };
}
