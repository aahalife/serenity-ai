"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, Sparkles, X, Image as ImageIcon } from "lucide-react";
import styles from "./SmartSchedule.module.css";

interface ScheduleItem {
    time: string;
    title: string;
    description: string;
    insight: string;
    type: string;
    duration: string;
    visual_prompt: string;
}

interface SmartScheduleProps {
    flowState: {
        score: number;
        drive: number;
        ease: number;
        optimism: number;
        focus: number;
        insight: string;
    };
    userProfile: any;
    habits?: any[];
}

export default function SmartSchedule({ flowState, userProfile, habits = [] }: SmartScheduleProps) {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch("/api/inference/schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ flowState, userProfile, habits })
                });

                if (response.ok) {
                    const data = await response.json();
                    setSchedule(data.schedule);
                }
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            } finally {
                setLoading(false);
            }
        };

        if (flowState) {
            fetchSchedule();
        }
    }, [flowState, userProfile, habits]);

    const handleItemClick = async (item: ScheduleItem) => {
        setSelectedItem(item);
        setGeneratedImage(null);
        setIsGeneratingImage(true);

        try {
            const response = await fetch("/api/visualize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: item.visual_prompt })
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedImage(data.imageUrl);
            }
        } catch (error) {
            console.error("Failed to generate image", error);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    if (loading) return <div className={styles.loading}>Crafting your rich moments...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}><Sparkles size={20} /> Your Flow Schedule</h2>
            <div className={styles.timeline}>
                {schedule.map((item, index) => (
                    <motion.div
                        key={index}
                        className={styles.item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleItemClick(item)}
                    >
                        <div className={styles.timeColumn}>
                            <span className={styles.time}>{item.time}</span>
                            <div className={styles.line}></div>
                        </div>
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <span className={styles.type}>{item.type}</span>
                                <span className={styles.duration}><Clock size={12} /> {item.duration}</span>
                            </div>
                            <h3 className={styles.itemTitle}>{item.title}</h3>
                            <p className={styles.description}>{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeButton} onClick={() => setSelectedItem(null)}>
                                <X size={24} />
                            </button>

                            <div className={styles.modalHeader}>
                                <span className={styles.modalType}>{selectedItem.type}</span>
                                <h2>{selectedItem.title}</h2>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.visualSection}>
                                    {isGeneratingImage ? (
                                        <div className={styles.imagePlaceholder}>
                                            <div className={styles.spinner}></div>
                                            <p>Visualizing this moment...</p>
                                        </div>
                                    ) : generatedImage ? (
                                        <motion.img
                                            src={generatedImage}
                                            alt="Visualization"
                                            className={styles.generatedImage}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <ImageIcon size={48} />
                                            <p>Visualization unavailable</p>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.textSection}>
                                    <p className={styles.fullDescription}>{selectedItem.description}</p>
                                    <div className={styles.insightBox}>
                                        <h4>Why this fits you</h4>
                                        <p>{selectedItem.insight}</p>
                                    </div>
                                    <div className={styles.promptBox}>
                                        <small>Visual Prompt: {selectedItem.visual_prompt}</small>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
