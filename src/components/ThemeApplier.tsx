// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { useSeason } from "@/lib/seasons";
import { useStore } from "@/lib/store";
import { THEME_BAR, themeOf } from "@/lib/theme";

const DARK_BAR = "#121527";

/** Applies the chosen colour theme (Settings → Theme) and any seasonal theme to the whole app. */
export function ThemeApplier() {
  const { progress } = useStore();
  const theme = themeOf(progress.settings.theme);
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
    if (theme === "classic") delete root.dataset.theme;
    else root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? DARK_BAR : THEME_BAR[theme]);
  }, [theme, dark]);
  return null;
}
