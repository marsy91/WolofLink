// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Word duels between friends (supabase/migrations/*_duels.sql). Both players get
 * the same 10 questions: the challenger picks 10 entries and a seed, and the
 * questions (type, distractors, order) are derived from them deterministically,
 * so the opponent rebuilds exactly the same duel. Pure parts are tested in duels.test.ts.
 *
 * Rules (supabase/migrations/*_duel_trophies.sql): the server picks entries neither
 * player has duelled before; each entry answered right earns 1 trophy, once; the
 * questions are 3 rounds and each round won earns a crown; more crowns wins.
 */
import { course } from "@/content/course";
import { isReverseTarget, reverseCourse, type LearnTarget } from "@/content/reverse";
import type { Course, Entry, UiLang } from "@/content/types";
import { translate } from "@/i18n";
import { getCloud } from "./cloud";
import { notifyFriend } from "./push";
import { normalize, seeded, shuffle } from "./engine";
import type { Progress } from "./progress";

export const DUEL_LENGTH = 10;
export const MAX_POINTS = 150;

export type DuelKind = "meaning" | "wolof" | "listen";

export interface DuelQuestion {
  kind: DuelKind;
  entry: Entry;
  /** Option entries (the answer is one of them); labels depend on the kind and language. */
  options: Entry[];
  answer: number;
}

/** Per course: which entries share a unit (near distractors) and every entry id (far ones). */
interface Pools {
  unitOf: Map<string, string[]>;
  all: string[];
}
const pools = new Map<string, Pools>();
function poolsFor(c: Course): Pools {
  let p = pools.get(c.id);
  if (!p) {
    const unitOf = new Map<string, string[]>();
    for (const unit of c.units) {
      const ids = [...new Set(unit.lessons.flatMap((l) => l.entries))];
      for (const id of ids) unitOf.set(id, ids);
    }
    pools.set(c.id, (p = { unitOf, all: Object.keys(c.entries).sort() }));
  }
  return p;
}

/**
 * Two-way duels: the server's entries are Wolof-course ids; a Wolof speaker learning English
 * or French plays the same words turned around ("en:<id>"). Entries with no reversed version
 * (the same word in both languages) stay as Wolof-course questions.
 */
function entryFor(id: string, target: LearnTarget): { entry: Entry; c: Course } {
  if (isReverseTarget(target)) {
    const rc = reverseCourse(target);
    const r = rc.entries[`${target}:${id}`];
    if (r) return { entry: r, c: rc };
  }
  const entry = course.entries[id];
  if (!entry) throw new Error(`Unknown entry ${id}`);
  return { entry, c: course };
}

/** The Wolof-course id behind an entry id ("en:g.salaam" → "g.salaam"). */
export const baseEntryId = (id: string) => id.replace(/^(en|fr):/, "");

/**
 * 10 entries for a practice duel (older flow). Real duels get their entries from the
 * server (start_duel), which never repeats an entry for either player.
 */
export function pickDuelEntries(progress: Progress, seed: number): string[] {
  const rng = seeded(seed);
  // Cards from the reversed course count as the same words.
  const learned = [...new Set(Object.keys(progress.srs).map(baseEntryId))].filter((id) => course.entries[id]);
  const starter = course.units.slice(0, 3).flatMap((u) => u.lessons.flatMap((l) => l.entries));
  const pool = [...new Set(learned.length >= DUEL_LENGTH ? learned : [...learned, ...starter])];
  return shuffle(pool, rng).slice(0, DUEL_LENGTH);
}

/**
 * Rebuilds the duel's questions from its seed and entries. Both players get the same words in
 * the same order and question types; with `target` "en" or "fr" (a Wolof speaker learning English
 * or French) each question is in their direction, so a two-way duel is fair to both.
 */
export function buildDuel(seed: number, entryIds: string[], target: LearnTarget = "wo"): DuelQuestion[] {
  const rng = seeded(seed ^ 0x5eed);
  const kinds: DuelKind[] = ["meaning", "wolof", "listen"];
  return entryIds.map((id, i) => {
    const { entry, c } = entryFor(id, target);
    const { unitOf, all } = poolsFor(c);
    const near = (unitOf.get(entry.id) ?? []).filter((x) => x !== entry.id);
    const far = all.filter((x) => x !== entry.id && !near.includes(x));
    const distractors: Entry[] = [];
    const seen = new Set([normalize(entry.wo), normalize(entry.tr.en)]);
    for (const cand of [...shuffle(near, rng), ...shuffle(far, rng)]) {
      const e = c.entries[cand]!;
      if (seen.has(normalize(e.wo)) || seen.has(normalize(e.tr.en))) continue;
      seen.add(normalize(e.wo));
      seen.add(normalize(e.tr.en));
      distractors.push(e);
      if (distractors.length === 3) break;
    }
    const options = shuffle([entry, ...distractors], rng);
    return { kind: kinds[i % 3]!, entry, options, answer: options.indexOf(entry) };
  });
}

/** What an option shows: the meaning for "meaning" questions, otherwise the Wolof. */
export function optionLabel(q: DuelQuestion, option: Entry, lang: UiLang): string {
  return q.kind === "meaning" ? translate(option.tr, lang) : option.wo;
}

/** 100 for a right answer, plus up to 50 for speed (full bonus within 1.5 s, none after 7.5 s). */
export function pointsFor(correct: boolean, ms: number): number {
  if (!correct) return 0;
  const bonus = Math.round(50 * Math.min(1, Math.max(0, 1 - (ms - 1500) / 6000)));
  return 100 + bonus;
}

/** The three rounds: questions 1–3, 4–6 and 7–10 (start inclusive, end exclusive). */
export const ROUNDS: [number, number][] = [
  [0, 3],
  [3, 6],
  [6, 10],
];

export interface RoundResult {
  mine: number;
  theirs: number;
  /** Who takes the crown; a tied round gives none. */
  winner: "me" | "them" | null;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Round-by-round points and crowns, the same way the server counts them. */
export function crownsFor(mine: number[], theirs: number[]): { rounds: RoundResult[]; mine: number; theirs: number } {
  const rounds = ROUNDS.map(([a, b]): RoundResult => {
    const m = sum(mine.slice(a, b));
    const t = sum(theirs.slice(a, b));
    return { mine: m, theirs: t, winner: m > t ? "me" : t > m ? "them" : null };
  });
  return { rounds, mine: rounds.filter((r) => r.winner === "me").length, theirs: rounds.filter((r) => r.winner === "them").length };
}

/** Which round a question belongs to (0–2). */
export function roundOf(index: number): number {
  return ROUNDS.findIndex(([a, b]) => index >= a && index < b);
}

/** What went wrong with a duel call, so the screen can say something useful. */
export type DuelProblem = "noNewWords" | "paused" | "tooMany" | "offline" | "over" | "updating" | "failed";

export function duelProblem(e: unknown): DuelProblem {
  const err = e as { kind?: string; message?: string; code?: string; status?: number } | null;
  const msg = `${err?.message ?? ""} ${err?.code ?? ""}`;
  if (/no new words/i.test(msg)) return "noNewWords";
  if (/paused/i.test(msg)) return "paused";
  if (/too many/i.test(msg)) return "tooMany";
  if (/duel is over|duel not found/i.test(msg)) return "over";
  if (err?.kind === "network" || /failed to fetch|network/i.test(msg)) return "offline";
  // The server doesn't have the duel functions yet (or is being updated).
  if (/could not find the function|PGRST202|schema cache|does not exist/i.test(msg) || (err?.status ?? 0) >= 500) return "updating";
  return "failed";
}

export interface DuelResult {
  my_score: number;
  their_score: number;
  my_crowns: number | null;
  their_crowns: number | null;
  result: "won" | "lost" | "draw";
  trophies_won: number;
  my_points: number[];
  their_points: number[] | null;
}

export interface DuelWords {
  trophies: number;
  total: number;
  unseen: number;
  second_chance: number;
}

export interface DuelRow {
  id: string;
  other_name: string;
  i_challenged: boolean;
  my_score: number | null;
  their_score: number | null;
  status: "waiting" | "done" | "declined" | "expired";
  seed: number;
  entries: string[];
  created_at: string;
  /** Newer servers only. */
  other_id?: string;
  my_crowns?: number | null;
  their_crowns?: number | null;
}

export type DuelState = "your-turn" | "waiting" | "won" | "lost" | "draw" | "expired" | "declined";

export function duelState(d: DuelRow): DuelState {
  if (d.status === "expired") return "expired";
  if (d.status === "declined") return "declined";
  if (d.status === "waiting") return d.i_challenged ? "waiting" : "your-turn";
  const mc = d.my_crowns ?? null;
  const tc = d.their_crowns ?? null;
  if (mc !== null && tc !== null && mc !== tc) return mc > tc ? "won" : "lost";
  const me = d.my_score ?? 0;
  const them = d.their_score ?? 0;
  return me > them ? "won" : me < them ? "lost" : "draw";
}

function cloud() {
  const c = getCloud();
  if (!c) throw new Error("accounts are switched off in this build");
  return c;
}

export const duels = {
  /** Tells friends which course this learner follows (two-way duels); quiet if it fails. */
  setLearning: async (target: LearnTarget) => {
    await cloud().rpc<void>("set_learning", { target });
  },
  /** A friend's (or duel partner's) course: "wo", "en", "fr", or null if unknown. */
  friendLearning: async (friend: string): Promise<LearnTarget | null> => {
    const v = await cloud().rpc<string | null>("friend_learning", { friend });
    return v === "wo" || v === "en" || v === "fr" ? v : null;
  },
  list: async () => (await cloud().rpc<DuelRow[]>("my_duels")) ?? [],
  /** Starts a duel: the server picks 10 entries new to both players. */
  start: async (friend: string) => {
    const rows = await cloud().rpc<{ duel: string; seed: number; entries: string[] }[]>("start_duel", { friend });
    const r = rows?.[0];
    if (!r) throw new Error("no duel");
    return r;
  },
  /** The challenger sends their points per question; returns the trophies earned. */
  finish: async (id: string, points: number[]) => {
    const trophies = await cloud().rpc<number>("finish_duel", { duel: id, points });
    notifyFriend("duel", { id });
    return trophies ?? 0;
  },
  /** The friend sends their points; returns crowns, the result and trophies earned. */
  answer: async (id: string, points: number[]) => {
    const rows = await cloud().rpc<DuelResult[]>("answer_duel", { duel: id, points });
    notifyFriend("result", { id });
    return rows?.[0] ?? null;
  },
  myWords: async () => (await cloud().rpc<DuelWords[]>("my_duel_words"))?.[0] ?? null,
  create: async (friend: string, seed: number, entries: string[], score: number) => {
    const id = await cloud().rpc<string>("create_duel", { friend, duel_seed: seed, duel_entries: entries, score });
    notifyFriend("duel", { id });
    return id;
  },
  play: async (id: string, score: number) => {
    const rows = await cloud().rpc<{ my_score: number; their_score: number; result: "won" | "lost" | "draw"; trophies_won: number }[]>("play_duel", {
      duel: id,
      score,
    });
    notifyFriend("result", { id });
    return rows?.[0] ?? null;
  },
  decline: (id: string) => cloud().rpc<void>("decline_duel", { duel: id }),
};
