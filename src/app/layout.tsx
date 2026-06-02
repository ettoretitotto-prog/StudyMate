import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Quest",
  description: "Trasforma lo studio in missioni RPG, XP, livelli e streak.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "Study Quest",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#6d5dfb",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body>
        <div className="pointer-events-none fixed inset-0 quest-grid opacity-30" />
        <div className="relative min-h-screen">{children}</div>
        <PwaRegister />
      </body>
    </html>
  );
}
