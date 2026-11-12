// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * The course turned around, for Wolof speakers learning English or French.
 *
 * Every course entry already has its Wolof and an English and French translation, so
 * the same units work in reverse: the English (or French) becomes the language being
 * learned, and the Wolof becomes the meaning. The lesson engine needs no changes,
 * because it only ever sees a normal Course whose `wo` field holds the language being
 * learned and whose translations hold the Wolof.
 *
 * Ids are prefixed so reverse progress never mixes with the Wolof course:
 * entries "en:<id>", lessons "to-en-<lesson id>", units "to-en-<unit id>".
 */
import { course as wolofCourse } from "./course";
import type { Course, Entry, ExerciseSpec, Lesson, Translations, Unit, UiLang } from "./types";

export const REVERSE_TARGETS = ["en", "fr"] as const;
export type ReverseTarget = (typeof REVERSE_TARGETS)[number];
/** What a learner is learning: Wolof (the main course) or, for Wolof speakers, English or French. */
export type LearnTarget = "wo" | ReverseTarget;

export const isReverseTarget = (v: unknown): v is ReverseTarget => v === "en" || v === "fr";

/** The phone voice used to read each language aloud. */
export const TARGET_VOICE: Record<ReverseTarget, string> = { en: "en-GB", fr: "fr-FR" };

const PREFIX = (target: ReverseTarget) => `to-${target}-`;

/**
 * Unit names in Wolof for the reverse course (new Wolof, listed for native-speaker review in
 * docs/wolof-review.md). Lessons are numbered within their unit.
 */
export const WOLOF_UNIT_TITLES: Record<string, string> = {
  u1: "Nuyoo ak xamante",
  u2: "Lim ak waññ",
  u3: "Lekk ak naan",
  u4: "Nit ñi ak njaboot gi",
  u5: "Jëf yu bés bu nekk",
  u6: "Béréb yi ak yoon wi",
  u7: "Waxtu ak bés yi",
  u8: "Waxtaan bés bu nekk",
  u9: "Yaram ak wér-gi-yaram",
  u10: "Liggéey ak lekkool",
  u11: "Kër gi ak dund bés bu nekk",
  u12: "Xew yi ak aada",
  u13: "Melo yi ak yére yi",
  u14: "Rab ak mbindeef",
  u15: "Laaj ay laaj",
  u16: "Noflaay ak tukki",
  u17: "Aada ak teggin",
  u18: "Lekku Senegaal",
  u19: "Li ñuy yég",
  u20: "Lim yu mag ak njëg",
  u21: "Wax ci lu weesu",
  u22: "Ëllëg ak li ñu bëgg def",
  u23: "Ci telefon bi",
  u24: "Méngale",
};

/**
 * The text to learn, from a translation written for Wolof learners:
 * "Hello (in reply)" → "Hello", "Il/Elle est gentil(le)" → "Il est gentil",
 * "What a pity! / Poor thing!" → "What a pity!", and for single Wolof words
 * "student, pupil" → "student".
 */
export function learnText(translation: string, wolof: string): string {
  let s = translation
    .replace(/\s*\([^)]*\)/g, "") // explanations and inclusive endings: "(in reply)", "(e)", "(le)"
    .replace(/\b(he|him|his|il|lui)\s?\/\s?(she|her|elle)\b/giu, "$1") // "He / she is fine" → "He is fine"
    .split(" / ")[0]! // alternatives: "What a pity! / Poor thing!"
    .replace(/(\p{L}+)\/\p{L}+/gu, "$1") // "un/une" → "un"
    .replace(/\s+/g, " ")
    .trim();
  // A single Wolof word glossed with synonyms ("student, pupil"): learn the first one.
  const parts = s.split(/[,;] /);
  if (!/\s/.test(wolof.trim()) && parts.length > 1 && parts.every((x) => x.trim().split(/\s+/).length <= 2)) s = parts[0]!.trim();
  return s;
}

const strip = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();

/** Same text in every interface language: the Wolof meaning. */
const allLangs = (text: string): Translations => ({ en: text, fr: text, es: text, de: text, it: text });

function reverseEntry(entry: Entry, target: ReverseTarget): Entry | null {
  const source = entry.tr[target];
  if (!source) return null;
  const text = learnText(source, entry.wo);
  // Nothing to learn when it is the same word (Tabaski, sabar, mbalax…).
  if (!text || strip(text) === strip(entry.wo)) return null;
  return {
    id: `${target}:${entry.id}`,
    wo: text,
    tr: allLangs(entry.wo),
    voice: TARGET_VOICE[target],
    ...(entry.pic ? { pic: entry.pic } : {}),
  };
}

function reverseSpec(spec: ExerciseSpec, target: ReverseTarget, has: (id: string) => boolean): ExerciseSpec | null {
  const id = (e: string) => `${target}:${e}`;
  if (spec.type === "match") {
    const entries = spec.entries.map(id).filter(has);
    return entries.length >= 3 ? { type: "match", entries } : null;
  }
  const entry = id(spec.entry);
  if (!has(entry)) return null;
  switch (spec.type) {
    // The tiles and blanks were written for the Wolof sentence; build the English or French one instead.
    case "fill_blank":
    case "build":
      return { type: "build", entry };
    // Recording and comparing needs a model clip, which only exists for Wolof.
    case "speak":
      return { type: "listen", entry };
    default:
      return { ...spec, entry };
  }
}

function reverseLesson(lesson: Lesson, title: string, target: ReverseTarget, has: (id: string) => boolean): Lesson | null {
  const exercises = lesson.exercises.map((s) => reverseSpec(s, target, has)).filter((s): s is ExerciseSpec => !!s);
  const entries = lesson.entries.map((e) => `${target}:${e}`).filter(has);
  if (exercises.length < 4 || entries.length < 2) return null;
  // The tips were written for Wolof learners, so reversed lessons have none.
  return { id: `${PREFIX(target)}${lesson.id}`, title: allLangs(title), entries, exercises };
}

function build(target: ReverseTarget): Course {
  const entries: Record<string, Entry> = {};
  for (const e of Object.values(wolofCourse.entries)) {
    const r = reverseEntry(e, target);
    if (r) entries[r.id] = r;
  }
  const has = (id: string) => id in entries;
  const units: Unit[] = wolofCourse.units
    .filter((u) => !u.draft)
    .map((u) => {
      const name = WOLOF_UNIT_TITLES[u.id] ?? u.title.fr ?? u.title.en;
      const lessons = u.lessons
        .map((l, i) => reverseLesson(l, `${name} · ${i + 1}`, target, has))
        .filter((l): l is Lesson => !!l);
      // Stories and their questions were written for Wolof learners, so they stay out.
      return { id: `${PREFIX(target)}${u.id}`, title: allLangs(name), glyph: u.glyph, tone: u.tone, lessons };
    })
    .filter((u) => u.lessons.length > 0);
  const name: Record<ReverseTarget, Translations> = { en: allLangs("Angale"), fr: allLangs("Farañse") };
  return { id: `wo-${target}`, target, title: name[target], units, entries };
}

const cache = new Map<ReverseTarget, Course>();

/** The reversed course for a target language (built once, then kept). */
export function reverseCourse(target: ReverseTarget): Course {
  let c = cache.get(target);
  if (!c) cache.set(target, (c = build(target)));
  return c;
}

/** The course a learner follows. */
export function courseFor(target: LearnTarget | undefined): Course {
  return isReverseTarget(target) ? reverseCourse(target) : wolofCourse;
}

/** Which target a reversed lesson id belongs to, or null for a Wolof lesson. */
export function targetOfLesson(lessonId: string): ReverseTarget | null {
  return REVERSE_TARGETS.find((t) => lessonId.startsWith(PREFIX(t))) ?? null;
}

/** Every reversed lesson id (for the static lesson pages). */
export function allReverseLessonIds(): string[] {
  return REVERSE_TARGETS.flatMap((t) => reverseCourse(t).units.flatMap((u) => u.lessons.map((l) => l.id)));
}

/** Content language for engine calls: the meaning is Wolof in every key, so any language works. */
export const REVERSE_CONTENT_LANG: UiLang = "fr";

/** Shown on the first setup screen in Wolof, whatever the phone's language (new Wolof, for review). */
export const WOLOF_SPEAKER_LABELS = {
  heading: "Dégg nga wolof?",
  en: { title: "Jàng angale", hint: "Ak ay leeral ci wolof" },
  fr: { title: "Jàng farañse", hint: "Ak ay leeral ci wolof" },
} as const;
