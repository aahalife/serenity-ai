"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import styles from "./Notification.module.css";

interface NotificationProps {
    message: string;
    title?: string;
    onClose: () => void;
}

export default function Notification({ message, title = "Notification", onClose }: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={styles.notification}
        >
            <Bell className={styles.icon} size={24} />
            <div className={styles.content}>
                <h4>{title}</h4>
                <p>{message}</p>
            </div>
            <button onClick={onClose} className={styles.close}>
                <X size={18} />
            </button>
        </motion.div>
    );
}
