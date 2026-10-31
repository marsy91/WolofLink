// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { afterEach, describe, expect, it, vi } from "vitest";
import { course } from "@/content/course";
import { findLesson } from "@/content/course";
import { answer, next, startSession } from "./session";
import { buildLesson, seeded } from "./engine";

/** premium.ts reads its build switches when it loads, so load a fresh copy per configuration. */
async function loadPremium(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("./premium");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("free launch (Premium switched off, the default)", () => {
  it("opens every unit and dialogue without Premium", async () => {
    const m = await loadPremium({ NEXT_PUBLIC_PREMIUM: "" });
    expect(m.FREE_UNITS).toBe(course.units.length);
    expect(m.FREE_LESSON_COUNT).toBe(m.TOTAL_LESSON_COUNT);
    course.units.forEach((unit, i) => {
      expect(m.isPremiumUnit(i)).toBe(false);
      for (const lesson of unit.lessons) expect(m.canOpenLesson(lesson.id, false), lesson.id).toBe(true);
      if (unit.story) expect(m.canOpenStory(unit.story.id, false)).toBe(true);
    });
  });

  it("ignores NEXT_PUBLIC_FREE_UNITS while Premium is off", async () => {
    const m = await loadPremium({ NEXT_PUBLIC_PREMIUM: "", NEXT_PUBLIC_FREE_UNITS: "1" });
    expect(m.FREE_UNITS).toBe(course.units.length);
  });
});

describe("premium gating (NEXT_PUBLIC_PREMIUM=on)", () => {
  it("keeps the first units free and gates the rest", async () => {
    const m = await loadPremium({ NEXT_PUBLIC_PREMIUM: "on" });
    expect(m.FREE_UNITS).toBe(3);
    course.units.forEach((unit, i) => {
      for (const lesson of unit.lessons) {
        expect(m.isPremiumLesson(lesson.id), lesson.id).toBe(i >= m.FREE_UNITS);
        expect(m.canOpenLesson(lesson.id, true)).toBe(true);
        expect(m.canOpenLesson(lesson.id, false)).toBe(i < m.FREE_UNITS);
      }
      if (unit.story) {
        expect(m.isPremiumStory(unit.story.id)).toBe(i >= m.FREE_UNITS);
        expect(m.canOpenStory(unit.story.id, false)).toBe(i < m.FREE_UNITS);
      }
    });
  });

  it("leaves a meaningful free tier", async () => {
    const m = await loadPremium({ NEXT_PUBLIC_PREMIUM: "on" });
    expect(m.FREE_LESSON_COUNT).toBeGreaterThanOrEqual(6);
    expect(m.FREE_LESSON_COUNT).toBeLessThan(m.TOTAL_LESSON_COUNT);
    expect(m.canOpenLesson("greetings-1", false)).toBe(true);
    expect(m.canOpenStory("story-meeting", false)).toBe(true);
    expect(m.canOpenStory("story-taxi", false)).toBe(false);
  });

  it("unknown ids are never treated as premium", async () => {
    const m = await loadPremium({ NEXT_PUBLIC_PREMIUM: "on" });
    expect(m.isPremiumLesson("nope")).toBe(false);
    expect(m.canOpenLesson("nope", false)).toBe(true);
  });

  it("unlimited drops never fail a premium lesson", () => {
    const ex = buildLesson(findLesson("family-1")!.lesson, { course, lang: "en", rng: seeded(2) });
    let s = startSession(ex, Number.POSITIVE_INFINITY, "lesson");
    for (let i = 0; i < 10; i++) s = next(answer(s, false));
    expect(s.status).toBe("playing");
    expect(s.drops).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("build switches", () => {
  it("hides accounts when switched off, even with Supabase settings", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");
    vi.stubEnv("NEXT_PUBLIC_ACCOUNTS", "off");
    expect((await import("./features")).ACCOUNTS_ENABLED).toBe(false);
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_ACCOUNTS", "");
    expect((await import("./features")).ACCOUNTS_ENABLED).toBe(true);
  });

  it("keeps the Circle demo off unless asked for", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CIRCLE", "");
    expect((await import("./features")).CIRCLE_ENABLED).toBe(false);
  });
});
