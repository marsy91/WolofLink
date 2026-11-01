// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Seasonal themes: a banner on the Learn screen and a matching accent while a
 * holiday is on (built in, from the holiday calendar's dates), or during an
 * event the owner schedules in the owner console (supabase/migrations/*_seasons.sql).
 * Pure, covered by seasons.test.ts.
 */
import { HOLIDAY_BY_ID, dateIn, localToday, type DateOverrides, type Holiday } from "./calendar";
import type { Translations } from "./types";

export const LOOKS = ["ramadan", "festive", "faith", "flag", "sport", "nature"] as const;
export type Look = (typeof LOOKS)[number];

export const LOOK_EMOJI: Record<Look, string> = {
  ramadan: "🌙",
  festive: "🎉",
  faith: "✨",
  flag: "🇸🇳",
  sport: "🏅",
  nature: "🌿",
};

/** Built-in seasons: which holiday, which look, and how many days before/after the date it shows. */
const BUILT_IN: { holiday: string; look: Look; before: number; after: number }[] = [
  { holiday: "ramadan", look: "ramadan", before: 0, after: 28 },
  { holiday: "korite", look: "festive", before: 1, after: 2 },
  { holiday: "tabaski", look: "festive", before: 2, after: 3 },
  { holiday: "independence", look: "flag", before: 1, after: 0 },
  { holiday: "tamxarit", look: "faith", before: 0, after: 0 },
  { holiday: "magal", look: "faith", before: 1, after: 1 },
  { holiday: "gamou", look: "faith", before: 1, after: 0 },
  { holiday: "new-year", look: "festive", before: 1, after: 0 },
  { holiday: "christmas", look: "festive", before: 1, after: 1 },
];

/** An event the owner scheduled (dates are inclusive, YYYY-MM-DD). */
export interface CustomSeason {
  id: string;
  look: Look;
  starts_on: string;
  ends_on: string;
  title: Translations;
  message: Translations | null;
}

export interface ActiveSeason {
  key: string;
  look: Look;
  title: Translations;
  message: Translations | null;
  /** Course entries to practise from the banner. */
  words: string[];
  /** Set for holidays: the banner links to the holiday calendar. */
  holiday: Holiday | null;
}

const dayNumber = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!) / 864e5;
};

export function isLook(v: unknown): v is Look {
  return typeof v === "string" && (LOOKS as readonly string[]).includes(v);
}

/** The season to show today: an owner event first (latest start wins), then a holiday. */
export function activeSeason(now: Date, overrides: DateOverrides = {}, custom: CustomSeason[] = []): ActiveSeason | null {
  const t = dayNumber(localToday(now));
  const own = custom
    .filter((c) => isLook(c.look) && c.title?.en && dayNumber(c.starts_on) <= t && t <= dayNumber(c.ends_on))
    .sort((a, b) => dayNumber(b.starts_on) - dayNumber(a.starts_on))[0];
  if (own) return { key: `event:${own.id}`, look: own.look, title: own.title, message: own.message, words: [], holiday: null };

  const year = now.getFullYear();
  for (const s of BUILT_IN) {
    const holiday = HOLIDAY_BY_ID[s.holiday];
    if (!holiday) continue;
    for (const y of [year - 1, year, year + 1]) {
      const hit = dateIn(holiday, y, overrides);
      if (!hit) continue;
      const d = dayNumber(hit.date);
      if (d - s.before <= t && t <= d + s.after)
        return { key: `holiday:${holiday.id}:${y}`, look: s.look, title: holiday.title, message: null, words: holiday.words, holiday };
    }
  }
  return null;
}
