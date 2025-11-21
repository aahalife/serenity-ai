"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Send, Sparkles, Volume2, VolumeX } from "lucide-react";
import styles from "./Journal.module.css";
import { useAudio } from "@/hooks/useAudio";
import LiquidGlass from "./LiquidGlass";
import { motion, AnimatePresence } from "framer-motion";

export default function Journal() {
    const [entry, setEntry] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const { play, toggleMute, isMuted } = useAudio();
    const [showInputModal, setShowInputModal] = useState(false);

    // Ref for the text area to auto-resize or focus
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Crossfade logic: Play new background
        play("/audio/journalbkg.m4a", { volume: 0.3, loop: true, fadeInDuration: 2000 });

        return () => {
            // Optional: fade out when leaving
            // fadeOut(1000); 
        };
    }, [play]);

    const handleStartRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            // Start mock STT
            simulateStreamingText();
        }
    };

    const simulateStreamingText = () => {
        const phrases = [
            "Today I felt...",
            " a sense of calm...",
            " washing over me.",
            " It was unexpected but welcome."
        ];

        let delay = 0;
        phrases.forEach((phrase, index) => {
            setTimeout(() => {
                setEntry(prev => prev + phrase);
                setIsTyping(true);

                // Reset typing indicator after the last phrase
                if (index === phrases.length - 1) {
                    setTimeout(() => setIsTyping(false), 500);
                    setIsRecording(false);
                }
            }, delay);
            delay += 1000 + Math.random() * 500;
        });
    };

    const handleOpenModal = () => {
        setShowInputModal(true);
        setTimeout(() => textareaRef.current?.focus(), 100);
    };

    const handleSave = async () => {
        if (!entry.trim()) return;

        console.log("Saving entry:", entry);
        // Logic to save entry would go here

        setEntry("");
        setShowInputModal(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.videoBackground}>
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.video}
                >
                    <source src="/videos/journalbkg.mp4" type="video/mp4" />
                </video>
                <div className={styles.videoOverlay}></div>
            </div>

            <div className={styles.content}>
                <h1 className={`${styles.title} font-montage`}>Reflect & Thrive</h1>
                <p className={styles.subtitle}>Your thoughts are safe here.</p>
            </div>

            <AnimatePresence>
                {!showInputModal && (
                    <motion.div
                        className={styles.actionArea}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <LiquidGlass className={styles.mainButtonGlass}>
                            <button className={styles.mainButton} onClick={handleOpenModal}>
                                <Sparkles size={24} />
                                <span>Begin Entry</span>
                            </button>
                        </LiquidGlass>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showInputModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        >
                            <LiquidGlass className={`${styles.inputGlass} ${isRecording ? styles.glow : ''}`}>
                                <div className={styles.inputWrapper}>
                                    <textarea
                                        ref={textareaRef}
                                        value={entry}
                                        onChange={(e) => setEntry(e.target.value)}
                                        placeholder="Speak or type your thoughts..."
                                        className={`${styles.textarea} ${isTyping ? styles.typingEffect : ''}`}
                                    />

                                    <div className={styles.controls}>
                                        <button
                                            className={`${styles.iconButton} ${isRecording ? styles.recording : ''}`}
                                            onClick={handleStartRecording}
                                            title="Voice Note (ElevenLabs VAD)"
                                        >
                                            <Mic size={24} />
                                        </button>
                                        <button
                                            className={styles.saveButton}
                                            onClick={handleSave}
                                            disabled={!entry.trim()}
                                        >
                                            <Send size={20} />
                                            <span>Inscribe</span>
                                        </button>
                                    </div>
                                </div>
                            </LiquidGlass>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
