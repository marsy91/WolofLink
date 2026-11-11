// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * The Feed layout of the Learn screen (Lac Rose and Gorée themes): story rings for
 * "continue", dialogues and phrasebook situations, then a feed of everyday phrases to
 * listen to, save and share. Phrases come from the phrasebook (src/content/phrasebook.ts),
 * so saving uses the same list as the Phrases tab. The order changes once a day.
 */
import type { Entry, Lesson } from "@/content/types";
import { seeded } from "./engine";

export interface FeedPost {
  entry: Entry;
  categoryId: string;
}

/** Days since 1970 in local time, so the feed changes at local midnight. */
export function dayNumber(now: number): number {
  const d = new Date(now);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/** A stable shuffle for the day: the same order all day, a new one tomorrow. */
export function dailyOrder<T>(items: readonly T[], day: number): T[] {
  const rng = seeded(day * 7919 + 17);
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j]!, list[i]!];
  }
  return list;
}

/**
 * Phrase posts for the day. With a category, only that situation; otherwise the
 * situations take turns so the feed stays varied (no two posts in a row from one).
 */
export function feedPosts(
  categories: readonly { id: string; phrases: readonly Entry[] }[],
  day: number,
  only: string | null = null,
): FeedPost[] {
  const chosen = only ? categories.filter((c) => c.id === only) : categories;
  const queues = dailyOrder(chosen, day).map((c) => ({ id: c.id, items: dailyOrder(c.phrases, day + c.id.length) }));
  const posts: FeedPost[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const entry = q.items.shift();
      if (entry) {
        posts.push({ entry, categoryId: q.id });
        added = true;
      }
    }
  }
  return posts;
}

/** The lesson "Continue" opens: the first open lesson not done yet, else the first one not mastered. */
export function continueLesson(
  lessons: readonly Lesson[],
  done: (id: string) => number,
  open: (id: string) => boolean,
  mastered = 3,
): Lesson | null {
  return lessons.find((l) => open(l.id) && done(l.id) === 0) ?? lessons.find((l) => open(l.id) && done(l.id) < mastered) ?? null;
}
