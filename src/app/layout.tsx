import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const roboto = Roboto({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    variable: "--font-roboto",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Serenity AI",
    description: "Your personal stress management companion.",
};

import Layout from "@/components/Layout";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${roboto.variable}`}>
                <Layout>
                    {children}
                </Layout>
            </body>
        </html>
    );
}
