"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface BreathingCanvasProps {
    breathValue: number; // 0 to 1
    shape: 'sphere' | 'heart' | 'flower' | 'saturn';
    color: string;
}

function Particles({ breathValue, shape, color }: BreathingCanvasProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 3000;

    const positions = useMemo(() => {
        const sphere = new Float32Array(count * 3);
        const heart = new Float32Array(count * 3);
        const flower = new Float32Array(count * 3);
        const saturn = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 2 + Math.random() * 0.5;
            sphere[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            sphere[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            sphere[i * 3 + 2] = r * Math.cos(phi);

            const t = Math.random() * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            heart[i * 3] = (x * 0.15) + (Math.random() - 0.5) * 0.5;
            heart[i * 3 + 1] = (y * 0.15) + (Math.random() - 0.5) * 0.5;
            heart[i * 3 + 2] = (Math.random() - 0.5) * 2;

            const k = 4;
            const thetaFlower = Math.random() * Math.PI * 2;
            const rFlower = Math.cos(k * thetaFlower) * 2 + Math.random() * 0.5;
            flower[i * 3] = rFlower * Math.cos(thetaFlower);
            flower[i * 3 + 1] = rFlower * Math.sin(thetaFlower);
            flower[i * 3 + 2] = (Math.random() - 0.5) * 1;

            if (i < count * 0.7) {
                const rSaturn = 1.5 + Math.random() * 0.2;
                saturn[i * 3] = rSaturn * Math.sin(phi) * Math.cos(theta);
                saturn[i * 3 + 1] = rSaturn * Math.sin(phi) * Math.sin(theta);
                saturn[i * 3 + 2] = rSaturn * Math.cos(phi);
            } else {
                const angle = Math.random() * Math.PI * 2;
                const dist = 2.5 + Math.random() * 1.5;
                saturn[i * 3] = dist * Math.cos(angle);
                saturn[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
                saturn[i * 3 + 2] = dist * Math.sin(angle);
            }
        }
        return { sphere, heart, flower, saturn };
    }, []);

    const currentPositions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const time = state.clock.getElapsedTime();
        const targetPositions = positions[shape];
        // Smoothly interpolate breath value
        // Use a ref to store the smoothed value
        if (!pointsRef.current.userData.smoothedBreath) {
            pointsRef.current.userData.smoothedBreath = 0;
        }

        // Lerp factor: lower = smoother/slower, higher = more responsive
        const lerpFactor = 0.05;
        pointsRef.current.userData.smoothedBreath += (breathValue - pointsRef.current.userData.smoothedBreath) * lerpFactor;

        const smoothedBreath = pointsRef.current.userData.smoothedBreath;
        const scale = 1 + smoothedBreath * 1.5;

        // Restore particle position updates
        for (let i = 0; i < count * 3; i++) {
            currentPositions[i] += (targetPositions[i] - currentPositions[i]) * 0.05;
        }

        const geometry = pointsRef.current.geometry;
        geometry.attributes.position.needsUpdate = true;

        pointsRef.current.scale.set(scale, scale, scale);
        pointsRef.current.rotation.y = time * 0.1;
        pointsRef.current.rotation.z = time * 0.05;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={currentPositions}
                    itemSize={3}
                    args={[currentPositions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color={color}
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function BreathingCanvas(props: BreathingCanvasProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 6], fov: 60 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <color attach="background" args={['#000']} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.5} />
            <Particles {...props} />
            <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
    );
}
