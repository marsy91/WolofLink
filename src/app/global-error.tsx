// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect } from "react";
import { SafetyScreen } from "@/components/SafetyScreen";
import "./globals.css";

/** Last resort, when the root layout or its providers crash: it replaces the whole page. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <SafetyScreen kind="crash" onRetry={reset} />
      </body>
    </html>
  );
}
