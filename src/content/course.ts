// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { entries, unitModules } from "./entries";
import type { Course } from "./types";

export const course: Course = {
  id: "wo-core",
  target: "wo",
  title: { en: "Wolof", fr: "Wolof", es: "Wolof", de: "Wolof", it: "Wolof" },
  units: unitModules.map((m) => m.unit),
  entries,
};

export const allLessons = course.units.flatMap((u) => u.lessons);

export function findLesson(id: string) {
  for (const unit of course.units) {
    const lesson = unit.lessons.find((l) => l.id === id);
    if (lesson) return { unit, lesson };
  }
  return null;
}

export const allStories = course.units.flatMap((u) => (u.story ? [{ unit: u, story: u.story }] : []));

export function findStory(id: string) {
  return allStories.find((s) => s.story.id === id) ?? null;
}

/** Story lines are addressed as `<story id>.<line number>`, e.g. `story-taxi.3`; also their audio file name. */
export function storyLineId(storyId: string, index: number): string {
  return `${storyId}.${index + 1}`;
}
