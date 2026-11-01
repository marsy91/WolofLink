// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Integrity checks so new lessons and translations can't silently break. */
import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { de } from "@/i18n/de";
import { es } from "@/i18n/es";
import { fr } from "@/i18n/fr";
import { it as itDict } from "@/i18n/it";
import { buildLesson, normalize, seeded, tokensOf } from "@/lib/engine";
import { ACHIEVEMENTS } from "@/lib/progress";
import { existsSync } from "node:fs";
import path from "node:path";
import audioManifest from "./audio-manifest.json";
import { allLessons, allStories, course, storyLineId } from "./course";
import { allPhrases } from "./phrasebook";
import { duplicateIds } from "./entries";
import { UI_LANGS } from "./types";

describe("course content", () => {
  it("gives every unit at least two lessons and keeps ids unique", () => {
    expect(course.units).toHaveLength(20);
    for (const unit of course.units) expect(unit.lessons.length, unit.id).toBeGreaterThanOrEqual(2);
    // Units 1–8 have three lessons each.
    for (const unit of course.units.slice(0, 8)) expect(unit.lessons.length, unit.id).toBe(3);
    expect(new Set(allLessons.map((l) => l.id)).size).toBe(allLessons.length);
    expect(duplicateIds).toEqual([]);
  });

  it("uses every entry in at least one lesson", () => {
    const used = new Set(allLessons.flatMap((l) => l.entries));
    expect(Object.keys(course.entries).filter((id) => !used.has(id))).toEqual([]);
  });

  it.each(UI_LANGS)("match exercises have distinct sides in %s", (lang) => {
    for (const lesson of allLessons)
      for (const spec of lesson.exercises) {
        if (spec.type !== "match") continue;
        const items = spec.entries.map((id) => course.entries[id]!);
        const meanings = items.map((e) => normalize(e.tr[lang] ?? e.tr.en));
        expect(new Set(meanings).size, `${lesson.id} ${lang}`).toBe(items.length);
        expect(new Set(items.map((e) => normalize(e.wo))).size).toBe(items.length);
      }
  });

  it.each(allLessons.map((l) => [l.id, l] as const))("%s has 8–12 exercises that reference real entries", (_id, lesson) => {
    expect(lesson.exercises.length).toBeGreaterThanOrEqual(8);
    expect(lesson.exercises.length).toBeLessThanOrEqual(12);
    for (const spec of lesson.exercises) {
      const ids = spec.type === "match" ? spec.entries : [spec.entry];
      for (const id of ids) {
        expect(course.entries[id], id).toBeDefined();
        expect(lesson.entries, `${id} listed in lesson.entries`).toContain(id);
      }
      if (spec.type === "fill_blank") {
        const word = tokensOf(course.entries[spec.entry]!)[spec.blank];
        expect(word, `${spec.entry} blank`).toBeDefined();
        expect(spec.options.map(normalize)).toContain(normalize(word!));
      }
    }
  });

  it("covers every authored exercise type across the lessons", () => {
    const types = new Set(allLessons.flatMap((l) => l.exercises.map((e) => e.type)));
    expect([...types].sort()).toEqual(
      ["build", "fill_blank", "listen", "match", "pick_meaning", "pick_picture", "pick_wolof", "speak", "type_wolof"].sort(),
    );
  });

  it("translates every entry and lesson into all five interface languages", () => {
    for (const entry of Object.values(course.entries)) {
      for (const lang of UI_LANGS) expect(entry.tr[lang], `${entry.id}.${lang}`).toBeTruthy();
    }
    for (const unit of course.units) {
      for (const lang of UI_LANGS) expect(unit.title[lang], `${unit.id}.${lang}`).toBeTruthy();
      for (const lesson of unit.lessons) for (const lang of UI_LANGS) expect(lesson.tip?.[lang]).toBeTruthy();
    }
  });

  it.each(UI_LANGS)("every lesson builds in %s", (lang) => {
    for (const lesson of allLessons) {
      expect(() => buildLesson(lesson, { course, lang, rng: seeded(1) })).not.toThrow();
    }
  });
});

describe("stories", () => {
  it("has original stories with complete translations and valid answers", () => {
    expect(allStories.length).toBeGreaterThanOrEqual(4);
    for (const { unit, story } of allStories) {
      expect(unit.lessons.length).toBeGreaterThan(0);
      expect(story.lines.length).toBeGreaterThanOrEqual(5);
      expect(story.questions.length).toBeGreaterThanOrEqual(3);
      for (const lang of UI_LANGS) {
        expect(story.title[lang], story.id).toBeTruthy();
        for (const l of story.lines) expect(l.tr[lang], `${story.id} ${l.wo}`).toBeTruthy();
        for (const q of story.questions) {
          expect(q.prompt[lang]).toBeTruthy();
          expect(q.options[q.answer]).toBeDefined();
          const labels = q.options.map((o) => o[lang]);
          expect(new Set(labels).size, `${story.id} ${lang}`).toBe(labels.length);
        }
      }
    }
    expect(new Set(allStories.map((s) => s.story.id)).size).toBe(allStories.length);
  });
});

describe("audio manifest", () => {
  it("only points at known lines and files that exist", () => {
    const known = new Set([
      ...allPhrases.map((p) => p.id),
      ...Object.keys(course.entries),
      ...allStories.flatMap(({ story }) => story.lines.map((_, i) => storyLineId(story.id, i))),
    ]);
    for (const [id, file] of Object.entries(audioManifest as Record<string, string>)) {
      expect(known.has(id), `unknown audio id ${id}`).toBe(true);
      // Human recordings in audio/wo/, AI clips in audio/wo-ai/ (the app labels those).
      expect(file, id).toMatch(/^audio\/wo(-ai)?\/[^/]+\.mp3$/);
      expect(existsSync(path.join("public", file)), `missing file public/${file}`).toBe(true);
    }
  });
});

describe("UI dictionaries", () => {
  const keys = Object.keys(en).sort();
  it.each([
    ["fr", fr],
    ["es", es],
    ["de", de],
    ["it", itDict],
  ])("%s has exactly the English keys, all non-empty", (_l, dict) => {
    expect(Object.keys(dict).sort()).toEqual(keys);
    for (const v of Object.values(dict)) expect(v.trim()).not.toBe("");
  });

  it("names and describes every achievement", () => {
    for (const a of ACHIEVEMENTS) {
      expect(keys).toContain(`ach.${a.id}.name`);
      expect(keys).toContain(`ach.${a.id}.desc`);
    }
  });
});
