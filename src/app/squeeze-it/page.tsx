"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './SqueezeIt.module.css';
import { ParticleState, ShapeType, HandStatus, SavedShape } from '../../components/zenparticles/types';

const Scene = dynamic(() => import('../../components/zenparticles/Scene'), { ssr: false });
const Controls = dynamic(() => import('../../components/zenparticles/Controls'), { ssr: false });
const HandController = dynamic(() => import('../../components/zenparticles/HandController'), { ssr: false });
const AudioPlayer = dynamic(() => import('../../components/zenparticles/AudioPlayer'), { ssr: false });

export default function SqueezeItPage() {
    const [particleState, setParticleState] = useState<ParticleState>({
        count: 3000,
        color: '#3b82f6',
        shape: ShapeType.SPHERE,
        texture: null
    });

    const [savedShapes, setSavedShapes] = useState<SavedShape[]>([]);
    const [activeSavedShapeId, setActiveSavedShapeId] = useState<string>('');

    const [handStatus, setHandStatus] = useState<HandStatus>({
        present: false,
        openness: 1,
        tiltX: 0,
        tiltY: 0
    });

    const handleShapeChange = (shape: ShapeType) => {
        setParticleState(prev => ({ ...prev, shape }));
    };

    const handleColorChange = (color: string) => {
        setParticleState(prev => ({ ...prev, color }));
    };

    const handleCustomPoints = (points: [number, number, number][]) => {
        setParticleState(prev => ({ ...prev, customPoints: points }));
    };

    const handleTextureChange = (url: string | null) => {
        setParticleState(prev => ({ ...prev, texture: url }));
    };

    const handleAddSavedShape = (shape: SavedShape) => {
        setSavedShapes(prev => [...prev, shape]);
    };

    const handleSelectSavedShape = (id: string) => {
        setActiveSavedShapeId(id);
    };

    const handleHandUpdate = useCallback((status: HandStatus) => {
        setHandStatus(status);
    }, []);

    return (
        <div className={styles.container}>

            {/* Background Music */}
            <AudioPlayer />

            {/* 3D Scene */}
            <Scene state={particleState} handStatus={handStatus} />

            {/* UI Controls */}
            <Controls
                currentShape={particleState.shape}
                currentColor={particleState.color}
                savedShapes={savedShapes}
                activeSavedShapeId={activeSavedShapeId}
                onShapeChange={handleShapeChange}
                onColorChange={handleColorChange}
                onCustomPoints={handleCustomPoints}
                onAddSavedShape={handleAddSavedShape}
                onSelectSavedShape={handleSelectSavedShape}
                onTextureChange={handleTextureChange}
            />

            {/* Hand Tracker (Hidden/Mini) */}
            <div className={styles.webcamContainer}
                style={{ opacity: handStatus.present ? 1 : 0.5 }}>
                <HandController onUpdate={handleHandUpdate} />
            </div>

            {/* Hand Status Indicator for User Feedback */}
            <div className={styles.statusPill}
                style={{
                    opacity: handStatus.present ? 1 : 0,
                    transform: handStatus.present ? 'translateY(0)' : 'translateY(20px)'
                }}>
                <div className={styles.statusContent}>
                    <div className={styles.statusDot} />
                    <div className={styles.statusTextContainer}>
                        <span className={styles.statusLabel}>Hand Connected</span>
                        <span className={styles.statusValue}>
                            {Math.round(handStatus.openness * 100)}% Open
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
};
