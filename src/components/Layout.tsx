"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import styles from "./Layout.module.css";

// Routes that should be full-screen without sidebar
const FULL_SCREEN_ROUTES = ['/cool-breathing', '/breathing', '/the-work'];

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Check if current route should be full-screen
    const isFullScreen = FULL_SCREEN_ROUTES.some(route => pathname?.startsWith(route));

    if (isFullScreen) {
        return <>{children}</>;
    }

    return (
        <div className={styles.container}>
            <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
            <main className={`${styles.main} ${isCollapsed ? styles.collapsed : ''}`}>
                {children}
            </main>
        </div>
    );
}
