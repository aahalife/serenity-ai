import React from 'react';
import { Phrase } from '@/lib/stress-relief/types';
import { motion } from 'framer-motion';

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
            onClick={() => onClick(phrase)}
            className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300
        backdrop-blur-xl border
        ${isSelected
                    ? 'bg-white/15 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 shadow-lg'}
      `}
        >
            {/* Glass reflection effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <p className="text-lg font-medium text-white/90 leading-relaxed relative z-10">
                "{phrase.text}"
            </p>
        </motion.div>
    );
};
