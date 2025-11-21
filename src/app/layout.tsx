import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import localFont from "next/font/local";
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

const montage = localFont({
    src: [
        {
            path: "../../public/styles/font/Montage.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../../public/styles/font/Montage.woff",
            weight: "400",
            style: "normal",
        },
    ],
    variable: "--font-montage",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Serenity AI",
    description: "Your intelligent companion for well-being.",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Serenity",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

import Layout from "@/components/Layout";

import { Providers } from "@/components/Providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${roboto.variable} ${montage.variable} ${inter.className}`}>
                <Providers>
                    <Layout>{children}</Layout>
                </Providers>
            </body>
        </html>
    );
}
