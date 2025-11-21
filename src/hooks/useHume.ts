import { useState, useCallback, useRef, useEffect } from "react";
import { HumeClient } from "hume";

interface UseHumeOptions {
    onEmotion?: (emotions: any) => void;
}

export function useHume(options: UseHumeOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const connect = useCallback(async () => {
        try {
            // In a real app, you should fetch a temporary access token from your backend
            // to avoid exposing your API key on the client.
            // For this demo, we'll use the key directly as requested, but this is not best practice.
            const apiKey = "JpcpAvRho43BvuD5RkF62EajUxJeVz2LQs3LTtd9okeuagQK";
            const socketUrl = `wss://api.hume.ai/v0/stream/models?api_key=${apiKey}`;

            const socket = new WebSocket(socketUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("Hume WebSocket connected");
                setIsConnected(true);
                startAudioStreaming();
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.prosody && data.prosody.predictions) {
                        const emotions = data.prosody.predictions[0]?.emotions;
                        if (emotions) {
                            options.onEmotion?.(emotions);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing Hume message", e);
                }
            };

            socket.onclose = () => {
                console.log("Hume WebSocket closed");
                setIsConnected(false);
                stopAudioStreaming();
            };

            socket.onerror = (error) => {
                console.error("Hume WebSocket error", error);
            };

        } catch (error) {
            console.error("Failed to connect to Hume", error);
        }
    }, [options]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        stopAudioStreaming();
        setIsConnected(false);
    }, []);

    const startAudioStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (e) => {
                if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Convert float32 to base64 encoded int16
                const buffer = convertFloat32ToInt16(inputData);
                const base64Audio = arrayBufferToBase64(buffer);

                socketRef.current.send(JSON.stringify({
                    data: base64Audio,
                    models: {
                        prosody: {}
                    }
                }));
            };
        } catch (error) {
            console.error("Error starting audio stream", error);
        }
    };

    const stopAudioStreaming = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    // Helper functions
    function convertFloat32ToInt16(buffer: Float32Array) {
        let l = buffer.length;
        let buf = new Int16Array(l);
        while (l--) {
            buf[l] = Math.min(1, Math.max(-1, buffer[l])) * 0x7FFF;
        }
        return buf.buffer;
    }

    function arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        connect,
        disconnect,
        isConnected
    };
}
