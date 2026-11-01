// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Prints every Wolof line in the app as JSON (course words, phrasebook, dialogue
 * lines, holiday words) for the native-speaker review pack.
 * Usage: npx tsx scripts/review/export-lines.ts > lines.json
 */
import manifest from "../../src/content/audio-manifest.json";
import { allStories, course, storyLineId } from "../../src/content/course";
import { phrasebook } from "../../src/content/phrasebook";

const audio = manifest as Record<string, string>;
const rows: Record<string, unknown>[] = [];
const seen = new Set<string>();

for (const unit of course.units) {
  const unitNo = course.units.indexOf(unit) + 1;
  for (const lesson of unit.lessons)
    for (const id of lesson.entries) {
      if (seen.has(id)) continue;
      seen.add(id);
      const e = course.entries[id]!;
      rows.push({
        id,
        wo: e.wo,
        en: e.tr.en,
        fr: e.tr.fr ?? "",
        note: e.note?.en ?? "",
        where: `Unit ${unitNo}: ${unit.title.en}`,
        kind: "Course",
        audio: audio[id] ?? "",
      });
    }
}
for (const { unit, story } of allStories)
  story.lines.forEach((line, i) => {
    const id = storyLineId(story.id, i);
    rows.push({
      id,
      wo: line.wo,
      en: line.tr.en,
      fr: line.tr.fr ?? "",
      note: "",
      where: `Dialogue: ${story.title.en} (unit ${course.units.indexOf(unit) + 1})`,
      kind: "Dialogue",
      audio: audio[id] ?? "",
    });
  });
for (const cat of phrasebook)
  for (const p of cat.phrases)
    rows.push({
      id: p.id,
      wo: p.wo,
      en: p.tr.en,
      fr: p.tr.fr ?? "",
      note: p.note?.en ?? "",
      where: `Phrasebook: ${cat.title.en}`,
      kind: "Phrasebook",
      audio: audio[p.id] ?? "",
    });

process.stdout.write(JSON.stringify(rows, null, 1));
