import React from 'react';
import { Technique } from '@/lib/stress-relief/types';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import LiquidGlass from '@/components/LiquidGlass';

interface TechniqueTileProps {
    technique: Partial<Technique>; // Can be lightweight version
    onClick: (id: string) => void;
}

export const TechniqueTile: React.FC<TechniqueTileProps> = ({ technique, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
        >
            <LiquidGlass
                onClick={() => technique.id && onClick(technique.id)}
                className="h-full cursor-pointer group"
            >
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2 text-xs font-medium text-white/50 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                            <Clock size={12} />
                            <span>{technique.time_min} min</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/5">
                            <ArrowRight size={16} className="text-white/60 group-hover:text-white" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white/90 mb-2 font-montage">
                        {technique.title}
                    </h3>

                    <p className="text-sm text-white/60 leading-relaxed mb-4 flex-grow font-petrona">
                        {technique.short}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {technique.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </LiquidGlass>
        </motion.div>
    );
};
