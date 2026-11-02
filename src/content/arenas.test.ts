// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import audioManifest from "./audio-manifest.json";
import { ARENAS, arenaFor } from "./arenas";
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
    expect(arenaFor(0)).toMatchObject({ index: 0, toNext: 0 });
    expect(arenaFor(30).arena.id).toBe("dakar");
    expect(arenaFor(30).toNext).toBeCloseTo(0.5);
    expect(arenaFor(60).arena.id).toBe("thies");
    expect(arenaFor(5000)).toMatchObject({ next: null, toNext: 1 });
    expect(arenaFor(5000).arena.id).toBe("casamance");
  });
});
