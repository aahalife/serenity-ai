import React from 'react';
import LiquidGlass from '@/components/LiquidGlass';
import { Sparkles, Brain, Moon, Heart, Activity } from 'lucide-react';

interface AgentCardProps {
    type: 'sleep' | 'stress' | 'work_life' | 'behavioral';
    name: string;
    description: string;
    isActive: boolean;
    onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ type, name, description, isActive, onClick }) => {
    const getIcon = () => {
        switch (type) {
            case 'sleep': return <Moon size={32} className="text-indigo-300" />;
            case 'stress': return <Activity size={32} className="text-rose-300" />;
            case 'work_life': return <Heart size={32} className="text-emerald-300" />;
            case 'behavioral': return <Brain size={32} className="text-amber-300" />;
            default: return <Sparkles size={32} />;
        }
    };

    const getGradient = () => {
        switch (type) {
            case 'sleep': return 'from-indigo-500/20 to-blue-500/20';
            case 'stress': return 'from-rose-500/20 to-orange-500/20';
            case 'work_life': return 'from-emerald-500/20 to-teal-500/20';
            case 'behavioral': return 'from-amber-500/20 to-yellow-500/20';
            default: return 'from-white/10 to-white/5';
        }
    };

    return (
        <LiquidGlass
            onClick={onClick}
            className={`group relative overflow-hidden p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] ${isActive ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'opacity-80 hover:opacity-100'}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                        {getIcon()}
                    </div>
                    {isActive && (
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-medium text-green-300">Active</span>
                        </div>
                    )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 font-montage">{name}</h3>
                <p className="text-white/60 text-sm leading-relaxed font-petrona">{description}</p>

                <div className="mt-auto pt-6 flex items-center text-white/40 text-xs uppercase tracking-widest font-medium group-hover:text-white/80 transition-colors">
                    <Sparkles size={12} className="mr-2" />
                    AI Agent
                </div>
            </div>
        </LiquidGlass>
    );
};
