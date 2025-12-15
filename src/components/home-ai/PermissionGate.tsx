"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, AlertTriangle } from "lucide-react";

interface Service {
    id: string;
    name: string;
    description: string;
    isconnected: boolean;
}

export default function PermissionGate() {
    const [services, setServices] = useState<Service[]>([
        { id: 'google-calendar', name: 'Google Calendar', description: 'Schedule home maintenance', isconnected: false },
        { id: 'google-docs', name: 'Google Docs', description: 'Read/Write home manuals', isconnected: true },
        { id: 'gmail', name: 'Gmail', description: 'Send notifications & receipts', isconnected: false },
    ]);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleConnection = (id: string) => {
        setServices(services.map(s =>
            s.id === id ? { ...s, isconnected: !s.isconnected } : s
        ));
    };

    return (
        <div className="w-full">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors text-xs font-medium text-indigo-200"
            >
                <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Agent Permissions</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/20 px-2 py-0.5 rounded text-[10px]">
                        {services.filter(s => s.isconnected).length}/{services.length} Active
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-2 space-y-2 mt-2">
                            {services.map(service => (
                                <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground/90">{service.name}</span>
                                            {service.isconnected ? (
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground/50">{service.description}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleConnection(service.id)}
                                        className={`ml-3 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${service.isconnected
                                                ? 'bg-red-500/10 text-red-200 hover:bg-red-500/20'
                                                : 'bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                                            }`}
                                    >
                                        {service.isconnected ? 'Disconnect' : 'Connect'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
