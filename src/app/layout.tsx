// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { AccountProvider } from "@/lib/account";
import { PremiumProvider } from "@/lib/premium-context";
import { PushInit } from "@/components/PushInit";
import { ThemeApplier } from "@/components/ThemeApplier";
import { VoicesLoader } from "@/lib/voices";
import { StoreProvider } from "@/lib/store";
import { contentSecurityPolicy } from "@/lib/csp";
import { earlyThemeScript } from "@/lib/themes";
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

const EARLY_THEME = earlyThemeScript("woloflink.progress.v1");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy(process.env.NEXT_PUBLIC_SUPABASE_URL)} />
        {/* Apply the saved theme and dark mode before the first paint, so the app doesn't flash light. */}
        <script dangerouslySetInnerHTML={{ __html: EARLY_THEME }} />
      </head>
      <body className="min-h-dvh antialiased">
        <StoreProvider>
          <ThemeApplier />
          <VoicesLoader />
          <AccountProvider>
            <PremiumProvider>
              <PushInit />
              {children}
            </PremiumProvider>
          </AccountProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
