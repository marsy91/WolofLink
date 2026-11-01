// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { useSeason } from "@/lib/seasons";
import { useStore } from "@/lib/store";

const BAR = { classic: "#1d2550", senegal: "#0b4a2b" } as const;
const DARK_BAR = "#121527";

/** Applies the chosen colour theme (Settings → Theme) and any seasonal theme to the whole app. */
export function ThemeApplier() {
  const { progress } = useStore();
  const theme = progress.settings.theme ?? "classic";
  const look = useSeason()?.look;
  const mode = progress.settings.mode ?? "system";
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const dark = mode === "dark" || (mode === "system" && systemDark);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.dataset.mode = "dark";
    else delete root.dataset.mode;
  }, [dark]);
  useEffect(() => {
    const root = document.documentElement;
    if (look) root.dataset.season = look;
    else delete root.dataset.season;
  }, [look]);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "senegal") root.dataset.theme = "senegal";
    else delete root.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? DARK_BAR : BAR[theme]);
  }, [theme, dark]);
  return null;
}
