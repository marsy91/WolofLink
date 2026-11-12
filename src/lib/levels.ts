// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Course levels mapped to the CEFR (Common European Framework of Reference) and the level
 * tests. The full level map, with can-do statements and how the tests work, is in
 * docs/curriculum/level-map.md. WolofLink's alignment is our own, checked by our reviewers;
 * it is not an official CEFR certification.
 */
import { course } from "@/content/course";
import type { Rng } from "./engine";
import type { Progress } from "./progress";

export type CefrId = "a1" | "a2";

export interface CefrLevel {
  id: CefrId;
  /** The CEFR label shown to learners. */
  cefr: "A1" | "A2";
  /** The matching level on the My progress page (src/lib/insights.ts). */
  insights: "level1" | "level2";
  /** Units taught at this level, in order. */
  units: readonly string[];
}

export const CEFR_LEVELS: readonly CefrLevel[] = [
  {
    id: "a1",
    cefr: "A1",
    insights: "level1",
    units: course.units.slice(0, 20).map((u) => u.id),
  },
  {
    id: "a2",
    cefr: "A2",
    insights: "level2",
    units: course.units.slice(20).map((u) => u.id),
  },
];

/** Questions in a level test (fewer if the level has fewer words). */
export const LEVEL_TEST_SIZE = 30;
/** Share of right answers needed to pass a level test. */
export const LEVEL_TEST_PASS = 0.8;

export function cefrLevel(
  id: string | null | undefined
): CefrLevel | undefined {
  return CEFR_LEVELS.find((l) => l.id === id);
}

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * The words a level test asks about: at least one from every unit of the level (so no unit is
 * skipped), then the rest at random from the whole level, each word at most once.
 */
export function levelTestEntries(
  units: readonly { lessons: readonly { entries: readonly string[] }[] }[],
  rng: Rng,
  size = LEVEL_TEST_SIZE
): string[] {
  const perUnit = units
    .map((u) => [...new Set(u.lessons.flatMap((l) => l.entries))])
    .filter((e) => e.length > 0);
  const chosen = new Set<string>();
  for (const words of shuffled(perUnit, rng)) {
    if (chosen.size >= size) break;
    const fresh = words.filter((w) => !chosen.has(w));
    if (fresh.length) chosen.add(fresh[Math.floor(rng() * fresh.length)]!);
  }
  for (const w of shuffled(perUnit.flat(), rng)) {
    if (chosen.size >= size) break;
    chosen.add(w);
  }
  return shuffled([...chosen], rng);
}

export interface LevelTestRecord {
  /** Best score, 0–1. */
  best: number;
  /** When the learner first passed, or null if not yet. */
  passedAt: number | null;
  lastAt: number;
}

/** Records a level test attempt: keeps the best score and the first pass. */
export function applyLevelTest(
  p: Progress,
  id: CefrId,
  score: number,
  now: number
): Progress {
  const prev = p.levelTests?.[id];
  const passed = score >= LEVEL_TEST_PASS;
  const record: LevelTestRecord = {
    best: Math.max(prev?.best ?? 0, score),
    passedAt: prev?.passedAt ?? (passed ? now : null),
    lastAt: now,
  };
  return { ...p, levelTests: { ...p.levelTests, [id]: record } };
}

/** Merges two copies of a record (cloud sync): best score, earliest pass. */
export function mergeLevelTest(
  a: LevelTestRecord,
  b: LevelTestRecord
): LevelTestRecord {
  const passes = [a.passedAt, b.passedAt].filter(
    (x): x is number => x !== null
  );
  return {
    best: Math.max(a.best, b.best),
    passedAt: passes.length ? Math.min(...passes) : null,
    lastAt: Math.max(a.lastAt, b.lastAt),
  };
}
