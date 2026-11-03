// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** What the learner can see about their own progress. All computed on the phone. */
import { course } from "@/content/course";
import { dayKey, type Progress } from "./progress";

const DAY_MS = 24 * 60 * 60 * 1000;

/** WolofLink's own levels (roughly A1 and A2 of the European framework; not an official qualification). */
export const LEVELS = [
  { id: "level1", units: course.units.slice(0, 20).map((u) => u.id) },
  { id: "level2", units: course.units.slice(20).map((u) => u.id) },
] as const;
export type LevelId = (typeof LEVELS)[number]["id"];

export const unitDone = (p: Pick<Progress, "lessons">, unitId: string) => {
  const unit = course.units.find((u) => u.id === unitId);
  return !!unit && unit.lessons.length > 0 && unit.lessons.every((l) => p.lessons[l.id]);
};

export interface LevelState {
  id: LevelId;
  done: number;
  total: number;
  complete: boolean;
}

export function levels(p: Pick<Progress, "lessons">): LevelState[] {
  return LEVELS.map((l) => {
    const done = l.units.filter((u) => unitDone(p, u)).length;
    return { id: l.id, done, total: l.units.length, complete: l.units.length > 0 && done === l.units.length };
  });
}

/** The level the learner is working on now (the first not complete), or the last one. */
export function currentLevel(p: Pick<Progress, "lessons">): LevelState {
  const all = levels(p);
  return all.find((l) => !l.complete) ?? all[all.length - 1]!;
}

export interface WordCounts {
  strong: number;
  learning: number;
  tricky: string[];
}

/** strong: reviewed right several times in a row; tricky: missed more often than got right. */
export function wordCounts(p: Pick<Progress, "srs">): WordCounts {
  let strong = 0;
  let learning = 0;
  const tricky: [string, number][] = [];
  for (const [id, c] of Object.entries(p.srs)) {
    if (!course.entries[id]) continue;
    if (c.box >= 3) strong++;
    else learning++;
    if (c.wrong > c.right) tricky.push([id, c.wrong - c.right]);
  }
  tricky.sort((a, b) => b[1] - a[1]);
  return { strong, learning, tricky: tricky.slice(0, 8).map(([id]) => id) };
}

/** XP for the last 7 days, oldest first. */
export function lastWeek(p: Pick<Progress, "xpByDay">, now: number): { day: string; xp: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = dayKey(now - (6 - i) * DAY_MS);
    return { day, xp: p.xpByDay[day] ?? 0 };
  });
}
