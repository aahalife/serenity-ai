"use client";

import { useState, useEffect } from "react";
import { Mic, Save, Sparkles } from "lucide-react";
import styles from "./Journal.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface Entry {
    id: string;
    text: string;
    date: string;
    richMemory?: {
        title: string;
        visualDescription: string;
        emotion: string;
    };
}

export default function Journal() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [newEntry, setNewEntry] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);

    useEffect(() => {
        const savedEntries = localStorage.getItem("journalEntries");
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
    }, []);

    const handleSave = async () => {
        if (!newEntry.trim()) return;

        setIsAnalyzing(true);
        let richMemory = undefined;

        // Analyze entry with Gemini
        try {
            const response = await fetch("/api/inference/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entry: newEntry }),
            });

            if (response.ok) {
                const analysis = await response.json();
                if (analysis.richMemory) {
                    richMemory = analysis.richMemory;
                }
            }
        } catch (e) {
            console.error("Analysis failed", e);
        } finally {
            setIsAnalyzing(false);
        }

        const entry: Entry = {
            id: Date.now().toString(),
            text: newEntry,
            date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            richMemory
        };

        const updatedEntries = [entry, ...entries];
        setEntries(updatedEntries);
        localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
        setNewEntry("");
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            // Simulate voice input
            setTimeout(() => {
                setNewEntry((prev) => prev + " I felt really accomplished today after finishing the project.");
                setIsRecording(false);
            }, 2000);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.videoBackground} ${videoEnded ? styles.videoBlurred : ''}`}>
                <video
                    autoPlay
                    muted
                    playsInline
                    className={styles.video}
                    onEnded={() => setVideoEnded(true)}
                >
                    <source src="/videos/herobookbkg.mp4" type="video/mp4" />
                </video>
                <div className={styles.videoOverlay}></div>
            </div>

            <div className={styles.content}>
                <header className={styles.header}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <h1 className={styles.title}>Your Hero Book</h1>
                        <p className={styles.subtitle}>Chronicle your legend.</p>
                    </motion.div>
                </header>

                <div className={styles.bookContainer}>
                    <div className={styles.inputPage}>
                        <textarea
                            className={styles.textArea}
                            value={newEntry}
                            onChange={(e) => setNewEntry(e.target.value)}
                            placeholder="What is your story today?"
                        />
                        <div className={styles.controls}>
                            <button
                                onClick={toggleRecording}
                                className={styles.voiceButton}
                                style={isRecording ? { background: "var(--accent)", color: "white", borderColor: "var(--accent)" } : {}}
                            >
                                <Mic size={18} />
                                {isRecording ? "Listening..." : "Voice Note"}
                            </button>
                            <button
                                onClick={handleSave}
                                className={styles.saveButton}
                                disabled={!newEntry.trim() || isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <Sparkles className="animate-spin" size={18} />
                                ) : (
                                    <Save size={18} style={{ marginRight: 8, display: "inline" }} />
                                )}
                                {isAnalyzing ? "Divining..." : "Inscribe"}
                            </button>
                        </div>
                    </div>

                    <div className={styles.entriesList}>
                        <AnimatePresence>
                            {entries.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, rotateX: -90 }}
                                    animate={{ opacity: 1, rotateX: 0 }}
                                    transition={{ delay: index * 0.1, type: "spring" }}
                                    className={`${styles.entryCard} liquid-border`}
                                >
                                    <div className={styles.entryDate}>{entry.date}</div>
                                    <p className={styles.entryText}>{entry.text}</p>
                                    {entry.richMemory && (
                                        <div className={styles.richMemory}>
                                            <Sparkles size={16} className="text-accent" />
                                            <span className="magic-text">{entry.richMemory.title}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
