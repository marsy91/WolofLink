import type { Entry, Translations } from "../types";

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
