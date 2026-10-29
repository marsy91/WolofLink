/**
 * Learner progress: profile, XP, streak, drops (lives), spaced repetition and
 * achievements. Everything here is a pure function of (progress, input, now),
 * so the storage backend can change (localStorage today, cloud sync later)
 * without touching game rules. Covered by progress.test.ts.
 */
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
  profile: Profile | null;
  xpTotal: number;
  /** XP per local calendar day, keyed YYYY-MM-DD. */
  xpByDay: Record<string, number>;
  streak: { count: number; best: number; lastDay: string | null };
  drops: { count: number; updatedAt: number };
  lessons: Record<string, { times: number; bestAccuracy: number; lastAt: number }>;
  srs: Record<string, SrsCard>;
  /** Entry ids missed recently, newest first. */
  recentMistakes: string[];
  achievements: Record<string, number>;
  reviews: number;
  settings: { sound: boolean; autoplay: boolean };
}

export function emptyProgress(now = Date.now()): Progress {
  return {
    version: 1,
    profile: null,
    xpTotal: 0,
    xpByDay: {},
    streak: { count: 0, best: 0, lastDay: null },
    drops: { count: MAX_DROPS, updatedAt: now },
    lessons: {},
    srs: {},
    recentMistakes: [],
    achievements: {},
    reviews: 0,
    settings: { sound: true, autoplay: true },
  };
}

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(time: number): string {
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function previousDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number) as [number, number, number];
  return dayKey(new Date(y, m - 1, d - 1, 12).getTime());
}

/** The streak as it stands now: it lapses if neither today nor yesterday was practised. */
export function currentStreak(p: Progress, now: number): number {
  const { lastDay, count } = p.streak;
  if (!lastDay) return 0;
  const today = dayKey(now);
  return lastDay === today || lastDay === previousDay(today) ? count : 0;
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
  mode: "lesson" | "review";
  lessonId?: string;
  xp: number;
  accuracy: number;
  outcomes: Record<string, boolean>;
  mistakes: number;
}

export interface AchievementDef {
  id: string;
  glyph: "path" | "wave" | "count" | "bowl" | "drop" | "sun" | "sprout" | "loop";
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
];

export interface ApplyOutcome {
  progress: Progress;
  newAchievements: string[];
  streakExtended: boolean;
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
  const streakBefore = currentStreak(next, now);
  const streakExtended = next.streak.lastDay !== today;
  if (streakExtended) {
    const count = streakBefore + 1;
    next = { ...next, streak: { count, best: Math.max(next.streak.best, count), lastDay: today } };
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

  return { progress: next, newAchievements, streakExtended };
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
    settings: { ...base.settings, ...r.settings },
  };
}
