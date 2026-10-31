// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * What is free and what needs WolofLink Premium. Pure, covered by premium.test.ts.
 *
 * Free: the first FREE_UNITS units (lessons and their dialogues).
 * Premium: every unit, unlimited drops.
 */
import { course } from "@/content/course";

/**
 * Units 1–3 are free. NEXT_PUBLIC_FREE_UNITS can raise this in local test builds (e.g. to
 * play every lesson in an automated browser); it's fixed at build time and never set for
 * store builds.
 */
export const FREE_UNITS = Number(process.env.NEXT_PUBLIC_FREE_UNITS) || 3;
export const ENTITLEMENT = "premium";

const unitIndexOfLesson = new Map(course.units.flatMap((u, i) => u.lessons.map((l) => [l.id, i] as const)));
const unitIndexOfStory = new Map(course.units.flatMap((u, i) => (u.story ? [[u.story.id, i] as const] : [])));

export function isPremiumUnit(unitIndex: number): boolean {
  return unitIndex >= FREE_UNITS;
}

export function isPremiumLesson(lessonId: string): boolean {
  const i = unitIndexOfLesson.get(lessonId);
  return i !== undefined && isPremiumUnit(i);
}

export function isPremiumStory(storyId: string): boolean {
  const i = unitIndexOfStory.get(storyId);
  return i !== undefined && isPremiumUnit(i);
}

/** Whether a learner may open this lesson right now, ignoring the in-order unlocks. */
export function canOpenLesson(lessonId: string, premium: boolean): boolean {
  return premium || !isPremiumLesson(lessonId);
}

export function canOpenStory(storyId: string, premium: boolean): boolean {
  return premium || !isPremiumStory(storyId);
}

export const FREE_LESSON_COUNT = course.units.slice(0, FREE_UNITS).reduce((n, u) => n + u.lessons.length, 0);
export const TOTAL_LESSON_COUNT = course.units.reduce((n, u) => n + u.lessons.length, 0);
