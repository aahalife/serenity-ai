"use client"

import { useEffect, useRef } from "react"

export function LiquidEffectAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        // Create script element and load dynamically only on client
        const script = document.createElement("script")
        script.type = "module"

        // Use a data URL to avoid build-time analysis
        const scriptContent = `
      (async () => {
        const LiquidBackground = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js').then(m => m.default);
        
        const canvas = document.getElementById('liquid-canvas');
        if (canvas && LiquidBackground) {
          const app = LiquidBackground(canvas);
          // Use a dark blue/navy gradient image - no pink/red
          app.loadImage('https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=800&fit=crop');
          app.liquidPlane.material.metalness = 0.85;
          app.liquidPlane.material.roughness = 0.2;
          app.liquidPlane.uniforms.displacementScale.value = 3;
          app.setRain(false);
          window.__liquidApp = app;
        }
      })();
    `

        const blob = new Blob([scriptContent], { type: 'text/javascript' })
        const url = URL.createObjectURL(blob)
        script.src = url

        document.body.appendChild(script)

        return () => {
            if (window.__liquidApp && window.__liquidApp.dispose) {
                window.__liquidApp.dispose()
            }
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
            URL.revokeObjectURL(url)
        }
    }, [])

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 50%, #0a1a30 100%)'
            }}
        >
            <canvas
                ref={canvasRef}
                id="liquid-canvas"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.6
                }}
            />
        </div>
    )
}

declare global {
    interface Window {
        __liquidApp?: any
    }
}
