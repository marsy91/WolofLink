// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import {
  applySession,
  currentStreak,
  DROP_REFILL_MS,
  dueEntries,
  emptyProgress,
  isUnlocked,
  MAX_DROPS,
  migrate,
  minutesToNextDrop,
  nextLevel,
  refreshDrops,
  spendDrop,
  type SessionResult,
} from "./progress";

const day = (d: number, h = 10) => new Date(2026, 0, d, h).getTime();
const lesson = (over: Partial<SessionResult> = {}): SessionResult => ({
  mode: "lesson",
  lessonId: "greetings-1",
  xp: 10,
  accuracy: 0.9,
  outcomes: { "g.salaam": true, "g.fi": false },
  mistakes: 1,
  ...over,
});

describe("streak", () => {
  it("starts, extends on consecutive days, and lapses after a gap", () => {
    let p = applySession(emptyProgress(day(1)), lesson(), day(1)).progress;
    expect(currentStreak(p, day(1))).toBe(1);
    p = applySession(p, lesson(), day(1, 18)).progress; // same day: no change
    expect(p.streak.count).toBe(1);
    p = applySession(p, lesson(), day(2)).progress;
    expect(currentStreak(p, day(2))).toBe(2);
    expect(currentStreak(p, day(3))).toBe(2); // still alive the next day
    expect(currentStreak(p, day(4))).toBe(0); // lapsed
    p = applySession(p, lesson(), day(5)).progress;
    expect(p.streak.count).toBe(1);
    expect(p.streak.best).toBe(2);
  });

  it("handles month boundaries", () => {
    const jan31 = new Date(2026, 0, 31, 10).getTime();
    const feb1 = new Date(2026, 1, 1, 10).getTime();
    const p = applySession(emptyProgress(jan31), lesson(), jan31).progress;
    expect(currentStreak(p, feb1)).toBe(1);
  });
});

describe("drops", () => {
  it("spends, refills every 30 minutes, and caps at the maximum", () => {
    let p = emptyProgress(0);
    p = spendDrop(spendDrop(p, 0), 0);
    expect(p.drops.count).toBe(MAX_DROPS - 2);
    expect(minutesToNextDrop(p, 0)).toBe(30);
    expect(refreshDrops(p, DROP_REFILL_MS).drops.count).toBe(MAX_DROPS - 1);
    expect(refreshDrops(p, DROP_REFILL_MS * 10).drops.count).toBe(MAX_DROPS);
    expect(minutesToNextDrop(refreshDrops(p, DROP_REFILL_MS * 10), DROP_REFILL_MS * 10)).toBeNull();
  });

  it("never goes below zero", () => {
    let p = emptyProgress(0);
    for (let i = 0; i < 10; i++) p = spendDrop(p, 0);
    expect(p.drops.count).toBe(0);
  });

  it("review sessions refill one drop", () => {
    const p = spendDrop(spendDrop(emptyProgress(0), 0), 0);
    const r = applySession(p, { mode: "review", xp: 5, accuracy: 1, outcomes: {}, mistakes: 0 }, 1000).progress;
    expect(r.drops.count).toBe(MAX_DROPS - 1);
    expect(r.reviews).toBe(1);
  });
});

describe("xp, srs and achievements", () => {
  it("adds XP to the total and to today", () => {
    const p = applySession(emptyProgress(day(1)), lesson({ xp: 15 }), day(1)).progress;
    expect(p.xpTotal).toBe(15);
    expect(p.xpByDay["2026-01-01"]).toBe(15);
  });

  it("schedules misses for immediate review and hits for later", () => {
    const p = applySession(emptyProgress(day(1)), lesson(), day(1)).progress;
    expect(p.srs["g.fi"]!.box).toBe(0);
    expect(p.srs["g.salaam"]!.box).toBe(1);
    expect(dueEntries(p, day(1))).toEqual(["g.fi"]);
    expect(dueEntries(p, day(2, 11)).sort()).toEqual(["g.fi", "g.salaam"]);
    expect(p.recentMistakes).toEqual(["g.fi"]);
  });

  it("unlocks achievements once", () => {
    const first = applySession(emptyProgress(day(1)), lesson({ mistakes: 0 }), day(1));
    expect(first.newAchievements).toEqual(expect.arrayContaining(["first", "greeter", "clear"]));
    const again = applySession(first.progress, lesson({ mistakes: 0 }), day(1));
    expect(again.newAchievements).toEqual([]);
  });

  it("unlocks lessons in order", () => {
    const order = ["a", "b", "c"];
    const p = emptyProgress();
    expect(isUnlocked(order, "a", p)).toBe(true);
    expect(isUnlocked(order, "b", p)).toBe(false);
    p.lessons.a = { times: 1, bestAccuracy: 1, lastAt: 0 };
    expect(isUnlocked(order, "b", p)).toBe(true);
    expect(isUnlocked(order, "zzz", p)).toBe(false);
  });
});

describe("migrate", () => {
  it("falls back to a fresh profile for unknown data", () => {
    expect(migrate(null).profile).toBeNull();
    expect(migrate({ version: 99 }).xpTotal).toBe(0);
    expect(migrate({ version: 1, xpTotal: 40 }).xpTotal).toBe(40);
  });
});

describe("streak shields", () => {
  it("earns a shield every 7 days and spends it on one missed day", () => {
    let p = emptyProgress(day(1));
    for (let d = 1; d <= 7; d++) p = applySession(p, lesson(), day(d)).progress;
    expect(p.streak.count).toBe(7);
    expect(p.streak.shields).toBe(1);
    // Day 8 missed: the streak still shows on day 9 thanks to the shield…
    expect(currentStreak(p, day(9))).toBe(7);
    const r = applySession(p, lesson(), day(9));
    expect(r.shieldUsed).toBe(true);
    expect(r.progress.streak.count).toBe(8);
    expect(r.progress.streak.shields).toBe(0);
    // …but two missed days break it.
    expect(currentStreak(r.progress, day(12))).toBe(0);
    expect(applySession(r.progress, lesson(), day(12)).progress.streak.count).toBe(1);
  });

  it("caps shields", () => {
    let p = emptyProgress(day(1));
    for (let d = 1; d <= 28; d++) p = applySession(p, lesson(), day(d)).progress;
    expect(p.streak.shields).toBe(2);
  });
});

describe("levels and stories", () => {
  it("plays the next level until mastered", () => {
    let p = emptyProgress(day(1));
    expect(nextLevel(p, "greetings-1")).toBe(1);
    for (let i = 0; i < 4; i++) p = applySession(p, lesson(), day(1)).progress;
    expect(nextLevel(p, "greetings-1")).toBe(3);
    expect(p.achievements.ring).toBeDefined();
  });

  it("records stories and unlocks the reader badge", () => {
    const r = applySession(
      emptyProgress(day(1)),
      { mode: "story", storyId: "story-meeting", xp: 10, accuracy: 1, outcomes: {}, mistakes: 0 },
      day(1),
    );
    expect(r.progress.stories["story-meeting"]?.times).toBe(1);
    expect(r.newAchievements).toContain("reader");
  });

  it("migrates settings written by older versions", () => {
    const old = { version: 1, settings: { sound: false, autoplay: true }, streak: { count: 3, best: 3, lastDay: "2026-01-01" } };
    const p = migrate(old);
    expect(p.settings.sound).toBe(false);
    expect(p.settings.haptics).toBe(true);
    expect(p.settings.reminder.hour).toBe(19);
    expect(p.streak.shields).toBe(0);
    expect(p.stories).toEqual({});
  });
});
