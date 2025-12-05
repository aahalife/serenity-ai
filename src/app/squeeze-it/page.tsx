import styles from './SqueezeIt.module.css';

// ... imports ...

export default function SqueezeItPage() {
    // ... state ...

    // ... handlers ...

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
