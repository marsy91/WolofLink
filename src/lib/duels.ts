// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Word duels between friends (supabase/migrations/*_duels.sql). Both players get
 * the same 10 questions: the challenger picks 10 entries and a seed, and the
 * questions (type, distractors, order) are derived from them deterministically,
 * so the opponent rebuilds exactly the same duel. Pure parts are tested in duels.test.ts.
 */
import { course } from "@/content/course";
import type { Entry, UiLang } from "@/content/types";
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

const unitOf = new Map<string, string[]>();
for (const unit of course.units) {
  const ids = [...new Set(unit.lessons.flatMap((l) => l.entries))];
  for (const id of ids) unitOf.set(id, ids);
}
const ALL_IDS = Object.keys(course.entries).sort();

/** 10 entries for a new duel: words the challenger has practised if enough, else the first units. */
export function pickDuelEntries(progress: Progress, seed: number): string[] {
  const rng = seeded(seed);
  const learned = Object.keys(progress.srs).filter((id) => course.entries[id]);
  const starter = course.units.slice(0, 3).flatMap((u) => u.lessons.flatMap((l) => l.entries));
  const pool = [...new Set(learned.length >= DUEL_LENGTH ? learned : [...learned, ...starter])];
  return shuffle(pool, rng).slice(0, DUEL_LENGTH);
}

/** Rebuilds the duel's questions from its seed and entries (same for both players). */
export function buildDuel(seed: number, entryIds: string[]): DuelQuestion[] {
  const rng = seeded(seed ^ 0x5eed);
  const kinds: DuelKind[] = ["meaning", "wolof", "listen"];
  return entryIds.map((id, i) => {
    const entry = course.entries[id];
    if (!entry) throw new Error(`Unknown entry ${id}`);
    const near = (unitOf.get(id) ?? []).filter((x) => x !== id);
    const far = ALL_IDS.filter((x) => x !== id && !near.includes(x));
    const distractors: Entry[] = [];
    const seen = new Set([normalize(entry.wo), normalize(entry.tr.en)]);
    for (const cand of [...shuffle(near, rng), ...shuffle(far, rng)]) {
      const e = course.entries[cand]!;
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
}

export type DuelState = "your-turn" | "waiting" | "won" | "lost" | "draw" | "expired" | "declined";

export function duelState(d: DuelRow): DuelState {
  if (d.status === "expired") return "expired";
  if (d.status === "declined") return "declined";
  if (d.status === "waiting") return d.i_challenged ? "waiting" : "your-turn";
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
  list: async () => (await cloud().rpc<DuelRow[]>("my_duels")) ?? [],
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
