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
import { SURVIVAL_IDS, SURVIVAL_TITLE } from "./survival";
import type { Entry, Translations } from "./types";

export interface DictionarySection {
  id: string;
  emoji: string;
  title: Translations;
  kind: "phrasebook" | "course" | "survival";
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

/** Phrasebook situations, then course units: every entry once (plus the phrasebook's deliberate repeats). */
export const dictionarySections: DictionarySection[] = [...phraseSections, ...courseSections];

/** The Survival 100, a filter over course entries (they also stay in their units). */
export const survivalSection: DictionarySection = {
  id: "survival",
  emoji: "🆘",
  title: SURVIVAL_TITLE,
  kind: "survival",
  entries: SURVIVAL_IDS.map((id) => course.entries[id]).filter((e): e is Entry => !!e),
};
export const dictionary: Entry[] = dictionarySections.flatMap((s) => s.entries);
/** Every id that can be shown or saved: the dictionary plus course entries merged into a phrasebook twin. */
export const dictionaryById = new Map([...dictionary, ...Object.values(course.entries)].map((e) => [e.id, e]));

const unitSection = new Map(courseSections.map((s) => [s.id, s]));
/** Where an entry comes from: its phrasebook situation, or the unit that teaches it. */
export const sectionOfEntry = new Map<string, DictionarySection>([
  ...course.units.flatMap((unit) => {
    const sec = unitSection.get(`unit-${unit.id}`);
    return sec ? unit.lessons.flatMap((l) => l.entries.map((id) => [id, sec] as const)) : [];
  }),
  ...phraseSections.flatMap((s) => s.entries.map((e) => [e.id, s] as const)),
]);
