"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, RotateCcw } from "lucide-react";
import styles from "./Breathing.module.css";
import LiquidGlass from "./LiquidGlass";
import { useAudio } from "@/hooks/useAudio";

type BreathingState = "idle" | "intro" | "loop" | "outro";

export default function Breathing() {
    const [state, setState] = useState<BreathingState>("idle");
    const videoRef = useRef<HTMLVideoElement>(null);
    const { play, stop: stopAudio } = useAudio();

    const handlePlay = () => {
        setState("intro");
        // Play calming background music
        play("/audio/homebkg.m4a", { volume: 0.3, loop: true, fadeInDuration: 1000 });
    };

    const handleStop = () => {
        setState("outro");
        stopAudio();
    };

    const handleVideoEnded = () => {
        if (state === "intro") {
            setState("loop");
        } else if (state === "outro") {
            setState("idle");
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    }, [state]);

    const getVideoSrc = () => {
        switch (state) {
            case "intro": return "/videos/breathing_04_box_intro.mp4";
            case "loop": return "/videos/breathing_04_box_main_loop.mp4";
            case "outro": return "/videos/breathing_04_box_outro.mp4";
            default: return "";
        }
    };

    return (
        <div className={styles.container}>
            <div className="ambient-glow" />

            <div className={styles.content}>
                {state === "idle" ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.startCardWrapper}
                    >
                        <LiquidGlass className={styles.startCard}>
                            <h1 className={`${styles.title} font-montage`}>Box Breathing</h1>
                            <p className={styles.description}>
                                Inhale. Hold. Exhale. Hold.<br />
                                Reset your nervous system in 4 minutes.
                            </p>
                            <button className={styles.playButton} onClick={handlePlay}>
                                <Play fill="currentColor" /> Begin
                            </button>
                        </LiquidGlass>
                    </motion.div>
                ) : (
                    <div className={styles.videoWrapper}>
                        <video
                            ref={videoRef}
                            src={getVideoSrc()}
                            className={styles.video}
                            onEnded={handleVideoEnded}
                            loop={state === "loop"}
                            playsInline
                            muted={false} // Allow sound if video has it
                        />

                        <div className={styles.overlayControls}>
                            <button className={styles.controlButton} onClick={handleStop}>
                                <Square size={20} fill="currentColor" /> Stop
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
