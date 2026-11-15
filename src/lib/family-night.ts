// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Family Làmb Night: a pass-the-phone wrestling tournament for 2–6 family members.
 * Each bout is 5 turns each, taken in turn; every right answer shoves the other wrestler
 * towards the edge of the circle. Questions match each player's level (pictures for the
 * little ones, words for kids, phrases for grown-ups), and younger players shove a little
 * harder, so anyone can win. Played entirely on the phone. Pure and seeded; tested in
 * family-night.test.ts.
 */
import { course } from "@/content/course";
import type { Entry } from "@/content/types";
import { normalize, seeded, shuffle, type Rng } from "./engine";
import type { FamilyLevel } from "./family";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
/** Turns each player takes in a bout before it goes to the score. */
export const TURNS_EACH = 5;
/** Extra pairs of turns on a tie before the crowd decides. */
export const SUDDEN_DEATH_PAIRS = 3;

/** How far one right answer shoves the other wrestler (the circle runs from -1 to +1). */
export const PUSH: Record<FamilyLevel, number> = { little: 0.25, kid: 0.22, grown: 0.18 };

// ── Questions ──

export type NightKind = "picture" | "meaning" | "wolof" | "listen";

export interface NightQuestion {
  kind: NightKind;
  entry: Entry;
  options: Entry[];
  answer: number;
}

const OPTIONS: Record<FamilyLevel, number> = { little: 3, kid: 3, grown: 4 };

interface Pools {
  little: Entry[];
  kid: Entry[];
  grown: Entry[];
}
let pools: Pools | null = null;

/** Entries in course order, each Wolof text once. */
function poolsNow(): Pools {
  if (pools) return pools;
  const seen = new Set<string>();
  const ordered: Entry[] = [];
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      for (const id of lesson.entries) {
        const e = course.entries[id];
        if (!e || seen.has(normalize(e.wo))) continue;
        seen.add(normalize(e.wo));
        ordered.push(e);
      }
    }
  }
  const words = ordered.filter((e) => !/\s/.test(e.wo.trim()));
  const pics = new Set<string>();
  const little = ordered.filter((e) => e.pic && !pics.has(e.pic) && pics.add(e.pic));
  const phrases = ordered.filter((e) => /\s/.test(e.wo.trim()) && e.wo.length <= 40);
  pools = { little, kid: words, grown: [...phrases, ...words.slice(0, 120)] };
  return pools;
}

export const poolFor = (level: FamilyLevel): readonly Entry[] => poolsNow()[level];

function kindFor(level: FamilyLevel, turn: number): NightKind {
  if (level === "little") return "picture";
  if (level === "kid") return turn % 3 === 2 ? "listen" : "meaning";
  return turn % 2 === 0 ? "wolof" : "listen";
}

/** One question for a player at this level. `used` keeps the bout from repeating a word. */
export function nightQuestion(level: FamilyLevel, rng: Rng, turn: number, used: Set<string> = new Set()): NightQuestion {
  const pool = poolFor(level);
  const fresh = pool.filter((e) => !used.has(e.id));
  const from = fresh.length >= OPTIONS[level] ? fresh : pool;
  const entry = from[Math.floor(rng() * from.length)]!;
  used.add(entry.id);
  const distinct = (e: Entry) => [normalize(e.wo), normalize(e.tr.en), e.pic ?? ""];
  const taken = new Set(distinct(entry).filter(Boolean));
  const options = [entry];
  // Wrong answers of the same kind first (a word with words, a phrase with phrases), so the
  // length or shape of an option never gives the answer away.
  const isPhrase = (e: Entry) => /\s/.test(e.wo.trim());
  const shuffled = shuffle(pool, rng);
  const candidates = [...shuffled.filter((e) => isPhrase(e) === isPhrase(entry)), ...shuffled.filter((e) => isPhrase(e) !== isPhrase(entry))];
  for (const cand of candidates) {
    if (options.length === OPTIONS[level]) break;
    const keys = distinct(cand).filter(Boolean);
    if (keys.some((k) => taken.has(k))) continue;
    keys.forEach((k) => taken.add(k));
    options.push(cand);
  }
  const mixed = shuffle(options, rng);
  return { kind: kindFor(level, turn), entry, options: mixed, answer: mixed.indexOf(entry) };
}

// ── A bout ──

export interface Fighter {
  id: string;
  level: FamilyLevel;
}

/** Answers so far, in turn order: left player first, then right, and so on. */
export interface Bout {
  left: Fighter;
  right: Fighter;
  answers: boolean[];
  seed: number;
}

/** Whose turn it is: 0 for the left player, 1 for the right. */
export const turnOf = (b: Bout): 0 | 1 => (b.answers.length % 2) as 0 | 1;

/** Where the pair stands, -1 (left player at the edge) to +1 (right player at the edge); past ±1 is out. */
export function boutBalance(b: Bout): number {
  let x = 0;
  b.answers.forEach((right, i) => {
    if (!right) return;
    x += i % 2 === 0 ? PUSH[b.left.level] : -PUSH[b.right.level];
  });
  return Math.round(x * 1000) / 1000;
}

export type BoutEnd = { winner: 0 | 1; how: "thrown" | "points" | "crowd" } | null;

/** The bout's result once it is over, or null while it goes on. */
export function boutEnd(b: Bout): BoutEnd {
  const x = boutBalance(b);
  const n = b.answers.length;
  if (x > 1) return { winner: 0, how: "thrown" };
  if (x < -1) return { winner: 1, how: "thrown" };
  // Only judge after the right player has answered (whole pairs of turns).
  if (n < TURNS_EACH * 2 || n % 2 === 1) return null;
  if (x !== 0) return { winner: x > 0 ? 0 : 1, how: "points" };
  if (n < (TURNS_EACH + SUDDEN_DEATH_PAIRS) * 2) return null;
  // Still level after sudden death: the crowd cheers the younger wrestler (a coin toss between equals).
  const age = { little: 0, kid: 1, grown: 2 } as const;
  const d = age[b.left.level] - age[b.right.level];
  if (d !== 0) return { winner: d < 0 ? 0 : 1, how: "crowd" };
  return { winner: seeded(b.seed ^ 0xc0d)() < 0.5 ? 0 : 1, how: "crowd" };
}

export const inSuddenDeath = (b: Bout) => b.answers.length >= TURNS_EACH * 2 && !boutEnd(b);

/** The question for the current turn (the same every time for the same bout and turn). */
export function questionNow(b: Bout): NightQuestion {
  const used = new Set<string>();
  let q: NightQuestion | null = null;
  // Rebuild in order so earlier questions' words are not repeated.
  for (let i = 0; i <= b.answers.length; i++) {
    const f = i % 2 === 0 ? b.left : b.right;
    q = nightQuestion(f.level, seeded(b.seed + i * 7919), Math.floor(i / 2), used);
  }
  return q!;
}

// ── The tournament ──

export interface Match {
  a: string;
  /** Null: `a` goes straight through to the next round. */
  b: string | null;
  winner?: string;
}

export interface Tournament {
  rounds: Match[][];
}

function pairUp(ids: string[]): Match[] {
  const out: Match[] = [];
  for (let i = 0; i < ids.length; i += 2) {
    const a = ids[i]!;
    const b = ids[i + 1] ?? null;
    out.push(b ? { a, b } : { a, b: null, winner: a });
  }
  return out;
}

export function newTournament(ids: string[], seed: number): Tournament {
  const unique = [...new Set(ids)];
  if (unique.length < MIN_PLAYERS || unique.length > MAX_PLAYERS) throw new Error("2 to 6 players");
  return { rounds: [pairUp(shuffle(unique, seeded(seed)))] };
}

/** The next bout to wrestle, or null when the tournament is over. */
export function nextMatch(t: Tournament): { round: number; index: number; match: Match } | null {
  const round = t.rounds.length - 1;
  const index = t.rounds[round]!.findIndex((m) => !m.winner);
  return index < 0 ? null : { round, index, match: t.rounds[round]![index]! };
}

export function champion(t: Tournament): string | null {
  const last = t.rounds[t.rounds.length - 1]!;
  return last.length === 1 && last[0]!.winner && last[0]!.b !== null ? last[0]!.winner : null;
}

/** Records a bout's winner and, when the round is done, sets up the next one. */
export function recordWinner(t: Tournament, winner: string): Tournament {
  const at = nextMatch(t);
  if (!at || (at.match.a !== winner && at.match.b !== winner)) return t;
  const rounds = t.rounds.map((r) => r.map((m) => ({ ...m })));
  rounds[at.round]![at.index]!.winner = winner;
  const round = rounds[at.round]!;
  if (round.every((m) => m.winner)) {
    const winners = round.map((m) => m.winner!);
    if (winners.length > 1) {
      // Whoever went straight through wrestles first next round, so nobody sits out twice.
      const byes = round.filter((m) => m.b === null).map((m) => m.a);
      const order = [...byes, ...winners.filter((w) => !byes.includes(w))];
      rounds.push(pairUp(order));
    }
  }
  return { rounds };
}

/** Round names: the last is the final. */
export const isFinalRound = (t: Tournament, round: number) => {
  const r = t.rounds[round]!;
  return r.length === 1 && r[0]!.b !== null;
};
