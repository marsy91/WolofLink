// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Colour themes (Settings → Theme). Lac Rose is the main look: a soft rose ground with
 * a plum accent, named after Senegal's pink lake. Learners who chose another theme keep it.
 */
export const THEMES = ["lacrose", "classic", "senegal"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "lacrose";

/** The theme to show for a saved setting (unknown or missing → the default). */
export function themeOf(saved: unknown): Theme {
  return (THEMES as readonly unknown[]).includes(saved) ? (saved as Theme) : DEFAULT_THEME;
}

/** Colour of the Android status bar for each theme in light mode. */
export const THEME_BAR: Record<Theme, string> = { lacrose: "#7a3b69", classic: "#1d2550", senegal: "#0b4a2b" };

/** Three colours shown on each theme's button in Settings. */
export const THEME_SWATCH: Record<Theme, readonly [string, string, string]> = {
  lacrose: ["#f3d6e4", "#7a3b69", "#1d2550"],
  classic: ["#1d2550", "#b9481f", "#f2a93b"],
  senegal: ["#00853f", "#fdef42", "#e31b23"],
};
