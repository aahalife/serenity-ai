import React from 'react';
import { Technique } from '@/lib/stress-relief/types';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';

interface TechniqueTileProps {
    technique: Partial<Technique>; // Can be lightweight version
    onClick: (id: string) => void;
}

export const TechniqueTile: React.FC<TechniqueTileProps> = ({ technique, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => technique.id && onClick(technique.id)}
            className="
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300
        backdrop-blur-xl border bg-white/5 border-white/10 
        hover:bg-white/10 hover:border-white/20 shadow-lg group
      "
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2 text-xs font-medium text-white/50 bg-white/5 px-2 py-1 rounded-full">
                    <Clock size={12} />
                    <span>{technique.time_min} min</span>
                </div>
                {/* Placeholder for icon or visual indicator */}
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ArrowRight size={16} className="text-white/60" />
                </div>
            </div>

            <h3 className="text-xl font-semibold text-white/90 mb-2">
                {technique.title}
            </h3>

            <p className="text-sm text-white/60 leading-relaxed">
                {technique.short}
            </p>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
                {technique.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded">
                        {tag}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};
