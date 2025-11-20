import { useState, useEffect, useRef, useCallback } from "react";

interface UseVoiceOptions {
    onSpeechStart?: () => void;
    onSpeechEnd?: (text: string) => void;
}

export function useVoice({ onSpeechStart, onSpeechEnd }: UseVoiceOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");

    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                onSpeechStart?.();
            };

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                setTranscript(transcript);

                // Simple VAD: Reset silence timer on every result
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    if (event.results[current].isFinal) {
                        onSpeechEnd?.(transcript);
                        setTranscript("");
                    }
                }, 1500); // 1.5s silence = end of speech
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                // Auto-restart if supposed to be listening
                if (isListening) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        setIsListening(false);
                    }
                }
            };
        }
    }, [isListening, onSpeechStart, onSpeechEnd]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting recognition:", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);

            // Try to find a good voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        speak
    };
}
