// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import { currentLevel, lastWeek, LEVELS, levels, wordCounts } from "./insights";
import { dayKey, emptyProgress } from "./progress";

const now = Date.UTC(2026, 10, 3, 12);
const doneUnits = (n: number) => {
  const lessons: Record<string, { times: number; bestAccuracy: number; lastAt: number }> = {};
  for (const u of course.units.slice(0, n)) for (const l of u.lessons) lessons[l.id] = { times: 1, bestAccuracy: 1, lastAt: now };
  return { ...emptyProgress(now), lessons };
};

describe("insights", () => {
  it("splits the course into two levels covering every unit once", () => {
    const ids = LEVELS.flatMap((l) => l.units);
    expect(ids).toEqual(course.units.map((u) => u.id));
  });
  it("tracks the current level and completion", () => {
    expect(currentLevel(emptyProgress(now))).toMatchObject({ id: "level1", done: 0 });
    const a1 = doneUnits(20);
    expect(levels(a1)[0]!.complete).toBe(true);
    expect(currentLevel(a1).id).toBe("level2");
    expect(levels(doneUnits(course.units.length)).every((l) => l.complete)).toBe(true);
  });
  it("counts strong and learning words and finds tricky ones", () => {
    const card = (box: number, right: number, wrong: number) => ({ box, due: 0, right, wrong, lastSeen: 0 });
    const c = wordCounts({ srs: { "g.salaam": card(4, 5, 0), "g.fi": card(1, 1, 3), "g.jerejef": card(0, 2, 1), gone: card(5, 9, 0) } });
    expect(c).toEqual({ strong: 1, learning: 2, tricky: ["g.fi"] });
  });
  it("returns seven days ending today", () => {
    const week = lastWeek({ xpByDay: { [dayKey(now)]: 30 } }, now);
    expect(week).toHaveLength(7);
    expect(week[6]).toEqual({ day: dayKey(now), xp: 30 });
    expect(week[0]!.xp).toBe(0);
  });
});
