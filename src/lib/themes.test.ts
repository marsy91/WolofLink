// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import {
  CLASSIC,
  DARK_BASE,
  DEFAULT_THEME,
  THEME_IDS,
  THEMES,
  THEME_TOKENS,
  contrast,
  earlyThemeScript,
  isThemeId,
  resolvedPalette,
  themeFor,
  type Token,
} from "./themes";

const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");

/** The --color-* values in the first CSS block that starts with `selector`. */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]));
}

const WHITE = "#ffffff";
type Pair = [Token | "white", Token | "white", number?];

/** Text-on-background pairs the screens use (text first). AA is 4.5:1. */
const LIGHT_PAIRS: Pair[] = [
  ["ink", "sand"], ["muted", "sand"], ["muted", "sand-2"], ["muted", "card"],
  ["night", "sand"], ["night", "card"], ["night", "sun-soft"], ["night", "sea-soft"], ["night", "sun"],
  ["sand", "night"],
  ["clay", "card"], ["clay", "sand"], ["sea", "card"], ["sea", "sea-soft"],
  ["berry", "card"], ["berry", "berry-soft"], ["dusk", "card"], ["dusk", "dusk-soft"], ["sun-deep", "card"],
  ["white", "clay"], ["white", "sea"], ["white", "dusk"], ["white", "berry"],
];
const DARK_PAIRS: Pair[] = [
  ["ink", "sand"], ["muted", "sand"], ["muted", "sand-2"], ["night", "sand"], ["night", "sand-2"],
  ["ink", "card"], ["muted", "card"],
];

describe("themes", () => {
  it("keeps the classic palette in step with globals.css", () => {
    const fromCss = block("@theme");
    for (const [token, hex] of Object.entries(CLASSIC)) expect([token, fromCss[token]]).toEqual([token, hex]);
  });

  it("keeps the dark base in step with globals.css", () => {
    const fromCss = block(':root[data-mode="dark"] {');
    for (const [token, hex] of Object.entries(fromCss)) expect([token, DARK_BASE[token as Exclude<Token, "card">]]).toEqual([token, hex]);
  });

  it.each(THEME_IDS.filter((id) => id !== "senegal"))("%s meets WCAG AA for every text colour", (id) => {
    const def = THEMES[id];
    const p = resolvedPalette(def);
    const pick = (t: Token | "white") => (t === "white" ? WHITE : p[t]);
    const failures = (def.dark ? DARK_PAIRS : LIGHT_PAIRS)
      .map(([text, bg, min = 4.5]) => ({ pair: `${text} on ${bg}`, ratio: contrast(pick(text), pick(bg)), min }))
      .filter((r) => r.ratio < r.min)
      .map((r) => `${r.pair}: ${r.ratio.toFixed(2)}`);
    expect(failures).toEqual([]);
  });

  // Every background/text pair found in the screens' class names (bg first, text second).
  const SCREEN_PAIRS = (
    "white night|night sand|sea-soft sea|berry-soft berry|white muted|clay white|night sun|sun night|sand-2 night|" +
    "dusk white|sand-3 muted|berry white|sand-3 night|sun-soft night|sun-soft sea|sea white|white sea|sand-2 muted|" +
    "sun-soft sun-2|sun-soft sun-deep|sun-soft clay-2|white berry|white ink|sun-soft clay|sand-2 clay|dusk-soft night|" +
    "dusk-soft dusk|sea-soft night|white dusk|white clay|night-2 white|sun-soft dusk|sand ink|sand muted|sand night|sand clay"
  )
    .split("|")
    .map((p) => p.split(" ") as [Token | "white", Token | "white"]);

  it.each(THEME_IDS.filter((id) => !THEMES[id].dark && id !== "senegal"))(
    "%s is never harder to read than Classic on any screen",
    (id) => {
      const classic = resolvedPalette(THEMES.classic);
      const p = resolvedPalette(THEMES[id]);
      const pick = (pal: Record<Token, string>, t: Token | "white") => (t === "white" ? WHITE : pal[t]);
      const worse = SCREEN_PAIRS.filter(([bg, text]) => {
        const base = contrast(pick(classic, text), pick(classic, bg));
        return contrast(pick(p, text), pick(p, bg)) < Math.min(4.5, base) - 0.01;
      }).map(([bg, text]) => `${text} on ${bg}`);
      expect(worse).toEqual([]);
    },
  );

  it("only changes colours, never sizes, spacing or fonts", () => {
    for (const id of THEME_IDS) {
      for (const [token, value] of Object.entries(THEMES[id].colors)) {
        expect(THEME_TOKENS).toContain(token);
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("has a name and description in the dictionary for every theme", () => {
    for (const id of THEME_IDS) {
      expect(en).toHaveProperty(`theme.${id}`);
      expect(en).toHaveProperty(`theme.${id}.about`);
    }
  });

  it("uses well-formed colours and matching ids", () => {
    for (const id of THEME_IDS) {
      const def = THEMES[id];
      expect(def.id).toBe(id);
      for (const c of [...def.swatch, def.bar, ...Object.values(def.colors)]) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("falls back to classic for unknown or missing settings", () => {
    expect(themeFor(undefined).id).toBe("classic");
    expect(themeFor("nope").id).toBe("classic");
    expect(themeFor("saloum").id).toBe("saloum");
    expect(isThemeId(DEFAULT_THEME)).toBe(true);
  });

  it("computes contrast like the WCAG formula", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  describe("early script", () => {
    function run(stored: string | null, prefersDark = false) {
      const props: Record<string, string> = {};
      const root = { dataset: {} as Record<string, string>, style: { setProperty: (k: string, v: string) => (props[k] = v) } };
      const fn = new Function("localStorage", "document", "matchMedia", earlyThemeScript("k"));
      fn({ getItem: () => stored }, { documentElement: root }, () => ({ matches: prefersDark }));
      return { theme: root.dataset.theme, mode: root.dataset.mode, props };
    }

    it("gives a brand-new learner the default theme", () => {
      const r = run(null);
      expect(r.theme).toBe(DEFAULT_THEME);
      expect(r.props["--color-night"]).toBe(THEMES[DEFAULT_THEME].colors.night);
    });

    it("keeps classic for learners saved before themes existed", () => {
      const r = run(JSON.stringify({ settings: { mode: "light" } }));
      expect(r.theme).toBe("classic");
      expect(r.props).toEqual({});
    });

    it("forces dark mode for a dark theme and skips light palettes in dark mode", () => {
      expect(run(JSON.stringify({ settings: { theme: "saloum", mode: "light" } })).mode).toBe("dark");
      const r = run(JSON.stringify({ settings: { theme: "lompoul" } }), true);
      expect(r.mode).toBe("dark");
      expect(r.props).toEqual({});
    });

    it("survives broken storage", () => {
      expect(() => run("{not json")).not.toThrow();
    });
  });
});
