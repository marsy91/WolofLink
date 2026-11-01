// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Word of the day: one course word or short phrase per calendar day, the same for everyone. */
import { course } from "./course";
import type { Entry } from "./types";

const POOL: Entry[] = Object.values(course.entries)
  .filter((e) => e.wo.split(/\s+/).length <= 4)
  .sort((a, b) => a.id.localeCompare(b.id));

/** Small deterministic hash so consecutive days don't give neighbouring words. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function wordOfTheDay(now: Date): Entry {
  const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  return POOL[hash(key) % POOL.length]!;
}
