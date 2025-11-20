"use client";

import { useState, useEffect } from "react";
import { Mic, Save, Book } from "lucide-react";
import styles from "./Journal.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface Entry {
    id: string;
    text: string;
    date: string;
}

export default function Journal() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [newEntry, setNewEntry] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        const savedEntries = localStorage.getItem("journalEntries");
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
    }, []);

    const handleSave = () => {
        if (!newEntry.trim()) return;

        const entry: Entry = {
            id: Date.now().toString(),
            text: newEntry,
            date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
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
            <header className={styles.header}>
                <h1 className={styles.title}>Your Hero Book</h1>
                <p className={styles.subtitle}>Document your journey, wins, and learnings.</p>
            </header>

            <div className={styles.inputSection}>
                <textarea
                    className={styles.textarea}
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="What's on your mind today?"
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
                    <button onClick={handleSave} className={styles.saveButton} disabled={!newEntry.trim()}>
                        <Save size={18} style={{ marginRight: 8, display: "inline" }} />
                        Save Entry
                    </button>
                </div>
            </div>

            <div className={styles.heroBook}>
                <AnimatePresence>
                    {entries.length > 0 ? (
                        entries.map((entry) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.entry}
                            >
                                <div className={styles.entryDate}>{entry.date}</div>
                                <p className={styles.entryText}>{entry.text}</p>
                            </motion.div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Book size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <p>Your story begins with the first page. Write something today.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
