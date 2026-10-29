/**
 * Lesson engine: turns authored exercise specs into concrete, shuffled
 * exercises for one interface language, and checks answers.
 *
 * Pure and deterministic given a random source, so it is unit-tested in
 * engine.test.ts.
 */
import type { Course, Entry, ExerciseSpec, ExerciseType, Lesson, UiLang } from "@/content/types";
import { translate } from "@/i18n";

export type Rng = () => number;

/** Small seeded PRNG (mulberry32) so tests and replays are reproducible. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const PUNCT = /[?!.,;:¿¡…]/g;

/** Word tiles for an entry: explicit tokens, else words with punctuation removed. */
export function tokensOf(entry: Entry): string[] {
  if (entry.tokens) return entry.tokens;
  return entry.wo.replace(PUNCT, "").split(/\s+/).filter(Boolean);
}

/** Lenient comparison: case, punctuation and extra spaces don't matter; diacritics do. */
export function normalize(text: string): string {
  return text.replace(PUNCT, "").replace(/\s+/g, " ").trim().toLowerCase();
}

export interface Choice {
  id: string;
  label: string;
  pic?: string;
}

interface Base {
  /** Unique within a session. */
  key: string;
  type: ExerciseType;
  /** Entries this exercise practises (fed to spaced repetition). */
  entryIds: string[];
  /** First time this entry appears in the lesson. */
  isNew: boolean;
  /** A re-queued exercise the learner got wrong earlier. */
  isRetry: boolean;
}

export interface ChoiceExercise extends Base {
  kind: "choice";
  type: "pick_meaning" | "pick_wolof" | "pick_picture" | "listen";
  entry: Entry;
  /** What the learner sees as the question. */
  prompt: string;
  /** Whether the prompt is Wolof (gets an audio button and Wolof styling). */
  promptIsWolof: boolean;
  choices: Choice[];
  answerId: string;
}

export interface BuildExercise extends Base {
  kind: "build";
  type: "build";
  entry: Entry;
  prompt: string;
  bank: Choice[];
  answer: string[];
}

export interface FillExercise extends Base {
  kind: "fill";
  type: "fill_blank";
  entry: Entry;
  before: string[];
  after: string[];
  meaning: string;
  choices: Choice[];
  answerId: string;
}

export interface MatchExercise extends Base {
  kind: "match";
  type: "match";
  left: Choice[];
  right: Choice[];
}

export interface SpeakExercise extends Base {
  kind: "speak";
  type: "speak";
  entry: Entry;
  meaning: string;
}

export type Exercise = ChoiceExercise | BuildExercise | FillExercise | MatchExercise | SpeakExercise;

function entryOf(course: Course, id: string): Entry {
  const entry = course.entries[id];
  if (!entry) throw new Error(`Unknown entry "${id}"`);
  return entry;
}

/**
 * Distractor entries: prefer the given pool, then the whole course, skipping
 * anything whose label would collide with the answer.
 */
function distractors(
  course: Course,
  answer: Entry,
  pool: string[],
  count: number,
  label: (e: Entry) => string,
  rng: Rng,
  filter: (e: Entry) => boolean = () => true,
): Entry[] {
  const seen = new Set([normalize(label(answer))]);
  const pick: Entry[] = [];
  const candidates = [
    ...shuffle(pool, rng),
    ...shuffle(Object.keys(course.entries).filter((id) => !pool.includes(id)), rng),
  ];
  for (const id of candidates) {
    if (pick.length >= count) break;
    const entry = course.entries[id];
    if (!entry || entry.id === answer.id || !filter(entry)) continue;
    const key = normalize(label(entry));
    if (seen.has(key)) continue;
    seen.add(key);
    pick.push(entry);
  }
  return pick;
}

export interface BuildOptions {
  course: Course;
  lang: UiLang;
  rng: Rng;
  /** Entry ids used for distractors (normally the lesson's entries). */
  pool: string[];
}

export function buildExercise(spec: ExerciseSpec, index: number, opts: BuildOptions, isNew = false): Exercise {
  const { course, lang, rng, pool } = opts;
  const key = `${index}:${spec.type}`;
  const meaning = (e: Entry) => translate(e.tr, lang);
  const wolof = (e: Entry) => e.wo;

  switch (spec.type) {
    case "pick_meaning":
    case "pick_wolof":
    case "listen":
    case "pick_picture": {
      const entry = entryOf(course, spec.entry);
      const isPicture = spec.type === "pick_picture";
      const labelFn = spec.type === "pick_meaning" || isPicture ? meaning : wolof;
      const others = distractors(course, entry, pool, 3, labelFn, rng, (e) => !isPicture || !!e.pic);
      const choices = shuffle([entry, ...others], rng).map<Choice>((e) => ({
        id: e.id,
        label: labelFn(e),
        ...(isPicture && e.pic ? { pic: e.pic } : {}),
      }));
      return {
        key,
        kind: "choice",
        type: spec.type,
        entryIds: [entry.id],
        isNew,
        isRetry: false,
        entry,
        prompt: spec.type === "pick_wolof" ? meaning(entry) : entry.wo,
        promptIsWolof: spec.type !== "pick_wolof",
        choices,
        answerId: entry.id,
      };
    }
    case "build": {
      const entry = entryOf(course, spec.entry);
      const answer = tokensOf(entry);
      const lower = new Set(answer.map((w) => w.toLowerCase()));
      const extra = (spec.distractors ?? []).filter((w) => !lower.has(w.toLowerCase()));
      const bank = shuffle([...answer, ...extra], rng).map<Choice>((label, i) => ({ id: `t${i}`, label }));
      return {
        key,
        kind: "build",
        type: "build",
        entryIds: [entry.id],
        isNew,
        isRetry: false,
        entry,
        prompt: meaning(entry),
        bank,
        answer,
      };
    }
    case "fill_blank": {
      const entry = entryOf(course, spec.entry);
      const words = tokensOf(entry);
      const target = words[spec.blank];
      if (target === undefined) throw new Error(`Blank ${spec.blank} out of range for "${entry.id}"`);
      const options = spec.options.some((o) => normalize(o) === normalize(target))
        ? spec.options
        : [target, ...spec.options];
      const choices = shuffle(options, rng).map<Choice>((label) => ({ id: label, label }));
      return {
        key,
        kind: "fill",
        type: "fill_blank",
        entryIds: [entry.id],
        isNew,
        isRetry: false,
        entry,
        before: words.slice(0, spec.blank),
        after: words.slice(spec.blank + 1),
        meaning: meaning(entry),
        choices,
        answerId: options.find((o) => normalize(o) === normalize(target))!,
      };
    }
    case "match": {
      const items = spec.entries.map((id) => entryOf(course, id));
      return {
        key,
        kind: "match",
        type: "match",
        entryIds: items.map((e) => e.id),
        isNew,
        isRetry: false,
        left: shuffle(items, rng).map((e) => ({ id: e.id, label: e.wo })),
        right: shuffle(items, rng).map((e) => ({ id: e.id, label: meaning(e) })),
      };
    }
    case "speak": {
      const entry = entryOf(course, spec.entry);
      return {
        key,
        kind: "speak",
        type: "speak",
        entryIds: [entry.id],
        isNew,
        isRetry: false,
        entry,
        meaning: meaning(entry),
      };
    }
  }
}

/** Build every exercise of a lesson, flagging the first appearance of each entry. */
export function buildLesson(lesson: Lesson, opts: Omit<BuildOptions, "pool">): Exercise[] {
  const seen = new Set<string>();
  return lesson.exercises.map((spec, i) => {
    const ids = spec.type === "match" ? spec.entries : [spec.entry];
    // Only recognition-style exercises introduce words; production comes later.
    const introduces = spec.type === "pick_meaning" || spec.type === "pick_picture";
    const isNew = introduces && ids.some((id) => !seen.has(id));
    ids.forEach((id) => seen.add(id));
    return buildExercise(spec, i, { ...opts, pool: lesson.entries }, isNew);
  });
}

export type Answer =
  | { kind: "choice"; choiceId: string }
  | { kind: "build"; words: string[] }
  | { kind: "fill"; choiceId: string }
  | { kind: "match"; mistakes: number }
  | { kind: "speak"; said: boolean };

export function isCorrect(ex: Exercise, answer: Answer): boolean {
  switch (ex.kind) {
    case "choice":
    case "fill":
      return (answer.kind === "choice" || answer.kind === "fill") && answer.choiceId === ex.answerId;
    case "build":
      return answer.kind === "build" && normalize(answer.words.join(" ")) === normalize(ex.answer.join(" "));
    case "match":
      return answer.kind === "match" && answer.mistakes === 0;
    case "speak":
      // Self-assessed until speech recognition exists, so it never costs a drop.
      return true;
  }
}

/** The text shown as the correct answer after a miss. */
export function correctAnswerText(ex: Exercise): string {
  switch (ex.kind) {
    case "choice":
      return ex.choices.find((c) => c.id === ex.answerId)?.label ?? "";
    case "build":
      return ex.entry.wo;
    case "fill":
      return ex.entry.wo;
    case "match":
      return "";
    case "speak":
      return ex.entry.wo;
  }
}
