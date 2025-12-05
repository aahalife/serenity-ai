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
            className={`relative rounded-3xl overflow-hidden ${className}`}
            style={{
                transformStyle: "preserve-3d",
                backgroundColor: "#0e131f",
                boxShadow: "0 -10px 100px 10px rgba(78, 99, 255, 0.15), 0 0 10px 0 rgba(0, 0, 0, 0.5)",
            }}
            initial={{ y: 0 }}
            animate={{
                y: isHovered ? -5 : 0,
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
            {/* Subtle glass reflection overlay */}
            <motion.div
                className="absolute inset-0 z-30 pointer-events-none"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)",
                    backdropFilter: "blur(2px)",
                }}
                animate={{
                    opacity: isHovered ? 0.7 : 0.5,
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Dark background gradient */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "linear-gradient(180deg, #0a0f1e 0%, #050810 100%)",
                }}
            />

            {/* Noise texture overlay */}
            <div
                className="absolute inset-0 opacity-20 mix-blend-overlay z-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Purple/blue glow effect - VERY VISIBLE */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1/3 z-20"
                style={{
                    background: `
            radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.95) -10%, rgba(79, 70, 229, 0.3) 50%),
            radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.95) -10%, rgba(79, 70, 229, 0.3) 50%)
          `,
                    filter: "blur(25px)",
                }}
                animate={{
                    opacity: isHovered ? 1 : 0.95,
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Central purple glow - VERY PROMINENT */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1/3 z-20"
                style={{
                    background: `radial-gradient(ellipse at bottom center, rgba(161, 58, 229, 1) -40%, rgba(79, 70, 229, 0.5) 35%, transparent 65%)`,
                    filter: "blur(30px)",
                }}
                animate={{
                    opacity: isHovered ? 1 : 0.9,
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Solid gradient band at very bottom - ALWAYS VISIBLE */}
            <div
                className="absolute bottom-0 left-0 right-0 h-24 z-20"
                style={{
                    background: 'linear-gradient(to top, rgba(161, 58, 229, 0.6), rgba(79, 70, 229, 0.4), transparent)',
                    pointerEvents: 'none'
                }}
            />
            {/* Enhanced bottom border glow */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
                style={{
                    background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)",
                }}
                animate={{
                    boxShadow: isHovered
                        ? "0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7)"
                        : "0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6)",
                    opacity: isHovered ? 1 : 0.9,
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Card content */}
            <motion.div
                className="relative z-40"
                style={{ padding: '2rem' }}
                animate={{
                    z: 2
                }}
            >
                {icon && (
                    <motion.div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                        style={{
                            background: "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        initial={{ filter: "blur(3px)", opacity: 0.7 }}
                        animate={{
                            filter: "blur(0px)",
                            opacity: 1,
                            boxShadow: isHovered
                                ? "0 8px 16px -2px rgba(0, 0, 0, 0.3), 0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.7)"
                                : "0 6px 12px -2px rgba(0, 0, 0, 0.25), 0 3px 6px -1px rgba(0, 0, 0, 0.15), inset 1px 1px 3px rgba(255, 255, 255, 0.12), inset -2px -2px 4px rgba(0, 0, 0, 0.5)",
                            y: isHovered ? -2 : 0,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: "easeOut"
                        }}
                    >
                        {/* Top-left highlight */}
                        <div
                            className="absolute top-0 left-0 w-2/3 h-2/3 opacity-40"
                            style={{
                                background: "radial-gradient(circle at top left, rgba(255, 255, 255, 0.5), transparent 80%)",
                                pointerEvents: "none",
                                filter: "blur(10px)"
                            }}
                        />

                        {/* Bottom shadow */}
                        <div
                            className="absolute bottom-0 left-0 w-full h-1/2 opacity-50"
                            style={{
                                background: "linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent)",
                                pointerEvents: "none",
                                backdropFilter: "blur(3px)"
                            }}
                        />

                        {/* Icon content */}
                        <div className="flex items-center justify-center w-full h-full relative z-10 text-white">
                            {icon}
                        </div>
                    </motion.div>
                )}

                {/* Children content */}
                {children}
            </motion.div>
        </motion.div>
    );
};
