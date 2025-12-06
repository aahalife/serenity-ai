'use client'
import React, { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface GradientCardProps {
    children: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
    children,
    icon,
    className = ""
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    // Handle mouse movement for 3D effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();

            // Calculate mouse position relative to card center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Calculate rotation (limited range for subtle effect)
            const rotateX = -(y / rect.height) * 3; // Max 3 degrees rotation (reduced for subtlety)
            const rotateY = (x / rect.width) * 3; // Max 3 degrees rotation

            setRotation({ x: rotateX, y: rotateY });
        }
    };

    // Reset rotation when not hovering
    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                // Removed preserve-3d as it was causing stacking context issues with content
                backgroundColor: "#0e131f",
                borderRadius: "32px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
            }}
            initial={{ y: 0 }}
            animate={{
                y: isHovered ? -5 : 0,
                // Simplified rotation application
                rotateX: rotation.x,
                rotateY: rotation.y,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {/* Background Layers - Explicitly Lower Z-Index */}

            {/* Dark base */}
            <div className="absolute inset-0 z-0 bg-[#0e131f]" />

            {/* Noise Texture */}
            <div
                className="absolute inset-0 opacity-20 mix-blend-overlay z-1"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Gradient Blobs */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 z-2"
                style={{
                    height: "70%", // Increased height slightly
                    background: `
                        radial-gradient(circle at 20% 100%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 100%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)
                    `,
                    filter: "blur(40px)",
                }}
                animate={{ opacity: isHovered ? 0.8 : 0.5 }}
            />

            {/* Bottom Glow Line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px] z-10"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                }}
                animate={{
                    opacity: isHovered ? 1 : 0.3,
                    boxShadow: isHovered ? "0 0 15px rgba(168, 85, 247, 0.5)" : "none"
                }}
            />

            {/* CONTENT WRAPPER - High Z-Index & Flex Layout */}
            <div
                className="relative z-20 flex flex-col justify-start p-8"
            >
                {icon && (
                    <div className="mb-6 shrink-0">
                        <motion.div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg"
                            animate={{
                                y: isHovered ? -3 : 0,
                                backgroundColor: isHovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"
                            }}
                        >
                            {icon}
                        </motion.div>
                    </div>
                )}

                <div className="w-full text-left">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};
