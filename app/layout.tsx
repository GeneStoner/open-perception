import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import AuthSessionProvider from "@/components/SessionProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Open Perception",
  description: "An Experiment in Distributed Psychophysical Experimentation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preload" href="/assets/creak-open.mp3" as="audio" type="audio/mpeg" />
        <link rel="preload" href="/assets/door-slam.mp3"  as="audio" type="audio/mpeg" />
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--text-primary)" }}>
        <AuthSessionProvider>
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 px-6 text-center text-sm space-y-1" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <div>Open Perception — research prototype v0.1</div>
          <div className="flex justify-center gap-6 text-xs">
            <a href="https://github.com/GeneStoner/open-perception" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>GitHub</a>
            <span>MIT License</span>
            <a href="mailto:generstoner@gmail.com" style={{ color: "var(--accent)" }}>Contact</a>
          </div>
        </footer>
        </AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
