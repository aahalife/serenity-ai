"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowRight, Check, Sparkles, RefreshCw, Volume2, VolumeX } from "lucide-react";
import styles from "./TheWork.module.css";
import { useAudio } from "@/hooks/useAudio";

const questions = [
    { id: 1, text: "Is it true?", subtext: "Be still. Ask yourself: is this thought true?" },
    { id: 2, text: "Can you absolutely know that it's true?", subtext: "Can you know more than God/Reality?" },
    { id: 3, text: "How do you react when you believe that thought?", subtext: "What happens? How do you treat others? How do you treat yourself?" },
    { id: 4, text: "Who would you be without the thought?", subtext: "Close your eyes. Drop your story. Who are you?" },
];

export default function TheWork() {
    const [step, setStep] = useState(0);
    const [thought, setThought] = useState("");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const { play, stop, toggleMute, isMuted } = useAudio();

    useEffect(() => {
        // Start with 'work.mp3'
        play("/audio/work.mp3", { volume: 0.4, loop: true, fadeInDuration: 2000 });
        return () => stop();
    }, [play, stop]);

    useEffect(() => {
        // Transition audio based on step
        if (step === 2) { // Questioning phase
            play("/audio/work2.m4a", { volume: 0.4, loop: true, fadeInDuration: 2000 });
        } else if (step === 6) { // Turnaround phase
            play("/audio/turnaround.mp3", { volume: 0.4, loop: true, fadeInDuration: 2000 });
        }
    }, [step, play]);

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
            const imageUrl = canvas.toDataURL("image/png");
            setCapturedImage(imageUrl);

            // Stop stream
            const stream = videoRef.current.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            setIsCameraOpen(false);
        }
    };

    const questions = [
        "Is it true?",
        "Can you absolutely know that it's true?",
        "How do you react, what happens, when you believe that thought?",
        "Who would you be without the thought?"
    ];

    return (
        <div className={styles.container}>
            <button onClick={toggleMute} className={styles.muteButton}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="ambient-glow" />

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.card}
                    >
                        <h1 className={styles.title}>The Work</h1>
                        <p className={styles.description}>Identify a stressful thought to investigate.</p>
                        <textarea
                            className={styles.textarea}
                            value={thought}
                            onChange={(e) => setThought(e.target.value)}
                            placeholder="I am stressed because..."
                        />
                        <button
                            className={styles.button}
                            onClick={() => setStep(1)}
                            disabled={!thought.trim()}
                        >
                            Begin Inquiry <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={styles.card}
                    >
                        <h2 className={styles.subtitle}>Capture Your State</h2>
                        <p className={styles.description}>See yourself as you are in this moment.</p>

                        <div className={styles.cameraContainer}>
                            {isCameraOpen ? (
                                <video ref={videoRef} autoPlay playsInline className={styles.videoPreview} />
                            ) : capturedImage ? (
                                <img src={capturedImage} alt="Captured state" className={styles.capturedImage} />
                            ) : (
                                <div className={styles.placeholder}>
                                    <Camera size={48} className="text-muted" />
                                </div>
                            )}
                        </div>

                        {!capturedImage ? (
                            !isCameraOpen ? (
                                <button className={styles.button} onClick={startCamera}>
                                    Open Camera
                                </button>
                            ) : (
                                <button className={styles.button} onClick={captureImage}>
                                    Capture
                                </button>
                            )
                        ) : (
                            <div className="flex gap-4">
                                <button className={styles.secondaryButton} onClick={() => setCapturedImage(null)}>
                                    Retake
                                </button>
                                <button className={styles.button} onClick={() => setStep(2)}>
                                    Continue <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {step >= 2 && step < 6 && (
                    <motion.div
                        key={`q${step}`}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className={styles.card}
                    >
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${((step - 1) / 4) * 100}%` }} />
                        </div>
                        <h2 className={styles.question}>{questions[step - 2]}</h2>
                        <p className={styles.thoughtDisplay}>"{thought}"</p>

                        <textarea
                            className={styles.textarea}
                            placeholder="Your answer..."
                            style={{ minHeight: '150px' }}
                        />

                        <button className={styles.button} onClick={() => setStep(step + 1)}>
                            Next <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {step === 6 && (
                    <motion.div
                        key="turnaround"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        className={styles.card}
                    >
                        <h2 className={styles.title}>The Turnaround</h2>
                        <p className={styles.description}>Find the opposite of your original thought.</p>
                        <div className={styles.turnaroundBox}>
                            <RefreshCw className="animate-spin-slow mb-4 text-accent" size={32} />
                            <p className={styles.thoughtDisplay}>"{thought}"</p>
                            <ArrowRight className="my-2 text-muted" />
                            <p className={styles.turnaroundText}>
                                "{thought.replace("I am", "I am not").replace("stressed", "at peace")}"
                                <span className="text-sm text-muted block mt-2">(Example)</span>
                            </p>
                        </div>
                        <button className={styles.button} onClick={() => setStep(0)}>
                            Complete <Check size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
