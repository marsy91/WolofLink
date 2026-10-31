// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * The in-app dictionary: every phrasebook phrase plus every word and phrase
 * taught in the course, grouped into sections (phrasebook situations, then
 * course units). Built from the content files, so it grows with the course.
 * A course entry whose Wolof is already in the phrasebook is listed once.
 */
import { course } from "./course";
import { fold } from "@/lib/phrase-search";
import { phrasebook } from "./phrasebook";
import type { Entry, Translations } from "./types";

export interface DictionarySection {
  id: string;
  emoji: string;
  title: Translations;
  kind: "phrasebook" | "course";
  entries: Entry[];
}

const phraseSections: DictionarySection[] = phrasebook.map((c) => ({
  id: c.id,
  emoji: c.emoji,
  title: c.title,
  kind: "phrasebook",
  entries: c.phrases,
}));

const seen = new Set(phrasebook.flatMap((c) => c.phrases.map((p) => fold(p.wo))));

const courseSections: DictionarySection[] = course.units.map((unit, i) => {
  const entries: Entry[] = [];
  for (const lesson of unit.lessons) {
    for (const id of lesson.entries) {
      const e = course.entries[id];
      const key = e ? fold(e.wo) : "";
      if (!e || seen.has(key)) continue;
      seen.add(key);
      entries.push(e);
    }
  }
  return { id: `unit-${unit.id}`, emoji: `${i + 1}`, title: unit.title, kind: "course" as const, entries };
}).filter((s) => s.entries.length > 0);

export const dictionarySections: DictionarySection[] = [...phraseSections, ...courseSections];
export const dictionary: Entry[] = dictionarySections.flatMap((s) => s.entries);
export const dictionaryById = new Map(dictionary.map((e) => [e.id, e]));
export const sectionOfEntry = new Map(dictionarySections.flatMap((s) => s.entries.map((e) => [e.id, s] as const)));
