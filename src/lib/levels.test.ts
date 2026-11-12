// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import { seeded } from "./engine";
import { LEVELS } from "./insights";
import { CEFR_LEVELS, LEVEL_TEST_PASS, LEVEL_TEST_SIZE, applyLevelTest, cefrLevel, levelTestEntries, mergeLevelTest } from "./levels";
import { mergeProgress } from "./merge";
import { emptyProgress } from "./progress";

const unitsOf = (id: string) => course.units.filter((u) => cefrLevel(id)!.units.includes(u.id));

describe("level map", () => {
  it("covers every unit exactly once and matches the My progress levels", () => {
    const all = CEFR_LEVELS.flatMap((l) => l.units);
    expect(new Set(all).size).toBe(all.length);
    expect(all).toEqual(course.units.map((u) => u.id));
    for (const l of CEFR_LEVELS) expect(LEVELS.find((x) => x.id === l.insights)?.units).toEqual(l.units);
  });

  it("asks about every unit of the level, each word once", () => {
    for (const l of CEFR_LEVELS) {
      const units = unitsOf(l.id);
      const words = levelTestEntries(units, seeded(7));
      expect(new Set(words).size).toBe(words.length);
      const pool = units.flatMap((u) => u.lessons.flatMap((x) => x.entries));
      expect(words.length).toBe(Math.min(LEVEL_TEST_SIZE, new Set(pool).size));
      if (units.length <= LEVEL_TEST_SIZE) {
        for (const u of units) {
          const unitWords = new Set(u.lessons.flatMap((x) => x.entries));
          if (unitWords.size) expect(words.some((w) => unitWords.has(w))).toBe(true);
        }
      }
    }
  });

  it("keeps the best score and the first pass", () => {
    let p = emptyProgress(0);
    p = applyLevelTest(p, "a1", 0.6, 100);
    expect(p.levelTests?.a1).toEqual({ best: 0.6, passedAt: null, lastAt: 100 });
    p = applyLevelTest(p, "a1", LEVEL_TEST_PASS, 200);
    p = applyLevelTest(p, "a1", 0.5, 300);
    expect(p.levelTests?.a1).toEqual({ best: LEVEL_TEST_PASS, passedAt: 200, lastAt: 300 });
  });

  it("merges results from two devices", () => {
    expect(mergeLevelTest({ best: 0.7, passedAt: null, lastAt: 5 }, { best: 0.9, passedAt: 9, lastAt: 9 })).toEqual({ best: 0.9, passedAt: 9, lastAt: 9 });
    const a = applyLevelTest(emptyProgress(0), "a2", 0.85, 50);
    const b = applyLevelTest(emptyProgress(0), "a1", 0.9, 60);
    const merged = mergeProgress(a, b);
    expect(Object.keys(merged.levelTests ?? {}).sort()).toEqual(["a1", "a2"]);
  });
});
