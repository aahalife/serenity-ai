"use client"
import { MeshGradient } from "@paper-design/shaders-react"

export default function MeshBackground() {
    return (
        <>
            {/* SVG Filters */}
            <svg className="absolute inset-0 w-0 h-0 pointer-events-none">
                <defs>
                    <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
                        <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
                        <feColorMatrix
                            type="matrix"
                            values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
                            result="tint"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Primary Mesh Gradient */}
            <MeshGradient
                className="absolute inset-0 w-full h-full"
                colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
                speed={0.3}
            />

            {/* Secondary Overlay */}
            <MeshGradient
                className="absolute inset-0 w-full h-full opacity-60"
                colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
                speed={0.2}
            />
        </>
    )
}
