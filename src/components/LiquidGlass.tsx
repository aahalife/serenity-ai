import React from "react";

interface LiquidGlassProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function LiquidGlass({ children, className = "", onClick }: LiquidGlassProps) {
    return (
        <div className={`lg-wrap ${className}`} onClick={onClick}>
            <div className="lg-shadow"></div>
            <div className="lg-content">
                <div className="lg-inner">
                    {children}
                </div>
            </div>
        </div>
    );
}
