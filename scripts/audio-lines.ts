// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Every line a voice actor needs to record, in course order. Shared by the audio scripts. */
import { course, storyLineId } from "../src/content/course";
import { phrasebook } from "../src/content/phrasebook";

export interface AudioLine {
  /** File name without extension; also the key in audio-manifest.json. */
  id: string;
  wolof: string;
  english: string;
  french: string;
  kind: "word" | "phrase" | "dialogue";
  speaker?: string;
  unit: string;
  lesson: string;
  note?: string;
}

export function audioLines(): AudioLine[] {
  const seen = new Set<string>();
  const lines: AudioLine[] = [];
  course.units.forEach((unit, u) => {
    const unitName = `${u + 1}. ${unit.title.en}`;
    for (const lesson of unit.lessons) {
      for (const id of lesson.entries) {
        if (seen.has(id)) continue;
        seen.add(id);
        const e = course.entries[id]!;
        lines.push({
          id,
          wolof: e.wo,
          english: e.tr.en,
          french: e.tr.fr ?? "",
          kind: e.wo.trim().includes(" ") ? "phrase" : "word",
          unit: unitName,
          lesson: lesson.title.en,
          ...(e.note ? { note: e.note.en } : {}),
        });
      }
    }
    if (unit.story) {
      unit.story.lines.forEach((l, i) => {
        lines.push({
          id: storyLineId(unit.story!.id, i),
          wolof: l.wo,
          english: l.tr.en,
          french: l.tr.fr ?? "",
          kind: "dialogue",
          speaker: l.speaker,
          unit: unitName,
          lesson: `Dialogue: ${unit.story!.title.en}`,
        });
      });
    }
  });
  for (const cat of phrasebook) {
    for (const p of cat.phrases) {
      lines.push({
        id: p.id,
        wolof: p.wo,
        english: p.tr.en,
        french: p.tr.fr ?? "",
        kind: p.wo.trim().includes(" ") ? "phrase" : "word",
        unit: "Phrasebook",
        lesson: cat.title.en,
        ...(p.note ? { note: p.note.en } : {}),
      });
    }
  }
  return lines;
}
