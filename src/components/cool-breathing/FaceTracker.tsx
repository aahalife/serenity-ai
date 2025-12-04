"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff } from 'lucide-react';

interface FaceTrackerProps {
    onBreathChange: (value: number) => void;
    isEnabled: boolean;
    onToggle: () => void;
}

declare global {
    interface Window {
        FaceMesh: any;
        Camera: any;
    }
}

export default function FaceTracker({ onBreathChange, isEnabled, onToggle }: FaceTrackerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const faceMeshRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // Load MediaPipe scripts
    useEffect(() => {
        if (scriptsLoaded) return;

        const loadScripts = async () => {
            // Check if already loaded
            if (window.FaceMesh && window.Camera) {
                setScriptsLoaded(true);
                setIsLoading(false);
                return;
            }

            // Load Face Mesh
            const faceMeshScript = document.createElement('script');
            faceMeshScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
            faceMeshScript.crossOrigin = 'anonymous';
            document.head.appendChild(faceMeshScript);

            // Load Camera Utils
            const cameraScript = document.createElement('script');
            cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
            cameraScript.crossOrigin = 'anonymous';
            document.head.appendChild(cameraScript);

            await new Promise<void>((resolve) => {
                let loadedCount = 0;
                const checkLoaded = () => {
                    loadedCount++;
                    if (loadedCount === 2) resolve();
                };
                faceMeshScript.onload = checkLoaded;
                cameraScript.onload = checkLoaded;
            });

            setScriptsLoaded(true);
            setIsLoading(false);
        };

        loadScripts();
    }, [scriptsLoaded]);

    // Initialize FaceMesh when enabled
    useEffect(() => {
        if (!isEnabled || !scriptsLoaded || !webcamRef.current?.video) return;

        const initFaceMesh = async () => {
            const faceMesh = new window.FaceMesh({
                locateFile: (file: string) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                },
            });
            faceMeshRef.current = faceMesh;

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            faceMesh.onResults((results: any) => {
                if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                    const landmarks = results.multiFaceLandmarks[0];

                    // Calculate mouth openness (landmarks 13 & 14)
                    const upperLip = landmarks[13];
                    const lowerLip = landmarks[14];

                    const distance = Math.sqrt(
                        Math.pow(upperLip.x - lowerLip.x, 2) +
                        Math.pow(upperLip.y - lowerLip.y, 2) +
                        Math.pow(upperLip.z - lowerLip.z, 2)
                    );

                    let normalized = (distance - 0.01) * 15;
                    normalized = Math.max(0, Math.min(1, normalized));

                    onBreathChange(normalized);
                }
            });

            const camera = new window.Camera(webcamRef.current!.video, {
                onFrame: async () => {
                    if (webcamRef.current?.video && faceMeshRef.current) {
                        await faceMeshRef.current.send({ image: webcamRef.current.video });
                    }
                },
                width: 640,
                height: 480,
            });
            cameraRef.current = camera;
            camera.start();
            setIsCameraReady(true);
        };

        initFaceMesh();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }
        };
    }, [isEnabled, scriptsLoaded, onBreathChange]);

    // Stop camera when disabled
    useEffect(() => {
        if (!isEnabled && cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
            setIsCameraReady(false);
        }
    }, [isEnabled]);

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onToggle}
                disabled={isLoading}
                className={`p-3 rounded-full backdrop-blur-md transition-all ${isEnabled
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                        : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                    }`}
                title={isEnabled ? 'Disable Face Tracking' : 'Enable Face Tracking'}
            >
                {isEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>

            {isEnabled && (
                <div className="w-20 h-14 sm:w-24 sm:h-16 md:w-28 md:h-20 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        width={112}
                        height={80}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            width: { ideal: 640 },
                            height: { ideal: 480 },
                            facingMode: "user"
                        }}
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    {(!isCameraReady || isLoading) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] text-white">
                            {isLoading ? 'Loading...' : 'Starting...'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
