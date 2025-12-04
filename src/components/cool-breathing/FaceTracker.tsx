"use client";

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

interface FaceTrackerProps {
    onBreathChange: (value: number) => void;
}

declare global {
    interface Window {
        FaceMesh: any;
        Camera: any;
    }
}

export default function FaceTracker({ onBreathChange }: FaceTrackerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Dynamically load MediaPipe scripts from CDN
        const loadScripts = async () => {
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

            // Wait for scripts to load
            await new Promise<void>((resolve) => {
                let loadedCount = 0;
                const checkLoaded = () => {
                    loadedCount++;
                    if (loadedCount === 2) resolve();
                };
                faceMeshScript.onload = checkLoaded;
                cameraScript.onload = checkLoaded;
            });

            setIsLoading(false);
        };

        loadScripts();
    }, []);

    useEffect(() => {
        if (isLoading || !webcamRef.current?.video) return;

        const initFaceMesh = async () => {
            const faceMesh = new window.FaceMesh({
                locateFile: (file: string) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                },
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            faceMesh.onResults((results: any) => {
                if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                    const landmarks = results.multiFaceLandmarks[0];

                    // Calculate mouth openness
                    // Upper lip bottom: 13, Lower lip top: 14
                    const upperLip = landmarks[13];
                    const lowerLip = landmarks[14];

                    const distance = Math.sqrt(
                        Math.pow(upperLip.x - lowerLip.x, 2) +
                        Math.pow(upperLip.y - lowerLip.y, 2) +
                        Math.pow(upperLip.z - lowerLip.z, 2)
                    );

                    // Normalize (Closed ~0.01, Open ~0.1)
                    let normalized = (distance - 0.01) * 15;
                    normalized = Math.max(0, Math.min(1, normalized));

                    onBreathChange(normalized);
                }
            });

            const camera = new window.Camera(webcamRef.current!.video, {
                onFrame: async () => {
                    if (webcamRef.current?.video) {
                        await faceMesh.send({ image: webcamRef.current.video });
                    }
                },
                width: 640,
                height: 480,
            });
            camera.start();
            setIsCameraReady(true);
        };

        initFaceMesh();
    }, [isLoading, onBreathChange]);

    return (
        <div className="absolute top-4 right-16 z-50 w-32 h-24 rounded-xl overflow-hidden border border-white/20 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
            <Webcam
                ref={webcamRef}
                audio={false}
                width={128}
                height={96}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user"
                }}
                className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {(!isCameraReady || isLoading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">
                    {isLoading ? 'Loading...' : 'Starting...'}
                </div>
            )}
        </div>
    );
}
