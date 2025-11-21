"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Zap, Save } from "lucide-react";
import styles from "./StressSelfReportModal.module.css";

interface StressSelfReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStress: number;
    currentEnergy: number;
    onUpdate: (stress: number, energy: number) => void;
}

export default function StressSelfReportModal({ isOpen, onClose, currentStress, currentEnergy, onUpdate }: StressSelfReportModalProps) {
    const [stress, setStress] = useState(currentStress);
    const [energy, setEnergy] = useState(currentEnergy);

    const handleSave = () => {
        onUpdate(stress, energy);
        onClose();
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
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            <h3>Debug State</h3>
                            <button className={styles.closeButton} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.sliderGroup}>
                                <div className={styles.labelRow}>
                                    <span className={styles.label}><Activity size={16} className="text-primary" /> Stress Level</span>
                                    <span className={styles.value}>{stress}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={stress}
                                    onChange={(e) => setStress(Number(e.target.value))}
                                    className={styles.slider}
                                    style={{ background: `linear-gradient(to right, var(--primary) ${stress}%, rgba(255,255,255,0.1) ${stress}%)` }}
                                />
                                <p className={styles.hint}>Set &gt; 70% to trigger High Stress Modal</p>
                            </div>

                            <div className={styles.sliderGroup}>
                                <div className={styles.labelRow}>
                                    <span className={styles.label}><Zap size={16} className="text-accent" /> Energy Level</span>
                                    <span className={styles.value}>{energy}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={energy}
                                    onChange={(e) => setEnergy(Number(e.target.value))}
                                    className={styles.slider}
                                    style={{ background: `linear-gradient(to right, var(--accent) ${energy}%, rgba(255,255,255,0.1) ${energy}%)` }}
                                />
                                <p className={styles.hint}>Set &lt; 30% to trigger Low Energy Modal</p>
                            </div>

                            <button className={styles.saveButton} onClick={handleSave}>
                                <Save size={18} /> Update State
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
