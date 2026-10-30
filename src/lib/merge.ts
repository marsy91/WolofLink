// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Merges two copies of a learner's progress (this device and the cloud).
 *
 * Learning is never lost: completions, XP per day, badges and review cards
 * are combined field by field. Only choices that can't be combined (profile,
 * settings, drops, recent-mistakes list) come from the most recently changed
 * copy. Pure and covered by merge.test.ts.
 */
import type { Progress, SrsCard } from "./progress";

function mergeRecord<T>(a: Record<string, T>, b: Record<string, T>, pick: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? pick(out[k]!, v) : v;
  return out;
}

const laterCard = (x: SrsCard, y: SrsCard) => (y.lastSeen > x.lastSeen ? y : x);

export function mergeProgress(local: Progress, remote: Progress): Progress {
  const newer = remote.updatedAt > local.updatedAt ? remote : local;

  const xpByDay = mergeRecord(local.xpByDay, remote.xpByDay, Math.max);
  const daySum = Object.values(xpByDay).reduce((n, x) => n + x, 0);

  // Streak: the copy that practised most recently is authoritative.
  const a = local.streak;
  const b = remote.streak;
  const streakSource = (b.lastDay ?? "") > (a.lastDay ?? "") ? b : (a.lastDay ?? "") > (b.lastDay ?? "") ? a : a.count >= b.count ? a : b;

  return {
    version: 1,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    profile: newer.profile ?? local.profile ?? remote.profile,
    xpTotal: Math.max(local.xpTotal, remote.xpTotal, daySum),
    xpByDay,
    streak: { ...streakSource, best: Math.max(a.best, b.best, streakSource.count) },
    drops: newer.drops,
    lessons: mergeRecord(local.lessons, remote.lessons, (x, y) => ({
      times: Math.max(x.times, y.times),
      bestAccuracy: Math.max(x.bestAccuracy, y.bestAccuracy),
      lastAt: Math.max(x.lastAt, y.lastAt),
    })),
    stories: mergeRecord(local.stories, remote.stories, (x, y) => ({
      times: Math.max(x.times, y.times),
      lastAt: Math.max(x.lastAt, y.lastAt),
    })),
    srs: mergeRecord(local.srs, remote.srs, laterCard),
    recentMistakes: newer.recentMistakes,
    // Keep the earliest unlock time of each badge.
    achievements: mergeRecord(local.achievements, remote.achievements, Math.min),
    reviews: Math.max(local.reviews, remote.reviews),
    settings: newer.settings,
  };
}

/** True when two copies hold the same data (ignoring key order). */
export function sameProgress(a: Progress, b: Progress): boolean {
  return stableJson(a) === stableJson(b);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_k, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([x], [y]) => x.localeCompare(y)))
      : v,
  );
}
