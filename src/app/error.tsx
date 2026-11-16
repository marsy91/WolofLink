// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect } from "react";
import { SafetyScreen } from "@/components/SafetyScreen";

/** Shown instead of a blank screen when a screen crashes. "Try again" re-renders it. */
export default function ScreenError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <SafetyScreen kind="crash" onRetry={reset} />;
}
