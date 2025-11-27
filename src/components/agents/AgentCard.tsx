import React from 'react';
import LiquidGlass from '@/components/LiquidGlass';
import { Sparkles, Brain, Moon, Heart, Activity } from 'lucide-react';

interface AgentCardProps {
    name: string;
    role: string;
    description: string;
    status: 'active' | 'idle' | 'learning';
    capabilities: string[];
    icon: string;
    onClick?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ name, role, description, status, capabilities, icon, onClick }) => {
    const getIcon = () => {
        switch (icon) {
            case 'moon': return <Moon size={24} className="text-indigo-300" />;
            case 'wind': return <Activity size={24} className="text-rose-300" />;
            case 'scale': return <Heart size={24} className="text-emerald-300" />;
            case 'brain': return <Brain size={24} className="text-amber-300" />;
            default: return <Sparkles size={24} />;
        }
    };

    const getGradient = () => {
        switch (icon) {
            case 'moon': return 'from-indigo-500/20 to-blue-500/20';
            case 'wind': return 'from-rose-500/20 to-orange-500/20';
            case 'scale': return 'from-emerald-500/20 to-teal-500/20';
            case 'brain': return 'from-amber-500/20 to-yellow-500/20';
            default: return 'from-white/10 to-white/5';
        }
    };

    return (
        <LiquidGlass
            onClick={onClick}
            className={`group relative overflow-hidden p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] ${status === 'active' ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'opacity-80 hover:opacity-100'}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                        {getIcon()}
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${status === 'active' ? 'bg-green-500/20 border-green-500/30' :
                            status === 'learning' ? 'bg-blue-500/20 border-blue-500/30' :
                                'bg-white/10 border-white/20'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400 animate-pulse' :
                                status === 'learning' ? 'bg-blue-400 animate-pulse' :
                                    'bg-white/40'
                            }`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${status === 'active' ? 'text-green-300' :
                                status === 'learning' ? 'text-blue-300' :
                                    'text-white/60'
                            }`}>{status}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 font-montage">{name}</h3>
                <p className="text-xs text-white/50 uppercase tracking-widest mb-3">{role}</p>
                <p className="text-white/70 text-sm leading-relaxed mb-4 min-h-[60px]">{description}</p>

                <div className="mt-auto space-y-2">
                    <div className="h-px w-full bg-white/10" />
                    <div className="flex flex-wrap gap-2 pt-2">
                        {capabilities.map((cap, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60">
                                {cap}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </LiquidGlass>
    );
};
