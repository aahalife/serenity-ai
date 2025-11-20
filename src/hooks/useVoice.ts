import { useState, useEffect, useCallback, useRef } from "react";

interface UseVoiceOptions {
    onSpeechStart?: () => void;
    onSpeechEnd?: (text: string) => void;
    onSpeakStart?: () => void;
    onSpeakEnd?: () => void;
}

export function useVoice(options: UseVoiceOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null); // Using any for SpeechRecognition to avoid type issues
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { onSpeechStart, onSpeechEnd, onSpeakStart, onSpeakEnd } = options;

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            setIsListening(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                setIsListening(true);
                onSpeechStart?.();
            };

            recognition.onend = () => {
                setIsListening(false);
                // Don't call onSpeechEnd here, wait for final result or silence
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(finalTranscript);
                    // Reset silence timer
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = setTimeout(() => {
                        stopListening();
                        onSpeechEnd?.(finalTranscript);
                    }, 2000);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
        };
    }, [onSpeechStart, onSpeechEnd, stopListening]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                onSpeechStart?.();
            } catch (e) {
                console.error("Speech recognition error", e);
            }
        }
    }, [onSpeechStart]);

    const speak = useCallback(async (text: string) => {
        if (!text) return;

        // Stop any currently playing audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = "";
            currentAudioRef.current = null;
        }

        setIsSpeaking(true);
        onSpeakStart?.();

        try {
            const response = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error("TTS failed");

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                onSpeakEnd?.();
                URL.revokeObjectURL(audioUrl);
                if (currentAudioRef.current === audio) {
                    currentAudioRef.current = null;
                }
            };

            audio.onerror = (e) => {
                console.error("Audio playback error:", e);
                setIsSpeaking(false);
                onSpeakEnd?.();
                URL.revokeObjectURL(audioUrl);
                if (currentAudioRef.current === audio) {
                    currentAudioRef.current = null;
                }
            };

            audio.play();
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
            onSpeakEnd?.();
        }
    }, [onSpeakStart, onSpeakEnd]);

    const stop = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = "";
            currentAudioRef.current = null;
        }
        if (isSpeaking) {
            setIsSpeaking(false);
            onSpeakEnd?.();
        }
    }, [isSpeaking, onSpeakEnd]);

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        speak,
        stop
    };
}
