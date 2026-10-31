// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { AccountProvider } from "@/lib/account";
import { PremiumProvider } from "@/lib/premium-context";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage", weight: ["600", "800"] });
const body = Atkinson_Hyperlegible({ subsets: ["latin", "latin-ext"], variable: "--font-atkinson", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "WolofLink — learn Wolof",
  description: "Short, playful lessons to learn Wolof from English, French, Spanish, German or Italian.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1d2550",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh antialiased">
        <StoreProvider>
          <AccountProvider>
            <PremiumProvider>{children}</PremiumProvider>
          </AccountProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
