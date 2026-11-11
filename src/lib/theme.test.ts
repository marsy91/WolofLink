// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEMES, THEME_BAR, THEME_SWATCH, themeOf } from "./theme";

describe("themes", () => {
  it("Lac Rose is the default, and a saved choice is kept", () => {
    expect(DEFAULT_THEME).toBe("lacrose");
    expect(themeOf(undefined)).toBe("lacrose");
    expect(themeOf("nonsense")).toBe("lacrose");
    expect(themeOf("classic")).toBe("classic");
    expect(themeOf("senegal")).toBe("senegal");
  });

  it("every theme has a bar colour, a swatch and its CSS", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    for (const t of THEMES) {
      expect(THEME_BAR[t]).toMatch(/^#[0-9a-f]{6}$/);
      expect(THEME_SWATCH[t]).toHaveLength(3);
      if (t !== "classic") expect(css).toContain(`:root[data-theme="${t}"]`);
    }
  });

  it("the start-up script picks the same theme as the app", () => {
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    expect(layout).toContain('s.theme!=="classic"');
    expect(layout).toContain('"lacrose"');
  });
});
