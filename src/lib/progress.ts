// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Learner progress: profile, XP, streak, drops (lives), spaced repetition and
 * achievements. Everything here is a pure function of (progress, input, now),
 * so the storage backend can change (localStorage today, cloud sync later)
 * without touching game rules. Covered by progress.test.ts.
 */
import { allLessons } from "@/content/course";
import type { UiLang } from "@/content/types";

export const GOALS = { casual: 10, regular: 20, serious: 30, intense: 50 } as const;
export type GoalId = keyof typeof GOALS;

export const MAX_DROPS = 5;
export const DROP_REFILL_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Leitner intervals in days for boxes 0..5. */
export const SRS_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16] as const;

export interface Profile {
  id: string;
  name: string;
  uiLang: UiLang;
  target: "wo";
  goal: GoalId;
  createdAt: number;
  /** Guest until accounts exist; `accountId` will link a cloud user later. */
  guest: true;
}

export interface SrsCard {
  box: number;
  due: number;
  right: number;
  wrong: number;
  lastSeen: number;
}

export interface Progress {
  version: 1;
  /** Last local change (ms). Decides which copy wins for fields that can't be merged. */
  updatedAt: number;
  profile: Profile | null;
  xpTotal: number;
  /** XP per local calendar day, keyed YYYY-MM-DD. */
  xpByDay: Record<string, number>;
  /** `shields` cover one missed day each; earned every 7 streak days, max MAX_SHIELDS. */
  streak: { count: number; best: number; lastDay: string | null; shields: number };
  drops: { count: number; updatedAt: number };
  lessons: Record<string, { times: number; bestAccuracy: number; lastAt: number }>;
  srs: Record<string, SrsCard>;
  /** Entry ids missed recently, newest first. */
  recentMistakes: string[];
  achievements: Record<string, number>;
  reviews: number;
  stories: Record<string, { times: number; lastAt: number }>;
  /** Phrasebook ids the learner starred, most recent first. */
  savedPhrases: string[];
  settings: {
    sound: boolean;
    autoplay: boolean;
    haptics: boolean;
    reminder: { enabled: boolean; hour: number; minute: number };
    /** Colour theme: the classic WolofLink palette or the colours of the Senegalese flag. */
    theme?: "classic" | "senegal";
    /** Notify the evening before holidays and important dates (Holidays screen). */
    holidayReminders?: boolean;
    /** Seasonal themes for holidays and special events (on unless switched off). */
    seasonal?: boolean;
  };
}

export function emptyProgress(now = Date.now()): Progress {
  return {
    version: 1,
    updatedAt: 0,
    profile: null,
    xpTotal: 0,
    xpByDay: {},
    streak: { count: 0, best: 0, lastDay: null, shields: 0 },
    drops: { count: MAX_DROPS, updatedAt: now },
    lessons: {},
    srs: {},
    recentMistakes: [],
    achievements: {},
    reviews: 0,
    stories: {},
    savedPhrases: [],
    settings: { sound: true, autoplay: true, haptics: true, reminder: { enabled: false, hour: 19, minute: 0 } },
  };
}

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(time: number): string {
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const MAX_SHIELDS = 2;
export const SHIELD_EVERY = 7;

/** Whole calendar days from `from` to `to` (both YYYY-MM-DD), DST-safe. */
export function daysBetween(from: string, to: string): number {
  const noon = (k: string) => {
    const [y, m, d] = k.split("-").map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((noon(to) - noon(from)) / DAY_MS);
}

/**
 * The streak as it stands now. It survives if today or yesterday was
 * practised, or if exactly one day was missed and a shield is available.
 */
export function currentStreak(p: Progress, now: number): number {
  const { lastDay, count, shields } = p.streak;
  if (!lastDay) return 0;
  const gap = daysBetween(lastDay, dayKey(now));
  return gap <= 1 || (gap === 2 && shields > 0) ? count : 0;
}

export function xpToday(p: Progress, now: number): number {
  return p.xpByDay[dayKey(now)] ?? 0;
}

export function dailyGoal(p: Progress): number {
  return GOALS[p.profile?.goal ?? "regular"];
}

/** Apply time-based refills. */
export function refreshDrops(p: Progress, now: number): Progress {
  const { count, updatedAt } = p.drops;
  if (count >= MAX_DROPS) return p;
  const gained = Math.floor((now - updatedAt) / DROP_REFILL_MS);
  if (gained <= 0) return p;
  const next = Math.min(MAX_DROPS, count + gained);
  return { ...p, drops: { count: next, updatedAt: next === MAX_DROPS ? now : updatedAt + gained * DROP_REFILL_MS } };
}

/** Minutes until the next drop, or null when full. */
export function minutesToNextDrop(p: Progress, now: number): number | null {
  if (p.drops.count >= MAX_DROPS) return null;
  return Math.max(1, Math.ceil((p.drops.updatedAt + DROP_REFILL_MS - now) / 60000));
}

export function spendDrop(p: Progress, now: number): Progress {
  const fresh = refreshDrops(p, now);
  if (fresh.drops.count <= 0) return fresh;
  // Start the refill clock from the first missing drop.
  const updatedAt = fresh.drops.count === MAX_DROPS ? now : fresh.drops.updatedAt;
  return { ...fresh, drops: { count: fresh.drops.count - 1, updatedAt } };
}

export function updateCard(card: SrsCard | undefined, correct: boolean, now: number): SrsCard {
  const base = card ?? { box: 0, due: now, right: 0, wrong: 0, lastSeen: now };
  const box = correct ? Math.min(SRS_INTERVAL_DAYS.length - 1, base.box + 1) : 0;
  // A miss comes back in the very next review; a hit waits for its interval.
  const due = correct ? now + SRS_INTERVAL_DAYS[box]! * DAY_MS : now;
  return {
    box,
    due,
    right: base.right + (correct ? 1 : 0),
    wrong: base.wrong + (correct ? 0 : 1),
    lastSeen: now,
  };
}

/** Entry ids due for review, missed items and the most overdue first. */
export function dueEntries(p: Progress, now: number, limit = 10): string[] {
  return Object.entries(p.srs)
    .filter(([, c]) => c.due <= now)
    .sort(([, a], [, b]) => a.box - b.box || a.due - b.due)
    .slice(0, limit)
    .map(([id]) => id);
}

export interface SessionResult {
  mode: "lesson" | "review" | "story";
  lessonId?: string;
  storyId?: string;
  /** Lesson level just played (1–3). */
  level?: number;
  xp: number;
  accuracy: number;
  outcomes: Record<string, boolean>;
  mistakes: number;
}

export interface AchievementDef {
  id: string;
  glyph: "path" | "wave" | "count" | "bowl" | "drop" | "sun" | "sprout" | "loop" | "compass" | "chat" | "ring" | "book";
  test: (p: Progress, r: SessionResult | null, now: number) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first", glyph: "path", test: (p) => Object.keys(p.lessons).length >= 1 },
  { id: "greeter", glyph: "wave", test: (p) => !!p.lessons["greetings-1"] },
  { id: "counter", glyph: "count", test: (p) => !!p.lessons["numbers-1"] },
  { id: "chef", glyph: "bowl", test: (p) => !!p.lessons["food-1"] },
  { id: "clear", glyph: "drop", test: (_p, r) => r?.mode === "lesson" && r.mistakes === 0 },
  { id: "sunrise", glyph: "sun", test: (p, _r, now) => currentStreak(p, now) >= 3 },
  { id: "sprout", glyph: "sprout", test: (p) => p.xpTotal >= 100 },
  { id: "second", glyph: "loop", test: (p) => p.reviews >= 1 },
  { id: "road", glyph: "compass", test: (p) => Object.keys(p.lessons).length >= 8 },
  { id: "teraanga", glyph: "chat", test: (p) => allLessons.every((l) => p.lessons[l.id]) },
  { id: "ring", glyph: "ring", test: (p) => Object.values(p.lessons).some((l) => l.times >= 3) },
  { id: "reader", glyph: "book", test: (p) => Object.keys(p.stories).length >= 1 },
];

export interface ApplyOutcome {
  progress: Progress;
  newAchievements: string[];
  streakExtended: boolean;
  /** A shield was spent to bridge a missed day. */
  shieldUsed: boolean;
  /** A new shield was earned by this session. */
  shieldEarned: boolean;
}

export function applySession(p: Progress, r: SessionResult, now: number): ApplyOutcome {
  const today = dayKey(now);
  let next: Progress = refreshDrops(p, now);

  // XP
  next = {
    ...next,
    xpTotal: next.xpTotal + r.xp,
    xpByDay: { ...next.xpByDay, [today]: (next.xpByDay[today] ?? 0) + r.xp },
  };

  // Streak: the first finished session of a day extends it.
  const streakExtended = next.streak.lastDay !== today;
  let shieldUsed = false;
  let shieldEarned = false;
  if (streakExtended) {
    const { lastDay, shields } = next.streak;
    const gap = lastDay ? daysBetween(lastDay, today) : Infinity;
    shieldUsed = gap === 2 && shields > 0;
    const alive = gap === 1 || shieldUsed;
    const count = alive ? next.streak.count + 1 : 1;
    let nextShields = shieldUsed ? shields - 1 : alive ? shields : 0;
    if (count % SHIELD_EVERY === 0 && nextShields < MAX_SHIELDS) {
      nextShields += 1;
      shieldEarned = true;
    }
    next = {
      ...next,
      streak: { count, best: Math.max(next.streak.best, count), lastDay: today, shields: nextShields },
    };
  }

  // Lesson record
  if (r.mode === "lesson" && r.lessonId) {
    const prev = next.lessons[r.lessonId];
    next = {
      ...next,
      lessons: {
        ...next.lessons,
        [r.lessonId]: {
          times: (prev?.times ?? 0) + 1,
          bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, r.accuracy),
          lastAt: now,
        },
      },
    };
  }

  if (r.mode === "story" && r.storyId) {
    const prev = next.stories[r.storyId];
    next = { ...next, stories: { ...next.stories, [r.storyId]: { times: (prev?.times ?? 0) + 1, lastAt: now } } };
  }

  // Spaced repetition + recent mistakes
  const srs = { ...next.srs };
  let recent = next.recentMistakes;
  for (const [id, ok] of Object.entries(r.outcomes)) {
    srs[id] = updateCard(srs[id], ok, now);
    recent = ok ? recent.filter((x) => x !== id) : [id, ...recent.filter((x) => x !== id)];
  }
  next = { ...next, srs, recentMistakes: recent.slice(0, 20) };

  // Reviews refill one drop.
  if (r.mode === "review") {
    const count = Math.min(MAX_DROPS, next.drops.count + 1);
    next = { ...next, reviews: next.reviews + 1, drops: { count, updatedAt: count === MAX_DROPS ? now : next.drops.updatedAt } };
  }

  // Achievements
  const newAchievements: string[] = [];
  const achievements = { ...next.achievements };
  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.test(next, r, now)) {
      achievements[a.id] = now;
      newAchievements.push(a.id);
    }
  }
  next = { ...next, achievements };

  return { progress: next, newAchievements, streakExtended, shieldUsed, shieldEarned };
}

/** Star or unstar a phrasebook entry. */
export function toggleSavedPhrase(p: Progress, id: string): Progress {
  const saved = p.savedPhrases.includes(id) ? p.savedPhrases.filter((x) => x !== id) : [id, ...p.savedPhrases];
  return { ...p, savedPhrases: saved };
}

/** Level the next play of a lesson will use (1–3); replays after that stay at 3. */
export function nextLevel(p: Progress, lessonId: string, max = 3): number {
  return Math.min(max, (p.lessons[lessonId]?.times ?? 0) + 1);
}

/** Lessons unlock in course order. */
export function isUnlocked(lessonOrder: string[], lessonId: string, p: Progress): boolean {
  const i = lessonOrder.indexOf(lessonId);
  if (i <= 0) return i === 0;
  return !!p.lessons[lessonOrder[i - 1]!];
}

/** Guard against corrupted or older stored data. */
export function migrate(raw: unknown, now = Date.now()): Progress {
  const base = emptyProgress(now);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Progress>;
  if (r.version !== 1) return base;
  return {
    ...base,
    ...r,
    streak: { ...base.streak, ...r.streak },
    drops: { ...base.drops, ...r.drops },
    settings: { ...base.settings, ...r.settings, reminder: { ...base.settings.reminder, ...r.settings?.reminder } },
  };
}
