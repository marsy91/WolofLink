// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { mergeProgress, sameProgress } from "./merge";
import { applySession, emptyProgress, type Progress, type SessionResult } from "./progress";

const day = (d: number, h = 10) => new Date(2026, 0, d, h).getTime();
const lesson = (lessonId: string, over: Partial<SessionResult> = {}): SessionResult => ({
  mode: "lesson",
  lessonId,
  xp: 10,
  accuracy: 0.8,
  outcomes: {},
  mistakes: 1,
  ...over,
});
const play = (p: Progress, r: SessionResult, t: number): Progress => ({ ...applySession(p, r, t).progress, updatedAt: t });

describe("mergeProgress", () => {
  const base = play(emptyProgress(day(1)), lesson("greetings-1"), day(1));

  it("combines lessons done on two devices", () => {
    const phone = play(base, lesson("greetings-2"), day(2));
    const tablet = play(base, lesson("numbers-1", { accuracy: 1 }), day(2, 12));
    const m = mergeProgress(phone, tablet);
    expect(Object.keys(m.lessons).sort()).toEqual(["greetings-1", "greetings-2", "numbers-1"]);
    expect(m.lessons["numbers-1"]!.bestAccuracy).toBe(1);
  });

  it("keeps the best of each lesson record and never loses XP days", () => {
    const a = play(base, lesson("greetings-1", { accuracy: 1, xp: 15 }), day(2));
    const b = play(base, lesson("greetings-1"), day(3));
    const m = mergeProgress(a, b);
    expect(m.lessons["greetings-1"]!.times).toBe(2);
    expect(m.lessons["greetings-1"]!.bestAccuracy).toBe(1);
    expect(m.xpByDay).toEqual({ "2026-01-01": 10, "2026-01-02": 15, "2026-01-03": 10 });
    expect(m.xpTotal).toBe(35);
  });

  it("is symmetric for learning data", () => {
    const a = play(base, lesson("greetings-2"), day(2));
    const b = play(base, lesson("numbers-1"), day(2, 11));
    const ab = mergeProgress(a, b);
    const ba = mergeProgress(b, a);
    expect(ab.lessons).toEqual(ba.lessons);
    expect(ab.xpByDay).toEqual(ba.xpByDay);
    expect(ab.srs).toEqual(ba.srs);
    expect(ab.achievements).toEqual(ba.achievements);
  });

  it("takes profile and settings from the most recently changed copy", () => {
    const a: Progress = { ...base, updatedAt: day(5), settings: { ...base.settings, sound: false } };
    const b: Progress = { ...base, updatedAt: day(4), settings: { ...base.settings, sound: true } };
    expect(mergeProgress(a, b).settings.sound).toBe(false);
    expect(mergeProgress(b, a).settings.sound).toBe(false);
    expect(mergeProgress(a, b).updatedAt).toBe(day(5));
  });

  it("keeps the streak of the copy that practised last and the best ever", () => {
    let a = base;
    for (let d = 2; d <= 4; d++) a = play(a, lesson("greetings-1"), day(d)); // 4-day streak
    const b = play(base, lesson("greetings-2"), day(6)); // practised later, streak restarted
    const m = mergeProgress(a, b);
    expect(m.streak.lastDay).toBe("2026-01-06");
    expect(m.streak.count).toBe(1);
    expect(m.streak.best).toBe(4);
  });

  it("keeps the most recent review card and the earliest badge unlock", () => {
    const a: Progress = {
      ...base,
      srs: { x: { box: 3, due: 0, right: 3, wrong: 0, lastSeen: 100 } },
      achievements: { first: 50 },
    };
    const b: Progress = {
      ...base,
      srs: { x: { box: 0, due: 0, right: 3, wrong: 1, lastSeen: 200 } },
      achievements: { first: 20, clear: 30 },
    };
    const m = mergeProgress(a, b);
    expect(m.srs.x!.lastSeen).toBe(200);
    expect(m.achievements).toEqual({ first: 20, clear: 30 });
  });

  it("merging a copy with itself changes nothing", () => {
    expect(sameProgress(mergeProgress(base, base), base)).toBe(true);
  });

  it("a fresh install never wipes cloud progress", () => {
    const fresh = emptyProgress(day(9));
    const m = mergeProgress(fresh, base);
    expect(m.profile).toEqual(base.profile);
    expect(m.lessons).toEqual(base.lessons);
    expect(m.xpTotal).toBe(base.xpTotal);
  });
});
