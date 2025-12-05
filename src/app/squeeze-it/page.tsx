"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('../../components/zenparticles/Scene'), { ssr: false });
const Controls = dynamic(() => import('../../components/zenparticles/Controls'), { ssr: false });
const HandController = dynamic(() => import('../../components/zenparticles/HandController'), { ssr: false });
const AudioPlayer = dynamic(() => import('../../components/zenparticles/AudioPlayer'), { ssr: false });
import { ParticleState, ShapeType, HandStatus, SavedShape } from '../../components/zenparticles/types';

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
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans">

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
            <HandController onUpdate={handleHandUpdate} />

            {/* Hand Status Indicator for User Feedback */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 md:left-40 md:translate-x-0 pointer-events-none transition-all duration-500"
                style={{
                    opacity: handStatus.present ? 1 : 0,
                    transform: handStatus.present ? 'translateY(0)' : 'translateY(20px)'
                }}>
                <div className="bg-white/10 backdrop-blur-md rounded-full px-5 py-3 flex items-center gap-3 border border-white/20 shadow-2xl">
                    <div
                        className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)] animate-pulse"
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Hand Connected</span>
                        <span className="text-xs text-white font-medium">
                            {Math.round(handStatus.openness * 100)}% Open
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
};
