"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";
import PermissionGate from "./PermissionGate";

export default function ProactiveList() {
    const items = [
        { id: 1, type: "urgent", icon: AlertCircle, text: "Review permission for Google Calendar integration", time: "Now" },
        { id: 2, type: "upcoming", icon: Calendar, text: "Weekly home maintenance summary available", time: "2h ago" },
        { id: 3, type: "info", icon: Clock, text: "Bursar agent completed monthly budget overview", time: "5h ago" },
    ];

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4 overflow-y-auto">
            <PermissionGate />
            <h2 className="text-xl font-serif text-foreground/80 mb-2 mt-2">Attention Needed</h2>
            <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg backdrop-blur-md"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${item.type === 'urgent' ? 'bg-red-500/20 text-red-200' :
                                item.type === 'upcoming' ? 'bg-blue-500/20 text-blue-200' :
                                    'bg-emerald-500/20 text-emerald-200'
                                }`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground/90">{item.text}</p>
                                <span className="text-xs text-foreground/50 mt-1 block">{item.time}</span>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full">
                                <CheckCircle2 className="w-4 h-4 text-foreground/70" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
