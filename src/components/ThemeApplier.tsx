// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { useSeason } from "@/lib/seasons";
import { useStore } from "@/lib/store";
import { THEME_TOKENS, themeFor } from "@/lib/themes";

const DARK_BAR = "#121527";

/**
 * Applies the chosen colour theme (Settings → Theme) and any seasonal theme to the whole app.
 * Light themes apply in light mode and their own dark palette (darkColors) in dark mode; dark themes always
 * switch the app to dark mode. The Senegal flag season keeps its own colours.
 */
export function ThemeApplier() {
  const { progress } = useStore();
  const def = themeFor(progress.settings.theme);
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
  const dark = def.dark || mode === "dark" || (mode === "system" && systemDark);
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
    root.dataset.theme = def.id;
    for (const token of THEME_TOKENS) root.style.removeProperty(`--color-${token}`);
    // Light mode or an always-dark theme: its colours. Dark mode: the theme's own dark palette.
    const palette = look === "flag" ? {} : def.dark || !dark ? def.colors : (def.darkColors ?? {});
    for (const [token, value] of Object.entries(palette)) root.style.setProperty(`--color-${token}`, value);
    const bar = dark && !def.dark ? (def.darkColors?.sand ?? DARK_BAR) : def.bar;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bar);
  }, [def, dark, look]);
  return null;
}
