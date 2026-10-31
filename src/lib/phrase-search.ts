// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Accent-insensitive phrasebook search. Pure, covered by phrase-search.test.ts. */
import type { Entry, UiLang } from "@/content/types";

/** Lowercase, drop accents (ë→e, ñ→n, ŋ→n) and punctuation, collapse spaces. */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ŋ/g, "n")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Every word of the query must appear (as a prefix) in the Wolof or in a translation. */
export function matchesPhrase(entry: Entry, query: string, lang: UiLang): boolean {
  const words = fold(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = ` ${fold([entry.wo, entry.tr[lang] ?? "", entry.tr.en].join(" "))}`;
  return words.every((w) => haystack.includes(` ${w}`));
}

export function searchPhrases(entries: Entry[], query: string, lang: UiLang): Entry[] {
  return entries.filter((e) => matchesPhrase(e, query, lang));
}
