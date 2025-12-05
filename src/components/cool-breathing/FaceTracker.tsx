"use client";

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

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
            if (window.FaceMesh && window.Camera) {
                setScriptsLoaded(true);
                setIsLoading(false);
                return;
            }

            const faceMeshScript = document.createElement('script');
            faceMeshScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
            faceMeshScript.crossOrigin = 'anonymous';
            document.head.appendChild(faceMeshScript);

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

    if (!isEnabled) return null;

    return (
        <div className="lg-wrap">
            <div className="lg-shadow" />
            <div className="lg-content">
                <div className="lg-inner !p-2">
                    <div className="relative w-40 h-28 sm:w-48 sm:h-32 md:w-56 md:h-40 rounded-xl overflow-hidden">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            width={224}
                            height={160}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: { ideal: 640 },
                                height: { ideal: 480 },
                                facingMode: "user"
                            }}
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {(!isCameraReady || isLoading) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                                {isLoading ? 'Loading AI...' : 'Starting...'}
                            </div>
                        )}
                        {isCameraReady && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500/30 backdrop-blur-sm rounded-md text-[10px] text-green-300 border border-green-400/30">
                                Face Tracking Active
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
