import type { Metadata } from "next";
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
        <footer className="border-t py-8 px-6 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Open Perception — research prototype v0.1
        </footer>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
