import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
    title: "Test application",
    description: "Test task: Video player with timeline and cropping",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="ru">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
