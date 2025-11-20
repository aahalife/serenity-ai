import { useState, useEffect, useRef, useCallback } from "react";

interface AudioOptions {
    volume?: number;
    loop?: boolean;
    fadeInDuration?: number;
    fadeOutDuration?: number;
}

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const play = useCallback((src: string, options: AudioOptions = {}) => {
        const { volume = 0.5, loop = false, fadeInDuration = 1000 } = options;

        if (audioRef.current) {
            // If already playing the same track, just ensure volume/loop
            if (audioRef.current.src.includes(src)) {
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Audio play error:", e));
                    setIsPlaying(true);
                }
                return;
            }
            // Stop previous track
            stop(0);
        }

        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = 0; // Start at 0 for fade in
        audioRef.current = audio;

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
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
