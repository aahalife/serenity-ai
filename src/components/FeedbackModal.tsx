"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageSquare } from "lucide-react";
import styles from "./FeedbackModal.module.css";
import LiquidGlass from "./LiquidGlass";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestionTitle: string;
    onSubmit: (feedback: string) => void;
}

export default function FeedbackModal({ isOpen, onClose, suggestionTitle, onSubmit }: FeedbackModalProps) {
    const [feedback, setFeedback] = useState("");

    const handleSubmit = () => {
        if (feedback.trim()) {
            onSubmit(feedback);
            setFeedback("");
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={styles.modalWrapper}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LiquidGlass className={styles.glassContainer}>
                            <div className={styles.content}>
                                <div className={styles.header}>
                                    <div className={styles.titleRow}>
                                        <MessageSquare size={20} className={styles.icon} />
                                        <h3>Feedback</h3>
                                    </div>
                                    <button className={styles.closeButton} onClick={onClose}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <p className={styles.subtitle}>
                                    Thoughts on "{suggestionTitle}"?
                                </p>

                                <textarea
                                    className={styles.textarea}
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you think (e.g., wrong timing, dislike this topic)..."
                                    autoFocus
                                />

                                <div className={styles.actions}>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleSubmit}
                                        disabled={!feedback.trim()}
                                    >
                                        <Send size={16} />
                                        Submit Feedback
                                    </button>
                                </div>
                            </div>
                        </LiquidGlass>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
