// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Course content model.
 *
 * Wolof is always the target language. Every entry carries its Wolof text plus
 * translations keyed by interface language. Only `en` is required; missing
 * languages fall back to English at runtime (see `translate()` in lib/i18n).
 */

export const UI_LANGS = ["en", "fr", "es", "de", "it"] as const;
export type UiLang = (typeof UI_LANGS)[number];

export type Translations = { en: string } & Partial<Record<Exclude<UiLang, "en">, string>>;

/** A word or phrase the learner meets. Words and sentences share one shape. */
export interface Entry {
  id: string;
  /** Wolof in standard (CLAD) Latin orthography. */
  wo: string;
  tr: Translations;
  /** Emoji or short glyph used for picture exercises. */
  pic?: string;
  /**
   * Word tiles for sentence building. Defaults to splitting `wo` on spaces
   * with punctuation removed.
   */
  tokens?: string[];
  /**
   * Path under /public to a recorded clip, e.g. "audio/wo/greet.salaam.mp3".
   * When absent, the audio service falls back to text-to-speech.
   */
  audio?: string;
  /** Optional usage note shown after answering. */
  note?: Translations;
}

/** Authored exercise metadata. The engine resolves choices at runtime. */
export type ExerciseSpec =
  /** Wolof shown -> pick the meaning in the interface language. */
  | { type: "pick_meaning"; entry: string }
  /** Meaning shown -> pick the Wolof. */
  | { type: "pick_wolof"; entry: string }
  /** Wolof word shown -> pick the matching picture card. */
  | { type: "pick_picture"; entry: string }
  /** Meaning shown -> tap Wolof tiles in order. */
  | { type: "build"; entry: string; distractors?: string[] }
  /** Hear Wolof -> pick what was said. */
  | { type: "listen"; entry: string }
  /** Say a phrase aloud (self-checked until speech recognition exists). */
  | { type: "speak"; entry: string }
  /** Match Wolof to meanings. */
  | { type: "match"; entries: string[] }
  /** Wolof sentence with one tile blanked -> pick the missing word. */
  | { type: "fill_blank"; entry: string; blank: number; options: string[] }
  /** Meaning shown -> type the Wolof. */
  | { type: "type_wolof"; entry: string }
  /** Hear Wolof -> type what was said. */
  | { type: "listen_type"; entry: string };

export type ExerciseType = ExerciseSpec["type"];

export interface Lesson {
  id: string;
  title: Translations;
  /** Short grammar/culture tip shown before the lesson starts. */
  tip?: Translations;
  /** Entries introduced in this lesson (used for distractors and review). */
  entries: string[];
  exercises: ExerciseSpec[];
}

/** One line of a short dialogue. */
export interface StoryLine {
  speaker: string;
  wo: string;
  tr: Translations;
}

/** Comprehension question; `answer` indexes `options`. */
export interface StoryQuestion {
  prompt: Translations;
  options: Translations[];
  answer: number;
}

/** A short original dialogue that reuses a unit's vocabulary. */
export interface Story {
  id: string;
  title: Translations;
  lines: StoryLine[];
  questions: StoryQuestion[];
}

export interface Unit {
  id: string;
  title: Translations;
  /** One of the original unit glyph keys in components/icons. */
  glyph:
    | "wave"
    | "family"
    | "count"
    | "bowl"
    | "spark"
    | "compass"
    | "clock"
    | "chat"
    | "heart"
    | "briefcase"
    | "home"
    | "drum";
  /** Accent colour token for the unit banner. */
  tone: "sun" | "clay" | "sea" | "dusk";
  lessons: Lesson[];
  /** Unlocks once every lesson in the unit is done. */
  story?: Story;
}

export interface Course {
  id: string;
  target: "wo";
  title: Translations;
  units: Unit[];
  entries: Record<string, Entry>;
}
