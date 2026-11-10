// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import audioManifest from "./audio-manifest.json";
import { ARENAS, arenaFor, TROPHY_MAX } from "./arenas";
import { course } from "./course";
import { UI_LANGS } from "./types";

describe("arenas", () => {
  it("start at 0 trophies and climb, with facts in five languages and real words with audio", () => {
    expect(ARENAS[0]!.trophies).toBe(0);
    for (let i = 1; i < ARENAS.length; i++) expect(ARENAS[i]!.trophies).toBeGreaterThan(ARENAS[i - 1]!.trophies);
    for (const a of ARENAS) {
      for (const lang of UI_LANGS) expect(a.fact[lang], `${a.id}.${lang}`).toBeTruthy();
      for (const id of a.words) {
        expect(course.entries[id], `${a.id} ${id}`).toBeDefined();
        expect((audioManifest as Record<string, string>)[id], `${id} audio`).toBeTruthy();
      }
    }
  });
  it("places a learner by trophies", () => {
    const thies = ARENAS[1]!.trophies;
    expect(arenaFor(0)).toMatchObject({ index: 0, toNext: 0 });
    expect(arenaFor(thies - 1).arena.id).toBe("dakar");
    expect(arenaFor(thies / 2).toNext).toBeCloseTo(0.5);
    expect(arenaFor(thies).arena.id).toBe("thies");
    expect(arenaFor(TROPHY_MAX)).toMatchObject({ next: null, toNext: 1 });
    expect(arenaFor(TROPHY_MAX).arena.id).toBe("casamance");
  });
  it("tops out at one trophy per course entry, with the last arena reachable", () => {
    expect(TROPHY_MAX).toBe(Object.keys(course.entries).length);
    expect(ARENAS.at(-1)!.trophies).toBeLessThan(TROPHY_MAX);
  });
});
