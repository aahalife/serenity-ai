"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Wind } from "lucide-react";
import styles from "./StressModal.module.css";
import { useRouter } from "next/navigation";

interface StressModalProps {
    isOpen: boolean;
    onClose: () => void;
    stressLevel: number;
    energyLevel: number;
}

export default function StressModal({ isOpen, onClose, stressLevel, energyLevel }: StressModalProps) {
    const router = useRouter();

    const handleTakeBreak = () => {
        router.push("/breathing");
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
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <button className={styles.closeButton} onClick={onClose}>
                            <X size={24} />
                        </button>

                        <div className={styles.content}>
                            <div className={styles.imageContainer}>
                                <img src="/breathingpop.png" alt="Take a breath" className={styles.image} />
                            </div>

                            <div className={styles.textContainer}>
                                <h2 className={`${styles.title} font-montage`}>Just Checking In...</h2>
                                <p className={styles.message}>
                                    I noticed your energy is a bit low and tension might be rising.
                                    Would you like to take a moment to breathe and reset?
                                </p>

                                <div className={styles.actions}>
                                    <button className={`${styles.primaryButton} font-montage`} onClick={handleTakeBreak}>
                                        <Wind size={18} />
                                        Take a Break
                                    </button>
                                    <button className={styles.secondaryButton} onClick={onClose}>
                                        I'm Okay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
