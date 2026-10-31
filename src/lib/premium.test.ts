// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import {
  canOpenLesson,
  canOpenStory,
  FREE_LESSON_COUNT,
  FREE_UNITS,
  isPremiumLesson,
  isPremiumStory,
  TOTAL_LESSON_COUNT,
} from "./premium";
import { answer, next, startSession } from "./session";
import { buildLesson, seeded } from "./engine";
import { findLesson } from "@/content/course";

describe("premium gating", () => {
  it("keeps the first units free and gates the rest", () => {
    course.units.forEach((unit, i) => {
      for (const lesson of unit.lessons) {
        expect(isPremiumLesson(lesson.id), lesson.id).toBe(i >= FREE_UNITS);
        expect(canOpenLesson(lesson.id, true)).toBe(true);
        expect(canOpenLesson(lesson.id, false)).toBe(i < FREE_UNITS);
      }
      if (unit.story) {
        expect(isPremiumStory(unit.story.id)).toBe(i >= FREE_UNITS);
        expect(canOpenStory(unit.story.id, false)).toBe(i < FREE_UNITS);
      }
    });
  });

  it("leaves a meaningful free tier", () => {
    expect(FREE_LESSON_COUNT).toBeGreaterThanOrEqual(6);
    expect(FREE_LESSON_COUNT).toBeLessThan(TOTAL_LESSON_COUNT);
    expect(canOpenLesson("greetings-1", false)).toBe(true);
    expect(canOpenStory("story-meeting", false)).toBe(true);
    expect(canOpenStory("story-taxi", false)).toBe(false);
  });

  it("unknown ids are never treated as premium", () => {
    expect(isPremiumLesson("nope")).toBe(false);
    expect(canOpenLesson("nope", false)).toBe(true);
  });

  it("unlimited drops never fail a premium lesson", () => {
    const ex = buildLesson(findLesson("family-1")!.lesson, { course, lang: "en", rng: seeded(2) });
    let s = startSession(ex, Number.POSITIVE_INFINITY, "lesson");
    for (let i = 0; i < 10; i++) s = next(answer(s, false));
    expect(s.status).toBe("playing");
    expect(s.drops).toBe(Number.POSITIVE_INFINITY);
  });
});
