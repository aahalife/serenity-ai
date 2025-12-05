import { useState, useCallback, useRef } from "react";

interface UseVoiceOptions {
    onSpeechStart?: () => void;
    onSpeechEnd?: (audioBlob: Blob) => void; // Changed to return Blob
    onSpeakStart?: () => void;
    onSpeakEnd?: () => void;
}

export function useVoice(options: UseVoiceOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState(""); // Kept for compatibility, but might be empty until STT

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    const { onSpeechStart, onSpeechEnd, onSpeakStart, onSpeakEnd } = options;

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Reuse or create AudioContext
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();

            // Ensure context is running (browsers suspend it sometimes)
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let silenceStart = Date.now();
            let isSpeakingDetected = false;
            const silenceThreshold = 1500; // 1.5 seconds of silence to stop
            const volumeThreshold = 15; // Slightly more sensitive (was 20)

            const checkSilence = () => {
                if (mediaRecorder.state !== "recording") return;

                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a, b) => a + b) / bufferLength;

                if (volume > volumeThreshold) {
                    silenceStart = Date.now();
                    if (!isSpeakingDetected) {
                        isSpeakingDetected = true;
                        onSpeechStart?.();
                    }
                } else if (isSpeakingDetected && (Date.now() - silenceStart > silenceThreshold)) {
                    // Silence detected after speech
                    stopListening();
                    return;
                }

                requestAnimationFrame(checkSilence);
            };

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstart = () => {
                setIsListening(true);
                checkSilence(); // Start VAD loop
            };

            mediaRecorder.onstop = () => {
                setIsListening(false);
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onSpeechEnd?.(blob);

                // Stop all tracks and close context
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();
            };

            mediaRecorder.start();
        } catch (e) {
            console.error("Failed to start recording", e);
            setIsListening(false);
        }
    }, [onSpeechStart, onSpeechEnd]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    }, []);

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
        stopListening();
    }, [isSpeaking, onSpeakEnd, stopListening]);

    return {
        isListening,
        isSpeaking,
        transcript, // Will be empty in this mode until we get it back from server
        startListening,
        stopListening,
        speak,
        stop
    };
}
