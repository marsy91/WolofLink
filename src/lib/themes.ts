// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.

/**
 * Colour themes (Settings → Theme), each named after a place, landscape or animal of
 * Senegal. A theme only swaps the colour tokens from globals.css; layouts stay the same.
 *
 * - "classic" uses the palette in globals.css as it is.
 * - "senegal" is styled in globals.css (it also draws the flag stripe).
 * - Every other theme lists the tokens it changes; ThemeApplier sets them on <html>.
 * - Themes with `dark: true` always show in dark mode, on top of the dark palette.
 *
 * themes.test.ts checks every text/background pair the app uses meets WCAG AA.
 */

export const THEME_IDS = [
  "lacrose",
  "lompoul",
  "casamance",
  "goree",
  "capskirring",
  "niokolo",
  "calao",
  "baobab",
  "dakarnight",
  "saloum",
  "classic",
  "senegal",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** The default for new learners. Learners from before themes existed keep "classic". */
export const DEFAULT_THEME: ThemeId = "lacrose";

export type Token =
  | "night" | "night-2" | "night-3"
  | "sand" | "sand-2" | "sand-3"
  | "ink" | "muted"
  | "clay" | "clay-2"
  | "sun" | "sun-soft" | "sun-2" | "sun-deep"
  | "sea" | "sea-soft" | "sea-2"
  | "berry" | "berry-2" | "berry-soft"
  | "dusk" | "dusk-soft"
  | "card";

export interface ThemeDef {
  id: ThemeId;
  /** Always shown in dark mode. */
  dark: boolean;
  /** Three colours for the picker tile. */
  swatch: readonly [string, string, string];
  /** Phone status-bar colour. */
  bar: string;
  /** Tokens this theme changes (the rest come from globals.css). */
  colors: Partial<Record<Token, string>>;
  /**
   * Light themes only: the colours to use when the phone (or Settings) is in dark mode, on top
   * of the dark palette, so each theme keeps its own look at night. Missing: plain dark palette.
   */
  darkColors?: Partial<Record<Token, string>>;
  /** Learn screen layout: the lesson path (default) or the phrase feed (src/lib/feed.ts). */
  layout?: "path" | "feed";
}

/** The classic palette, exactly as in the @theme block of globals.css (checked by a test). */
export const CLASSIC: Record<Exclude<Token, "card">, string> = {
  night: "#1d2550",
  "night-2": "#2c3672",
  sand: "#f8f6f2",
  "sand-2": "#f0ece5",
  "sand-3": "#e4ded4",
  ink: "#1b1a24",
  muted: "#5b5568",
  clay: "#a8421a",
  "clay-2": "#8a3517",
  sun: "#f2a93b",
  "sun-soft": "#fde9c4",
  sea: "#0f6e72",
  "sea-soft": "#e3f3f1",
  "sea-2": "#0a4c4f",
  "night-3": "#0d1230",
  "sun-2": "#b77a1c",
  "sun-deep": "#94600f",
  "berry-2": "#7c1a14",
  berry: "#b3261e",
  "berry-soft": "#fbe9e6",
  dusk: "#7a3b69",
  "dusk-soft": "#f3e4ee",
};

/** The dark-mode palette from globals.css, used to check the dark themes. */
export const DARK_BASE: Record<Exclude<Token, "card">, string> = {
  ...CLASSIC,
  sand: "#121527",
  "sand-2": "#1d2140",
  "sand-3": "#30365a",
  ink: "#ecebf4",
  muted: "#aaa8c2",
  night: "#e8e6f6",
  "night-2": "#c9c6ea",
  "night-3": "#f5f4fb",
  clay: "#b9481f",
  "clay-2": "#93391a",
  sea: "#2a9da0",
  "sea-2": "#1d7c7f",
  berry: "#c9453b",
  "berry-2": "#a8352c",
  dusk: "#9a4f89",
  "sun-soft": "#3b3018",
  "sea-soft": "#12343a",
  "berry-soft": "#3d1d1f",
  "dusk-soft": "#33213a",
};

export const THEMES: Record<ThemeId, ThemeDef> = {
  lacrose: {
    id: "lacrose",
    dark: false,
    layout: "feed",
    swatch: ["#f3d6e4", "#7a3b69", "#3b1d4a"],
    bar: "#3b1d4a",
    colors: {
      night: "#3b1d4a",
      "night-2": "#55305f",
      "night-3": "#24102e",
      sand: "#f8f1f4",
      "sand-2": "#f1e4ec",
      "sand-3": "#e3d0dc",
      muted: "#655468",
      clay: "#a3315a",
      "clay-2": "#82264a",
      "dusk-soft": "#f1e0ec",
    },
    darkColors: {
      sand: "#1b1020",
      "sand-2": "#2b1a33",
      "sand-3": "#4a3052",
      card: "#26162d",
      muted: "#cdb6c8",
      clay: "#a3315a",
      "dusk-soft": "#3d2346",
    },
  },
  lompoul: {
    id: "lompoul",
    dark: false,
    swatch: ["#f3e3c3", "#f2a93b", "#3d2a14"],
    bar: "#3d2a14",
    colors: {
      night: "#3d2a14",
      "night-2": "#5a4024",
      "night-3": "#24180a",
      sand: "#faf5ea",
      "sand-2": "#f3eadb",
      "sand-3": "#e6d8c0",
      muted: "#655642",
    },
    darkColors: {
      sand: "#18120a",
      "sand-2": "#2a2013",
      "sand-3": "#4a3a22",
      card: "#221a0f",
      muted: "#cdbd9f",
      clay: "#a3561c",
    },
  },
  casamance: {
    id: "casamance",
    dark: false,
    swatch: ["#d9ebe2", "#1f7a4d", "#0e3b2e"],
    bar: "#0e3b2e",
    colors: {
      night: "#0e3b2e",
      "night-2": "#1a5442",
      "night-3": "#06241b",
      sand: "#f3f7f5",
      "sand-2": "#e6efeb",
      "sand-3": "#cfdfd8",
      muted: "#4d5f57",
      clay: "#1b6e45",
      "clay-2": "#145536",
    },
    darkColors: {
      sand: "#0b1a14",
      "sand-2": "#142a21",
      "sand-3": "#24493a",
      card: "#10231b",
      muted: "#a9c4b8",
      clay: "#1b6e45",
    },
  },
  goree: {
    id: "goree",
    dark: false,
    layout: "feed",
    swatch: ["#f2a93b", "#b8431f", "#0b6782"],
    bar: "#252a6e",
    colors: {
      night: "#252a6e",
      "night-2": "#363c8f",
      "night-3": "#151846",
      sand: "#fffdfa",
      "sand-2": "#f7efe6",
      "sand-3": "#ead9c8",
      clay: "#ad3f1c",
      sea: "#0b6782",
      "sea-2": "#084d61",
      "sea-soft": "#e2f1f6",
    },
    darkColors: {
      sand: "#11132e",
      "sand-2": "#1c2047",
      "sand-3": "#333a75",
      card: "#181b3d",
      muted: "#b8bce0",
      clay: "#ad3f1c",
      sea: "#0b6782",
    },
  },
  capskirring: {
    id: "capskirring",
    dark: false,
    swatch: ["#bfdedc", "#b24a17", "#0a3d40"],
    bar: "#0a3d40",
    colors: {
      night: "#0a3d40",
      "night-2": "#13585c",
      "night-3": "#052527",
      sand: "#eef7f6",
      "sand-2": "#dceeed",
      "sand-3": "#bfdedc",
      muted: "#475f61",
      clay: "#ad4716",
      "clay-2": "#8c3911",
    },
    darkColors: {
      sand: "#081a1b",
      "sand-2": "#102c2e",
      "sand-3": "#1f4c4f",
      card: "#0d2425",
      muted: "#a7c7c8",
      clay: "#ad4716",
    },
  },
  niokolo: {
    id: "niokolo",
    dark: false,
    swatch: ["#d9cfb3", "#9a4a12", "#2f3a1c"],
    bar: "#2f3a1c",
    colors: {
      night: "#2f3a1c",
      "night-2": "#46542b",
      "night-3": "#1b220f",
      sand: "#f6f2e7",
      "sand-2": "#ece5d2",
      "sand-3": "#d9cfb3",
      muted: "#5c5744",
      clay: "#94460f",
      "clay-2": "#76380c",
      sea: "#3a6629",
      "sea-2": "#2b4d1e",
      "sea-soft": "#e7f0e0",
      sun: "#e0a526",
    },
    darkColors: {
      sand: "#12160b",
      "sand-2": "#1f2613",
      "sand-3": "#374225",
      card: "#191e10",
      muted: "#bdbf9f",
      clay: "#94460f",
    },
  },
  calao: {
    id: "calao",
    dark: false,
    swatch: ["#f2b632", "#b8321f", "#1b1a24"],
    bar: "#1b1a24",
    colors: {
      night: "#1b1a24",
      "night-2": "#34323f",
      "night-3": "#0c0b12",
      sand: "#fdf6ea",
      "sand-2": "#f8ead2",
      "sand-3": "#ecd6b0",
      clay: "#b0301d",
      "clay-2": "#8c2617",
      sun: "#f2b632",
    },
    darkColors: {
      sand: "#121117",
      "sand-2": "#1f1d27",
      "sand-3": "#393644",
      card: "#1a1820",
      muted: "#bdbac8",
      clay: "#b0301d",
    },
  },
  baobab: {
    id: "baobab",
    dark: false,
    swatch: ["#ffffff", "#5a4632", "#1b1a24"],
    bar: "#1b1a24",
    colors: {
      night: "#1b1a24",
      "night-2": "#34323f",
      "night-3": "#0c0b12",
      sand: "#fbfaf8",
      "sand-2": "#f1efeb",
      "sand-3": "#dedad3",
      muted: "#57555d",
      clay: "#5a4632",
      "clay-2": "#433424",
      "sun-soft": "#f4efe6",
      "dusk-soft": "#f1eef0",
    },
    darkColors: {
      sand: "#111111",
      "sand-2": "#1e1d1c",
      "sand-3": "#3a3835",
      card: "#191817",
      muted: "#c2beb8",
      clay: "#6b5540",
    },
  },
  dakarnight: {
    id: "dakarnight",
    dark: true,
    swatch: ["#0d1230", "#2c3672", "#f2a93b"],
    bar: "#0d1230",
    colors: {
      sand: "#0d1230",
      "sand-2": "#1a2150",
      "sand-3": "#2c3672",
      card: "#151b45",
      muted: "#b4b9de",
    },
  },
  saloum: {
    id: "saloum",
    dark: true,
    swatch: ["#22132a", "#9a4f89", "#f2a93b"],
    bar: "#22132a",
    colors: {
      sand: "#22132a",
      "sand-2": "#331d3d",
      "sand-3": "#553261",
      card: "#2c1936",
      ink: "#f4eaf1",
      muted: "#cdb3c6",
      night: "#f6e9f1",
      "night-2": "#e6cfe0",
      "night-3": "#fbf4f8",
      "dusk-soft": "#3d2348",
    },
  },
  classic: {
    id: "classic",
    dark: false,
    swatch: ["#1d2550", "#b9481f", "#f2a93b"],
    bar: "#1d2550",
    colors: {},
  },
  senegal: {
    id: "senegal",
    dark: false,
    swatch: ["#00853f", "#fdef42", "#e31b23"],
    bar: "#0b4a2b",
    colors: {},
  },
};

/** Every token a theme may set, so ThemeApplier can clear the previous theme's values. */
export const THEME_TOKENS: readonly Token[] = [...(Object.keys(CLASSIC) as Token[]), "card"];

/** The Learn screen layout a saved theme setting uses. */
export function layoutFor(v: unknown): "path" | "feed" {
  return themeFor(v).layout ?? "path";
}

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && (THEME_IDS as readonly string[]).includes(v);
}

/** The theme to show for a stored setting; unknown values fall back to classic. */
export function themeFor(v: unknown): ThemeDef {
  return THEMES[isThemeId(v) ? v : "classic"];
}

/** The full palette a theme produces (light or dark), for contrast checks and previews. */
export function resolvedPalette(def: ThemeDef, dark: boolean = def.dark): Record<Token, string> {
  const base = dark ? DARK_BASE : CLASSIC;
  const colors = def.dark || !dark ? def.colors : (def.darkColors ?? {});
  return { card: dark ? "#1a1e38" : "#ffffff", ...base, ...colors } as Record<Token, string>;
}

/** WCAG relative luminance of a #rrggbb colour. */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

/** WCAG contrast ratio between two #rrggbb colours (1 to 21). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * A tiny inline script for <head> that applies the saved theme and dark mode before the
 * first paint, so the app doesn't flash the wrong colours. It mirrors ThemeApplier.
 */
export function earlyThemeScript(storageKey: string): string {
  const table: Record<string, { d: 1 | 0; c: Partial<Record<Token, string>>; k?: Partial<Record<Token, string>> }> = {};
  for (const id of THEME_IDS) table[id] = { d: THEMES[id].dark ? 1 : 0, c: THEMES[id].colors, k: THEMES[id].darkColors };
  return (
    `try{var raw=localStorage.getItem(${JSON.stringify(storageKey)}),` +
    `s=raw?(JSON.parse(raw).settings||{}):null,T=${JSON.stringify(table)},` +
    `id=s?(s.theme||"classic"):${JSON.stringify(DEFAULT_THEME)},t=T[id]||T.classic,` +
    `r=document.documentElement,m=(s&&s.mode)||"system",` +
    `dk=t.d||m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);` +
    `if(dk)r.dataset.mode="dark";r.dataset.theme=T[id]?id:"classic";` +
    `var P=t.d||!dk?t.c:(t.k||{});for(var k in P)r.style.setProperty("--color-"+k,P[k])}catch(e){}`
  );
}
