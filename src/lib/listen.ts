// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Hands-free listening: a playlist of Wolof lines, each heard at normal speed,
 * then slowly, then its meaning. Works offline with the bundled clips.
 */
import { course } from "@/content/course";
import type { Progress } from "./progress";

export type ListenSource = "learned" | string;

/** Steps for one line, in order. Pauses give time to repeat out loud. */
export const LISTEN_STEPS = ["wolof", "pause", "slow", "pause", "meaning", "pause"] as const;
export type ListenStep = (typeof LISTEN_STEPS)[number];
export const PAUSE_MS = 1600;
export const MAX_PLAYLIST = 40;

/** The lines to play: words the learner has met (most recently studied first), or one unit. */
export function listenPlaylist(source: ListenSource, p: Pick<Progress, "srs">): string[] {
  if (source === "learned") {
    return Object.entries(p.srs)
      .filter(([id]) => course.entries[id])
      .sort(([, a], [, b]) => b.lastSeen - a.lastSeen)
      .map(([id]) => id)
      .slice(0, MAX_PLAYLIST);
  }
  const unit = course.units.find((u) => u.id === source);
  if (!unit) return [];
  return [...new Set(unit.lessons.flatMap((l) => l.entries))].slice(0, MAX_PLAYLIST);
}

/** Where to go after a step: the next step of this line, or the first step of the next line (wrapping when looping). */
export function nextPosition(line: number, step: number, length: number, loop: boolean): { line: number; step: number } | null {
  if (step + 1 < LISTEN_STEPS.length) return { line, step: step + 1 };
  if (line + 1 < length) return { line: line + 1, step: 0 };
  return loop && length > 0 ? { line: 0, step: 0 } : null;
}
