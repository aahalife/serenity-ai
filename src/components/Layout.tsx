"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./Layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={styles.container}>
            <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
            <main className={`${styles.main} ${isCollapsed ? styles.collapsed : ''}`}>
                {children}
            </main>
        </div>
    );
}
