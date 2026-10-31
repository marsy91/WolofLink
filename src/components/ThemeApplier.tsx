// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

const BAR = { classic: "#1d2550", senegal: "#0b4a2b" } as const;

/** Applies the chosen colour theme (Settings → Theme) to the whole app. */
export function ThemeApplier() {
  const { progress } = useStore();
  const theme = progress.settings.theme ?? "classic";
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "senegal") root.dataset.theme = "senegal";
    else delete root.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR[theme]);
  }, [theme]);
  return null;
}
