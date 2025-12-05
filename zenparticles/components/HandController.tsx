import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandStatus } from '../types';

interface HandControllerProps {
  onUpdate: (status: HandStatus) => void;
}

const HandController: React.FC<HandControllerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const requestRef = useRef<number>(0);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let running = true;

    const init = async () => {
      try {
        // Use exact version match for WASM to avoid delegate errors
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        
        if (!running) return;

        try {
          handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
          });
        } catch (gpuError) {
          console.warn("GPU delegate failed, falling back to CPU", gpuError);
          // Fallback to CPU if GPU fails
          handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "CPU"
            },
            runningMode: "VIDEO",
            numHands: 1
          });
        }
        
        setIsLoaded(true);
        startWebcam();
      } catch (e) {
        console.error("Failed to load MediaPipe:", e);
      }
    };

    init();

    return () => {
      running = false;
      cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWebcam = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: "user" } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    } catch (err) {
      console.error("Webcam error:", err);
    }
  };

  const predictWebcam = () => {
    if (!videoRef.current || !handLandmarkerRef.current) return;
    
    // Process frame
    const startTimeMs = performance.now();
    if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      try {
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        
        let status: HandStatus = {
          present: false,
          openness: 1,
          tiltX: 0,
          tiltY: 0
        };

        if (results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // Calculate "openness" roughly by distance of fingertips to wrist (landmark 0)
          // Wrist: 0, IndexTip: 8, MiddleTip: 12, RingTip: 16, PinkyTip: 20
          // Normalized roughly.
          
          const wrist = landmarks[0];
          const tips = [8, 12, 16, 20];
          let avgDist = 0;
          
          tips.forEach(idx => {
            const dx = landmarks[idx].x - wrist.x;
            const dy = landmarks[idx].y - wrist.y;
            const dz = landmarks[idx].z - wrist.z;
            avgDist += Math.sqrt(dx*dx + dy*dy + dz*dz);
          });
          avgDist /= tips.length;

          // Empirical values: Fist ~ 0.15-0.2, Open Palm ~ 0.4-0.5
          // We normalize this to 0-1 range.
          const minOpen = 0.15;
          const maxOpen = 0.45;
          const openness = Math.min(Math.max((avgDist - minOpen) / (maxOpen - minOpen), 0), 1);

          // Calculate tilt based on wrist vs middle finger MCP (9)
          const middleMCP = landmarks[9];
          const tiltX = (middleMCP.x - wrist.x) * 2; // -1 to 1 roughly
          const tiltY = (middleMCP.y - wrist.y) * 2;

          status = {
            present: true,
            openness,
            tiltX,
            tiltY
          };
        }

        onUpdate(status);
      } catch (e) {
        console.warn("Detection error:", e);
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-black/50 backdrop-blur-md w-32 h-24 transition-opacity duration-500" style={{ opacity: isLoaded ? 1 : 0 }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="w-full h-full object-cover transform -scale-x-100 opacity-60 hover:opacity-100 transition-opacity"
      />
      {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-xs text-white">Loading Vision...</div>}
    </div>
  );
};

export default HandController;