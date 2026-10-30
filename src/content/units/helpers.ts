// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Entry, StoryLine, StoryQuestion, Translations } from "../types";

/** Translations in fixed order: English, French, Spanish, German, Italian. */
export type Five = [en: string, fr: string, es: string, de: string, it: string];

export function tx([en, fr, es, de, it]: Five): Translations {
  return { en, fr, es, de, it };
}

/** Shorthand for a vocabulary entry. */
export function entry(
  id: string,
  wo: string,
  tr: Five,
  extra: { pic?: string; tokens?: string[]; note?: Five; audio?: string } = {},
): Entry {
  const { note, ...rest } = extra;
  return { id, wo, tr: tx(tr), ...rest, ...(note ? { note: tx(note) } : {}) };
}

export function line(speaker: string, wo: string, tr: Five): StoryLine {
  return { speaker, wo, tr: tx(tr) };
}

/** A question whose first option is the correct one (options are shuffled at runtime). */
export function question(prompt: Five, correct: Five, ...wrong: Five[]): StoryQuestion {
  return { prompt: tx(prompt), options: [correct, ...wrong].map(tx), answer: 0 };
}
