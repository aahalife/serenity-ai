import React from 'react';
import { Phrase } from '@/lib/stress-relief/types';
import { motion } from 'framer-motion';
import LiquidGlass from '@/components/LiquidGlass';

interface PhraseTileProps {
    phrase: Phrase;
    onClick: (phrase: Phrase) => void;
    isSelected?: boolean;
}

export const PhraseTile: React.FC<PhraseTileProps> = ({ phrase, onClick, isSelected }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
        >
            <LiquidGlass
                onClick={() => onClick(phrase)}
                className={`h-full cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : ''}`}
            >
                <div className="flex flex-col h-full justify-center min-h-[120px]">
                    <p className="text-xl font-medium text-white/90 leading-relaxed font-montage">
                        "{phrase.text}"
                    </p>
                </div>
            </LiquidGlass>
        </motion.div>
    );
};
