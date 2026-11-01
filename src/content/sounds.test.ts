// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import audioManifest from "./audio-manifest.json";
import { course } from "./course";
import { SOUNDS, soundsIn } from "./sounds";
import { UI_LANGS } from "./types";
import { wordOfTheDay } from "./word-of-day";

describe("sounds of Wolof", () => {
  it("explains every sound in five languages with real examples that have audio and contain the sound", () => {
    for (const s of SOUNDS) {
      for (const lang of UI_LANGS) expect(s.how[lang], `${s.id}.${lang}`).toBeTruthy();
      expect(s.examples.length, s.id).toBeGreaterThan(0);
      for (const id of s.examples) {
        const e = course.entries[id];
        expect(e, `${s.id} example ${id}`).toBeDefined();
        expect((audioManifest as Record<string, string>)[id], `${id} audio`).toBeTruthy();
        expect(s.pattern.test(e!.wo.normalize("NFC")), `${id} (${e!.wo}) shows ${s.label}`).toBe(true);
      }
    }
  });

  it("picks the tricky sounds in a word", () => {
    expect(soundsIn("xar").map((s) => s.id)).toEqual(["x"]);
    expect(soundsIn("Jërëjëf").map((s) => s.id)).toEqual(["e-dots", "j"]);
    expect(soundsIn("ndox").map((s) => s.id)).toEqual(["x", "prenasal"]);
    expect(soundsIn("suba").map((s) => s.id)).toEqual(["u"]);
  });
});

describe("word of the day", () => {
  it("is stable within a day and changes across days", () => {
    const a = wordOfTheDay(new Date(2026, 10, 1, 8));
    expect(wordOfTheDay(new Date(2026, 10, 1, 22)).id).toBe(a.id);
    const week = new Set([1, 2, 3, 4, 5, 6, 7].map((d) => wordOfTheDay(new Date(2026, 10, d)).id));
    expect(week.size).toBeGreaterThanOrEqual(6);
  });
});
