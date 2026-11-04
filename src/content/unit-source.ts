// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Units written as plain data (from the native writer's spreadsheet) instead of
 * hand-written TypeScript. `unitFromSource` turns one into the same `Entry[]`
 * and `Unit` the hand-written units produce, building the exercises itself.
 * Tested in unit-source.test.ts; the course content tests cover the real units.
 */
import { normalize, tokensOf } from "@/lib/engine";
import type { Entry, ExerciseSpec, Story, StoryLine, StoryQuestion, Translations, Unit } from "./types";

export interface SourceItem {
  /** Stable id, also the audio file name, e.g. "u25.1.01". */
  id: string;
  wo: string;
  tr: Translations;
  note?: Translations;
}
export interface SourceLesson {
  id: string;
  title: Translations;
  tip: Translations;
  items: SourceItem[];
}
export interface SourceStory {
  id: string;
  title: Translations;
  lines: StoryLine[];
  questions: StoryQuestion[];
}
export interface UnitSource {
  id: string;
  glyph: Unit["glyph"];
  tone: Unit["tone"];
  title: Translations;
  /** Hidden from learners until this is removed (or the testing flag is on). */
  draft?: boolean;
  lessons: SourceLesson[];
  story?: SourceStory;
}

const MAX_EXERCISES = 12;

/** Longest token: usually the content word, a good one to blank out. */
function blankIndex(tokens: string[]): number {
  return tokens.reduce((best, t, i) => (t.length > tokens[best]!.length ? i : best), 0);
}

function otherTokens(entries: Entry[], self: Entry, avoid: string[]): string[] {
  const own = new Set(avoid.map((t) => normalize(t)));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of entries) {
    if (e.id === self.id) continue;
    for (const t of tokensOf(e)) {
      const k = normalize(t);
      if (!k || own.has(k) || seen.has(k)) continue;
      seen.add(k);
      out.push(t);
    }
  }
  return out;
}

/** Four entries whose Wolof and meanings are all different (in every language), or fewer. */
function pickMatch(entries: Entry[], start: number): string[] {
  const chosen: Entry[] = [];
  const woSeen = new Set<string>();
  const meaningSeen: Record<string, Set<string>> = {};
  for (let k = 0; k < entries.length && chosen.length < 4; k++) {
    const e = entries[(start + k) % entries.length]!;
    const langs = Object.keys(e.tr);
    const clash =
      woSeen.has(normalize(e.wo)) || langs.some((l) => meaningSeen[l]?.has(normalize(e.tr[l as keyof Translations] ?? "")));
    if (clash) continue;
    chosen.push(e);
    woSeen.add(normalize(e.wo));
    for (const l of langs) (meaningSeen[l] ??= new Set()).add(normalize(e.tr[l as keyof Translations] ?? ""));
  }
  return chosen.map((e) => e.id);
}

/** 8–12 exercises covering the lesson's entries, in a fixed, reproducible order. */
export function exercisesFor(entries: Entry[]): ExerciseSpec[] {
  if (entries.length === 0) return [];
  const at = (i: number) => entries[i % entries.length]!;
  const specs: ExerciseSpec[] = [];
  const add = (s: ExerciseSpec) => specs.length < MAX_EXERCISES && specs.push(s);

  add({ type: "pick_meaning", entry: at(0).id });
  add({ type: "pick_meaning", entry: at(1).id });
  add({ type: "listen", entry: at(2).id });
  const match = pickMatch(entries, 3);
  if (match.length >= 2) add({ type: "match", entries: match });
  add({ type: "pick_wolof", entry: at(4).id });

  // Fill in the blank: prefer an entry with several words.
  const multi = entries.find((e) => tokensOf(e).length >= 3) ?? entries.find((e) => tokensOf(e).length >= 2);
  if (multi) {
    const tokens = tokensOf(multi);
    const blank = blankIndex(tokens);
    const word = tokens[blank]!;
    const options = [word, ...otherTokens(entries, multi, [word]).slice(0, 2)];
    if (options.length >= 2) add({ type: "fill_blank", entry: multi.id, blank, options });
  }
  // Word-building: another multi-word entry if there is one.
  const builder = entries.find((e) => e.id !== multi?.id && tokensOf(e).length >= 2) ?? multi;
  if (builder) add({ type: "build", entry: builder.id, distractors: otherTokens(entries, builder, tokensOf(builder)).slice(0, 2) });

  add({ type: "pick_meaning", entry: at(5).id });
  add({ type: "listen", entry: at(6).id });
  add({ type: "pick_wolof", entry: at(7).id });
  add({ type: "type_wolof", entry: at(8).id });
  add({ type: "speak", entry: at(9).id });
  // Pad up to the minimum with extra reading and listening practice.
  for (let i = 0; specs.length < 8 && i < entries.length; i++) add({ type: i % 2 ? "pick_wolof" : "pick_meaning", entry: at(i + 3).id });
  return specs;
}

export function unitFromSource(src: UnitSource): { entries: Entry[]; unit: Unit } {
  const entries: Entry[] = [];
  const lessons = src.lessons.map((l) => {
    const own: Entry[] = l.items.map((it) => ({ id: it.id, wo: it.wo, tr: it.tr, ...(it.note ? { note: it.note } : {}) }));
    entries.push(...own);
    return { id: l.id, title: l.title, tip: l.tip, entries: own.map((e) => e.id), exercises: exercisesFor(own) };
  });
  const story: Story | undefined = src.story;
  return {
    entries,
    unit: { id: src.id, title: src.title, glyph: src.glyph, tone: src.tone, lessons, ...(story ? { story } : {}), ...(src.draft ? { draft: true } : {}) },
  };
}

/** Units for learners: draft units are left out unless drafts are switched on (testing builds). */
export function visibleModules<T extends { unit: { draft?: boolean } }>(modules: T[], showDrafts: boolean): T[] {
  return showDrafts ? modules : modules.filter((m) => !m.unit.draft);
}
