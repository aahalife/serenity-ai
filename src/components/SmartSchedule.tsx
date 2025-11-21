"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, Sparkles, X, Image as ImageIcon, Calendar, MessageSquare } from "lucide-react";
import styles from "./SmartSchedule.module.css";
import FeedbackModal from "./FeedbackModal";

interface ScheduleItem {
    id: string;
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
    const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackItem, setFeedbackItem] = useState<ScheduleItem | null>(null);

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
                    // Ensure items have IDs
                    const scheduleWithIds = data.schedule.map((item: any, index: number) => ({
                        ...item,
                        id: item.id || `schedule-${index}-${Date.now()}`
                    }));
                    setSchedule(scheduleWithIds);

                    // Trigger image generation for ALL items
                    scheduleWithIds.forEach((item: ScheduleItem) => {
                        generateImageForItem(item);
                    });
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

    const generateImageForItem = async (item: ScheduleItem) => {
        // Skip if already generated or generating (simple check, could be more robust)
        if (generatedImages[item.id]) return;

        try {
            const response = await fetch("/api/visualize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: item.visual_prompt + ", oil painting style, artistic, blended edges" })
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedImages(prev => ({
                    ...prev,
                    [item.id]: data.imageUrl
                }));
            }
        } catch (error) {
            console.error(`Failed to generate image for ${item.id}`, error);
        }
    };

    const handleItemClick = (item: ScheduleItem) => {
        setSelectedItem(item);
    };

    const handleAddToCalendar = (e: React.MouseEvent, item: ScheduleItem) => {
        e.stopPropagation();
        // Mock calendar addition
        alert(`Added "${item.title}" to your calendar!`);
    };

    const handleFeedback = (e: React.MouseEvent, item: ScheduleItem) => {
        e.stopPropagation();
        setFeedbackItem(item);
        setIsFeedbackOpen(true);
    };

    const submitFeedback = (feedback: string) => {
        console.log(`Feedback for ${feedbackItem?.title}: ${feedback}`);
        // In a real app, send this to an API
    };

    if (loading) return <div className={styles.loading}>Crafting your rich moments...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}><Sparkles size={20} /> Your Flow Schedule</h2>
            <div className={styles.timeline}>
                {schedule.map((item, index) => (
                    <motion.div
                        key={item.id}
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
                            <div className={styles.itemHeader}>
                                <span className={styles.type}>{item.type}</span>
                                <span className={styles.duration}><Clock size={12} /> {item.duration}</span>
                            </div>
                            <h3 className={styles.itemTitle}>{item.title}</h3>
                            <p className={styles.description}>{item.description}</p>

                            {/* Inline Image Display */}
                            <div className={styles.inlineImageContainer}>
                                {generatedImages[item.id] ? (
                                    <motion.img
                                        src={generatedImages[item.id]}
                                        alt="Visualization"
                                        className={styles.inlineImage}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <div className={styles.spinner}></div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.actionButton}
                                    onClick={(e) => handleAddToCalendar(e, item)}
                                    title="Add to Calendar"
                                >
                                    <Calendar size={16} /> Add
                                </button>
                                <button
                                    className={styles.actionButton}
                                    onClick={(e) => handleFeedback(e, item)}
                                    title="Give Feedback"
                                >
                                    <MessageSquare size={16} /> Feedback
                                </button>
                            </div>
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
                                    {/* Removed duplicate image display in modal as requested, or kept minimal */}
                                    {generatedImages[selectedItem.id] && (
                                        <motion.img
                                            src={generatedImages[selectedItem.id]}
                                            alt="Visualization"
                                            className={styles.generatedImage}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        />
                                    )}
                                </div>

                                <div className={styles.textSection}>
                                    <p className={styles.fullDescription}>{selectedItem.description}</p>
                                    <div className={styles.insightBox}>
                                        <h4>Why this fits you</h4>
                                        <p>{selectedItem.insight}</p>
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button
                                            className={styles.modalActionButton}
                                            onClick={(e) => handleAddToCalendar(e, selectedItem)}
                                        >
                                            <Calendar size={18} /> Add to Calendar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                suggestionTitle={feedbackItem?.title || ""}
                onSubmit={submitFeedback}
            />
        </div>
    );
}
