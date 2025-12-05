"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ShapeType, SavedShape } from './types';
import { Heart, Flower, Globe, Sparkles, User, Palette, Wand2, Plus, Star, ChevronRight, Menu, Image as ImageIcon, Upload } from 'lucide-react';
import clsx from 'clsx';
import styles from './Controls.module.css';

interface ControlsProps {
    currentShape: ShapeType;
    currentColor: string;
    savedShapes: SavedShape[];
    activeSavedShapeId?: string;
    onShapeChange: (s: ShapeType) => void;
    onColorChange: (c: string) => void;
    onCustomPoints: (points: [number, number, number][]) => void;
    onAddSavedShape: (shape: SavedShape) => void;
    onSelectSavedShape: (id: string) => void;
    onTextureChange: (url: string | null) => void;
}

const PRESETS = [
    { id: ShapeType.HEART, icon: Heart, label: 'Heart' },
    { id: ShapeType.FLOWER, icon: Flower, label: 'Flower' },
    { id: ShapeType.SATURN, icon: Globe, label: 'Saturn' },
    { id: ShapeType.BUDDHA, icon: User, label: 'Buddha' },
    { id: ShapeType.FIREWORKS, icon: Sparkles, label: 'Fireworks' },
];

const COLORS = [
    '#ef4444', // Red
    '#e879f9', // Pink
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#22d3ee', // Cyan
    '#34d399', // Emerald
    '#facc15', // Yellow
    '#ffffff', // White
];

const Controls: React.FC<ControlsProps> = ({
    currentShape,
    currentColor,
    savedShapes,
    activeSavedShapeId,
    onShapeChange,
    onColorChange,
    onCustomPoints,
    onAddSavedShape,
    onSelectSavedShape,
    onTextureChange
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [magicPrompt, setMagicPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    }, []);

    const handleMagicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!magicPrompt.trim() || isGenerating) return;

        setIsGenerating(true);

        try {
            const res = await fetch('/api/gemini/generate-shape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: magicPrompt })
            });

            if (res.ok) {
                const data = await res.json();
                const points = data.points;

                if (points && points.length > 0) {
                    const newShape: SavedShape = {
                        id: `custom-${Date.now()}`,
                        label: magicPrompt.charAt(0).toUpperCase() + magicPrompt.slice(1),
                        points: points
                    };

                    onAddSavedShape(newShape);
                    onCustomPoints(points);
                    onShapeChange(ShapeType.CUSTOM);
                    onSelectSavedShape(newShape.id);
                    onTextureChange(null);
                }
            } else {
                console.error("Failed to generate shape");
            }
        } catch (err) {
            console.error("Error generating shape:", err);
        }

        setIsGenerating(false);
        setMagicPrompt('');
    };

    const handlePresetClick = (type: ShapeType) => {
        onShapeChange(type);
        onSelectSavedShape('');
        onCustomPoints([]);
        onTextureChange(null);
    };

    const handleSavedShapeClick = (shape: SavedShape) => {
        onCustomPoints(shape.points);
        onShapeChange(ShapeType.CUSTOM);
        onSelectSavedShape(shape.id);
        onTextureChange(null);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        onTextureChange(url);

        onShapeChange(ShapeType.CUSTOM);
        onSelectSavedShape('photo-mode');

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={styles.container}>

            <div className={clsx(styles.panelWrapper, isOpen ? styles.open : styles.closed)}>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={styles.toggleButton}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                    {isOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
                </button>

                <div className={styles.panel}>

                    <div className={styles.header}>
                        <h2 className={styles.title}>
                            <span className={styles.zenText}>Zen</span>Particles
                        </h2>
                        <p className={styles.description}>
                            Use gestures to control the flow. <br />
                            <span className={styles.descriptionSub}>Open palm to expand, fist to squeeze.</span>
                        </p>
                    </div>

                    <div className={styles.controlsStack}>

                        {/* AI Generator */}
                        <div>
                            <label className={styles.sectionLabel}>
                                <Wand2 size={10} color="#c084fc" />
                                AI Generator
                            </label>
                            <form onSubmit={handleMagicSubmit} className={styles.inputGroup}>
                                <div className={styles.inputBlur}></div>
                                <input
                                    type="text"
                                    value={magicPrompt}
                                    onChange={(e) => setMagicPrompt(e.target.value)}
                                    placeholder={isGenerating ? "Dreaming..." : "Type a shape..."}
                                    disabled={isGenerating}
                                    className={styles.input}
                                />
                                <button
                                    type="submit"
                                    disabled={isGenerating || !magicPrompt}
                                    className={styles.actionButton}
                                >
                                    {isGenerating ? <Wand2 size={16} className={styles.animateSpin} /> : <Plus size={16} />}
                                </button>
                            </form>
                        </div>

                        {/* Photo Upload (Stress Ball Mode) */}
                        <div>
                            <label className={styles.sectionLabel}>
                                <ImageIcon size={10} color="#60a5fa" />
                                Stress Ball Mode
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={styles.uploadBox}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className={styles.hidden}
                                    onChange={handlePhotoUpload}
                                />
                                <div className={styles.uploadIconWrapper}>
                                    <Upload size={16} color="#60a5fa" />
                                </div>
                                <span className={styles.uploadText}>Upload Photo</span>
                                <span className={styles.uploadSubText}>Stamps your photo onto a 3D ball</span>
                            </div>
                        </div>

                        {/* Shape Selectors */}
                        <div>
                            <label className={styles.sectionLabel}>Library</label>
                            <div className={styles.grid}>
                                {PRESETS.map((preset) => {
                                    const Icon = preset.icon;
                                    const isActive = currentShape === preset.id && activeSavedShapeId !== 'photo-mode';
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => handlePresetClick(preset.id)}
                                            className={clsx(styles.gridButton, isActive && styles.active)}
                                        >
                                            <Icon size={20} className={styles.gridButtonIcon} />
                                            <span className={styles.gridButtonLabel}>{preset.label}</span>
                                        </button>
                                    );
                                })}

                                {savedShapes.map((shape) => {
                                    const isActive = currentShape === ShapeType.CUSTOM && activeSavedShapeId === shape.id;
                                    return (
                                        <button
                                            key={shape.id}
                                            onClick={() => handleSavedShapeClick(shape)}
                                            className={clsx(styles.gridButton, isActive && styles.active)}
                                        >
                                            <Star size={20} className={clsx(styles.gridButtonIcon, isActive && styles.activeStarIcon)} />
                                            <span className={styles.gridButtonLabel} title={shape.label}>{shape.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className={styles.sectionLabel}>
                                <Palette size={10} />
                                Theme
                            </label>
                            <div className={styles.colorGrid}>
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => onColorChange(c)}
                                        className={clsx(styles.colorButton, currentColor === c && styles.active)}
                                        style={{ backgroundColor: c }}
                                        aria-label={`Select color ${c}`}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className={styles.footer}>
                        <div className={styles.footerText}>
                            <span>Gemini 2.5 Flash</span>
                            <span>v1.2.0</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Controls;
