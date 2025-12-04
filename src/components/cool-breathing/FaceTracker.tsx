"use client";

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

interface FaceTrackerProps {
    onBreathChange: (value: number) => void;
}

export default function FaceTracker({ onBreathChange }: FaceTrackerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];

                // Calculate mouth openness
                // Upper lip bottom: 13
                // Lower lip top: 14
                const upperLip = landmarks[13];
                const lowerLip = landmarks[14];

                // Calculate distance
                const distance = Math.sqrt(
                    Math.pow(upperLip.x - lowerLip.x, 2) +
                    Math.pow(upperLip.y - lowerLip.y, 2) +
                    Math.pow(upperLip.z - lowerLip.z, 2)
                );

                // Normalize distance (approximate range based on testing)
                // Closed ~0.01, Open ~0.1
                // We want a value between 0 and 1
                let normalized = (distance - 0.01) * 15;
                normalized = Math.max(0, Math.min(1, normalized));

                // Smooth the value
                onBreathChange(normalized);
            }
        });

        if (typeof window !== "undefined" && webcamRef.current && webcamRef.current.video) {
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (webcamRef.current && webcamRef.current.video) {
                        await faceMesh.send({ image: webcamRef.current.video });
                    }
                },
                width: 640,
                height: 480,
            });
            camera.start();
            setIsCameraReady(true);
        }

        return () => {
            faceMesh.close();
        };
    }, [onBreathChange]);

    return (
        <div className="absolute top-4 right-4 z-50 w-32 h-24 rounded-xl overflow-hidden border border-white/20 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
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
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror
            />
            {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">
                    Loading...
                </div>
            )}
        </div>
    );
}
