"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { generatePoints } from './utils/geometry';
import { ParticleState, HandStatus, ShapeType } from './types';

interface SceneProps {
    state: ParticleState;
    handStatus: HandStatus;
}

const PARTICLE_COUNT = 3000;

// --- Custom Shader Material for Stress Ball ---
// This handles the planar decal projection and the stress gradient effect
const StressBallMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color(0.2, 0.6, 1.0),
        uTexture: null,
        uSqueeze: 0, // 0 (relaxed) to 1 (fully squeezed)
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;
    void main() {
      vUv = uv;
      // Normal matrix transforms normal to view space
      vNormal = normalize(normalMatrix * normal);
      // Pass local position for planar mapping
      vPos = position; 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform vec3 uColor;
    uniform sampler2D uTexture;
    uniform float uSqueeze;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;

    void main() {
      // 1. Planar Mapping (Decal style)
      // Map local X/Y to UVs. 
      // Sphere radius is ~1.2. We map -1.2..1.2 to 0..1
      vec2 planarUV = vPos.xy * 0.42 + 0.5; 
      
      // 2. Sample Texture
      vec4 texColor = texture2D(uTexture, planarUV);
      
      // 3. Masking
      // Only show texture on front face (local Z > 0)
      // And fade out towards the edges of the circle
      float dist = length(vPos.xy);
      float alpha = 1.0 - smoothstep(0.9, 1.2, dist); 
      
      // Base color
      vec3 finalColor = uColor;
      
      // Apply texture if on front face and within bounds
      // vPos.z > 0.1 ensures we only paint the front hemisphere
      if (vPos.z > 0.1 && planarUV.x >= 0.0 && planarUV.x <= 1.0 && planarUV.y >= 0.0 && planarUV.y <= 1.0) {
         finalColor = mix(finalColor, texColor.rgb, texColor.a * alpha);
      }
      
      // 4. Lighting (Simple Rim + Soft Directional)
      // vNormal is in view space. Camera is at (0,0,0) looking down -Z.
      // View vector is (0,0,1).
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      float NdotL = max(dot(vNormal, normalize(vec3(0.5, 0.8, 1.0))), 0.0);
      
      // Rim / Fresnel calculation for the edge glow
      float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
      rim = pow(rim, 2.5);
      
      // 5. Stress Gradient
      // When squeezed (uSqueeze high), mix in a hot color at the edges (rim)
      vec3 stressColor = vec3(1.0, 0.3, 0.2); // Red/Orange glow
      
      // Intensity increases with squeeze amount
      float stressIntensity = rim * uSqueeze * 1.5; 
      
      finalColor = mix(finalColor, stressColor, stressIntensity);
      
      // Apply basic diffuse shadow
      finalColor *= (0.7 + 0.3 * NdotL);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ StressBallMaterial });

// Type definitions for the custom material
declare module '@react-three/fiber' {
    interface ThreeElements {
        stressBallMaterial: any;
    }
}

// --- Smoothing Hook ---
const useSmoothedValue = (target: number, speed: number = 2.0) => {
    const current = useRef(target);
    useFrame((state, delta) => {
        current.current = THREE.MathUtils.lerp(current.current, target, delta * speed);
    });
    return current;
};

// --- Solid Stress Ball Component ---
const StressBall: React.FC<{ textureUrl: string; color: string; handStatus: HandStatus }> = ({ textureUrl, color, handStatus }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Load texture
    const texture = useMemo(() => new THREE.TextureLoader().load(textureUrl), [textureUrl]);

    // Calculate Squeeze Factor (0 = relaxed, 1 = fully squeezed)
    // If hand not present, 0.
    // If hand present, openness 1 -> squeeze 0. openness 0 -> squeeze 1.
    const targetSqueeze = handStatus.present ? (1.0 - handStatus.openness) : 0;

    // Heavily smooth the squeeze value for physics feel
    const smoothedSqueeze = useSmoothedValue(targetSqueeze, 3.0);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        const squeeze = smoothedSqueeze.current;

        // --- Physics: Squash and Stretch ---
        // Volume preservation: if Y shrinks, X and Z must grow.
        // Base scale is 1.0
        // Max squeeze: Y scales down to 0.6, X/Z scale up to 1.3

        const scaleY = 1.0 - (squeeze * 0.4);
        const scaleXZ = 1.0 + (squeeze * 0.3);

        meshRef.current.scale.set(scaleXZ, scaleY, scaleXZ);

        // --- Update Shader Uniforms ---
        materialRef.current.uniforms.uSqueeze.value = squeeze;
        materialRef.current.uniforms.uColor.value.set(color);
        // texture is auto-updated by prop, but we ensure it's set
    });

    return (
        <mesh ref={meshRef} rotation={[0, 0, 0]}>
            {/* High segment count for smooth deformation lighting */}
            <sphereGeometry args={[1.3, 128, 128]} />
            <stressBallMaterial
                ref={materialRef}
                uTexture={texture}
                transparent
            />
        </mesh>
    );
};

// --- Particle Cloud Component ---
const ParticleMesh: React.FC<{ state: ParticleState; handStatus: HandStatus }> = ({ state, handStatus }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const targetPositions = useMemo(() => generatePoints(state.shape, PARTICLE_COUNT, state.customPoints), [state.shape, state.customPoints]);

    const currentPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize
    useEffect(() => {
        if (meshRef.current) {
            for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
                currentPositions.current[i] = (Math.random() - 0.5) * 5;
            }
        }
    }, []);

    const targetScale = handStatus.present ? 0.2 + (handStatus.openness * 1.3) : 1.0;
    const smoothedGlobalScale = useSmoothedValue(targetScale, 1.5);

    const targetRotX = handStatus.present ? -handStatus.tiltY * 0.5 : 0;
    const targetRotY = handStatus.present ? handStatus.tiltX * 0.5 : 0;
    const smoothedRotX = useSmoothedValue(targetRotX, 3.0);
    const smoothedRotY = useSmoothedValue(targetRotY, 3.0);

    useFrame((rState, delta) => {
        if (!meshRef.current) return;

        if (handStatus.present) {
            meshRef.current.rotation.x = smoothedRotX.current;
            meshRef.current.rotation.y = smoothedRotY.current;
        } else {
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 2);
            if (state.shape === ShapeType.CUSTOM) {
                meshRef.current.rotation.y += delta * 0.3;
            } else {
                meshRef.current.rotation.y = Math.sin(rState.clock.elapsedTime * 0.2) * 0.2;
            }
        }

        let s = smoothedGlobalScale.current;
        if (!handStatus.present) {
            s += Math.sin(rState.clock.elapsedTime * 0.5) * 0.1;
        }

        const color = new THREE.Color(state.color);
        const PARTICLE_DAMPING = 3.0;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const idx = i * 3;

            const tx = targetPositions[idx];
            const ty = targetPositions[idx + 1];
            const tz = targetPositions[idx + 2];

            const cx = currentPositions.current[idx];
            const cy = currentPositions.current[idx + 1];
            const cz = currentPositions.current[idx + 2];

            const lx = (tx * s - cx) * (delta * PARTICLE_DAMPING);
            const ly = (ty * s - cy) * (delta * PARTICLE_DAMPING);
            const lz = (tz * s - cz) * (delta * PARTICLE_DAMPING);

            currentPositions.current[idx] += lx;
            currentPositions.current[idx + 1] += ly;
            currentPositions.current[idx + 2] += lz;

            dummy.position.set(
                currentPositions.current[idx],
                currentPositions.current[idx + 1],
                currentPositions.current[idx + 2]
            );

            dummy.rotation.set(0, 0, 0);
            dummy.scale.setScalar(0.015);
            dummy.updateMatrix();

            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, color);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
                color="#ffffff"
                emissive={state.color}
                emissiveIntensity={0.6}
                roughness={0.1}
                metalness={0.8}
            />
        </instancedMesh>
    );
};

const Scene: React.FC<SceneProps> = (props) => {
    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(to bottom right, #111827, #000000)'
        }}>
            <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="blue" intensity={0.5} />

                {props.state.texture ? (
                    <StressBall
                        textureUrl={props.state.texture}
                        color={props.state.color}
                        handStatus={props.handStatus}
                    />
                ) : (
                    <ParticleMesh {...props} />
                )}

                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
};

export default Scene;
