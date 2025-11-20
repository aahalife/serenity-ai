"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import styles from "./Breathing.module.css";

const phases = [
    { name: "Inhale", duration: 4000, scale: 1.5 },
    { name: "Hold", duration: 4000, scale: 1.5 },
    { name: "Exhale", duration: 4000, scale: 1 },
    { name: "Hold", duration: 4000, scale: 1 },
];

export default function Breathing() {
    const [isActive, setIsActive] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive) {
            const currentPhase = phases[phaseIndex];
            interval = setTimeout(() => {
                setPhaseIndex((prev) => (prev + 1) % phases.length);
            }, currentPhase.duration);
        }

        return () => clearTimeout(interval);
    }, [isActive, phaseIndex]);

    const toggleActive = () => {
        setIsActive(!isActive);
        if (!isActive) setPhaseIndex(0);
    };

    const currentPhase = phases[phaseIndex];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Box Breathing</h1>

            <div className={styles.boxContainer}>
                <motion.div
                    className={styles.box}
                    animate={{
                        scale: isActive ? currentPhase.scale : 1,
                        rotate: isActive ? 90 : 0,
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className={styles.circle}
                    animate={{
                        scale: isActive ? currentPhase.scale * 0.8 : 1,
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                    }}
                >
                    {isActive ? currentPhase.name : "Ready"}
                </motion.div>
            </div>

            <p className={styles.instruction}>
                {isActive ? currentPhase.name : "Press Play to Start"}
            </p>

            <div className={styles.controls}>
                <button onClick={toggleActive} className={styles.button}>
                    {isActive ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className={styles.button}>
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>

            {/* Audio Element Placeholder */}
            {!isMuted && isActive && (
                <audio autoPlay loop>
                    {/* Use a placeholder or public domain calming sound URL */}
                    <source src="https://cdn.pixabay.com/download/audio/2022/03/24/audio_1c6b9c2b38.mp3?filename=meditation-impulse-3000.mp3" type="audio/mpeg" />
                </audio>
            )}
        </div>
    );
}
