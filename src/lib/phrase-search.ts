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

/**
 * Search ranked for a dictionary: exact matches first (the Wolof, or a
 * translation or one of its comma-separated senses), then entries that start
 * with the query, then the rest. Shorter entries win ties; otherwise the
 * original order is kept.
 */
export function rankedSearch(entries: Entry[], query: string, lang: UiLang): Entry[] {
  const q = fold(query);
  if (!q) return entries;

  const score = (e: Entry) => {
    const texts = [e.wo, e.tr[lang] ?? "", e.tr.en];
    // "to wear" or "the sun" also count as exact matches for "wear" or "sun".
    const senses = texts
      .flatMap((t) => t.split(/[,/;(]/))
      .map((t) => fold(t).replace(/^(to|the|a|an) /, ""))
      .filter(Boolean);
    if (senses.includes(q) || texts.some((t) => fold(t) === q)) return 0;
    if (texts.some((t) => fold(t).startsWith(q))) return 1;
    return 2;
  };
  return searchPhrases(entries, query, lang)
    .map((e, i) => ({ e, i, s: score(e), n: fold(e.wo).length }))
    .sort((a, b) => a.s - b.s || (a.s > 0 ? a.n - b.n : 0) || a.i - b.i)
    .map((x) => x.e)
    // A phrase listed under two situations shows up once.
    .filter((e, i, all) => all.findIndex((o) => fold(o.wo) === fold(e.wo)) === i);
}
