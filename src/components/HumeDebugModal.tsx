import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Brain, MessageSquare } from 'lucide-react';
import styles from './HumeDebugModal.module.css';

interface HumeDebugModalProps {
    isOpen: boolean;
    onClose: () => void;
    humeData: {
        emotions: any[];
        prosody: any;
    };
    llmContext: any;
    transcript: string;
    isConnected: boolean;
}

export default function HumeDebugModal({ isOpen, onClose, humeData, llmContext, transcript, isConnected }: HumeDebugModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.overlay}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={styles.modal}
                >
                    <div className={styles.header}>
                        <h2>
                            <Activity size={20} />
                            Hume AI Debugger
                            <span style={{
                                fontSize: '0.8rem',
                                marginLeft: '1rem',
                                color: isConnected ? '#4ade80' : '#f87171',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px'
                            }}>
                                {isConnected ? "Connected" : "Disconnected"}
                            </span>
                        </h2>
                        <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h3><MessageSquare size={16} /> Live Transcript</h3>
                            <div className={styles.codeBlock}>{transcript || "Waiting for speech..."}</div>
                        </div>

                        <div className={styles.section}>
                            <h3><Brain size={16} /> Detected Emotions (Top 3)</h3>
                            <div className={styles.emotionsGrid}>
                                {humeData.emotions.length > 0 ? (
                                    humeData.emotions.map((emotion: any, idx: number) => (
                                        <div key={idx} className={styles.emotionCard}>
                                            <span className={styles.emotionName}>{emotion.name}</span>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${emotion.score * 100}%` }}
                                                />
                                            </div>
                                            <span className={styles.emotionScore}>{(emotion.score * 100).toFixed(1)}%</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.placeholder}>No emotions detected yet</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3><Activity size={16} /> LLM Context Payload</h3>
                            <pre className={styles.jsonBlock}>
                                {JSON.stringify(llmContext, null, 2)}
                            </pre>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
