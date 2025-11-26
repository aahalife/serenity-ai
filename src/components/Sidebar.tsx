"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wind, MessageCircle, BookOpen, Activity, Settings, User, Trophy, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import styles from "./Sidebar.module.css";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, LogIn } from "lucide-react";

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && !isCollapsed) {
                toggleCollapse();
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array to run only on mount

    useEffect(() => {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
        }
    }, []);

    const navItems = [
        { name: "Dashboard", href: "/", icon: Home },
        { name: "Breathe", href: "/breathing", icon: Wind },
        { name: "Journal", href: "/journal", icon: BookOpen },
        { name: "The Work", href: "/the-work", icon: Activity },
        { name: "Stress Relief", href: "/stress-relief", icon: Sparkles },
        { name: "Wins", href: "/wins", icon: Trophy },
        { name: "Chat", href: "/chat", icon: MessageCircle },
        { name: "Profile", href: "/profile", icon: User }, // Explicit Profile link
    ];

    const sidebarVariants: any = {
        desktop: {
            width: isCollapsed ? 70 : 280,
            x: 0,
            transition: { duration: 0.3, ease: "easeInOut" }
        },
        mobile: {
            width: "auto", // Allow CSS to control width
            x: "-50%", // Center horizontally (matches CSS transform)
            y: 0,
            transition: { duration: 0.3, ease: "easeInOut" }
        }
    };

    return (
        <motion.aside
            initial={false}
            animate={isMobile ? "mobile" : "desktop"}
            variants={sidebarVariants}
            className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
        >
            <button
                className={styles.collapseBtn}
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand" : "Collapse"}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div className={`${styles.logo} font-montage`}>
                <div className={styles.logoIcon}>
                    <Wind size={24} />
                </div>
                {!isCollapsed && "Serenity AI"}
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
                            title={isCollapsed ? item.name : ""}
                        >
                            <div className={styles.iconWrapper}>
                                <Icon size={20} />
                            </div>
                            {!isCollapsed && <span className="font-montage">{item.name}</span>}
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
                {status === "authenticated" && session?.user ? (
                    <>
                        <Link href="/profile" className={styles.profileLink}>
                            {session.user.image ? (
                                <img src={session.user.image} alt="Profile" className={styles.avatar} />
                            ) : (
                                <div className={styles.avatar}>
                                    {session.user.name ? session.user.name[0] : "U"}
                                </div>
                            )}
                            {!isCollapsed && (
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{session.user.name}</span>
                                    <span className={styles.userStatus}>Flow Seeker</span>
                                </div>
                            )}
                        </Link>
                        <button onClick={() => signOut()} className={styles.logoutBtn} title="Sign Out">
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <button onClick={() => signIn('google')} className={styles.loginBtn}>
                        <LogIn size={18} />
                        {!isCollapsed && <span>Sign In with Google</span>}
                    </button>
                )}
            </div>
        </motion.aside>
    );
}
