"use client";

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import styles from './AudioPlayer.module.css';

const AudioPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => {
                console.warn("Audio playback failed (user interaction required):", e);
            });
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className={styles.container}>
            <button
                onClick={togglePlay}
                className={styles.button}
                title={isPlaying ? "Mute Music" : "Play Music"}
            >
                {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {isPlaying && (
                <div className={styles.pill}>
                    <Music size={12} className={styles.iconPulse} />
                    <span className={styles.trackName}>Cool Breathing</span>
                </div>
            )}

            {/* Relaxing Ambient Music */}
            <audio
                ref={audioRef}
                loop
                src="/audio/coolBreathe2.mp3"
            />
        </div>
    );
};

export default AudioPlayer;
