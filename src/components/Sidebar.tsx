"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wind, MessageCircle, BookOpen, Activity, Settings, User } from "lucide-react";
import styles from "./Sidebar.module.css";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface UserProfile {
    name: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        }
    }, []);

    const navItems = [
        { name: "Dashboard", href: "/", icon: Home },
        { name: "Breathe", href: "/breathing", icon: Wind },
        { name: "Journal", href: "/journal", icon: BookOpen },
        { name: "The Work", href: "/the-work", icon: Activity },
        { name: "Chat", href: "/chat", icon: MessageCircle },
    ];

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={styles.sidebar}
        >
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <Wind size={24} />
                </div>
                Serenity AI
            </div>

            <nav className={styles.nav}>
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(styles.navItem, { [styles.active]: isActive })}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className={styles.activeIndicator}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.userProfile}>
                <div className={styles.avatar}>
                    {profile?.name?.charAt(0) || "U"}
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{profile?.name || "User"}</span>
                    <span className={styles.userStatus}>Mindful</span>
                </div>
            </div>
        </motion.aside>
    );
}
