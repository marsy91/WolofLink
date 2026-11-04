// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { buildLesson, normalize, seeded, tokensOf } from "@/lib/engine";
import type { Course, Translations } from "./types";
import { UI_LANGS } from "./types";
import { course } from "./course";
import { exercisesFor, unitFromSource, visibleModules, type UnitSource } from "./unit-source";

/** Made-up placeholder text ("xx…"), not Wolof: only the structure matters here. */
const tr = (s: string): Translations => ({ en: `${s} en`, fr: `${s} fr`, es: `${s} es`, de: `${s} de`, it: `${s} it` });
const WO = ["xa", "xe", "xi", "xo", "xu", "xaa", "xee", "xii", "xoo", "xuu"];

function fixture(words = 10): UnitSource {
  const lesson = (n: number) => ({
    id: `ux-${n}`,
    title: tr(`lesson ${n}`),
    tip: tr(`tip ${n}`),
    items: Array.from({ length: words }, (_, i) => ({
      id: `ux.${n}.${String(i + 1).padStart(2, "0")}`,
      // Mix of one-, two- and three-word items.
      wo: [WO[i], ...(i % 3 === 1 ? [`${WO[(i + 1) % 10]}m`] : []), ...(i % 3 === 2 ? [`${WO[(i + 2) % 10]}m`, `${WO[(i + 3) % 10]}n`] : [])].join(" "),
      tr: tr(`meaning ${n}.${i}`),
    })),
  });
  return {
    id: "ux",
    glyph: "chat",
    tone: "sun",
    title: tr("test unit"),
    draft: true,
    lessons: [lesson(1), lesson(2)],
  };
}

describe("unitFromSource", () => {
  const { entries, unit } = unitFromSource(fixture());
  const course: Course = { id: "t", target: "wo", title: tr("t"), units: [unit], entries: Object.fromEntries(entries.map((e) => [e.id, e])) };

  it("keeps ids, draft flag and every entry in a lesson", () => {
    expect(unit.draft).toBe(true);
    expect(new Set(entries.map((e) => e.id)).size).toBe(20);
    const used = new Set(unit.lessons.flatMap((l) => l.entries));
    expect(entries.every((e) => used.has(e.id))).toBe(true);
  });

  it.each(unit.lessons.map((l) => [l.id, l] as const))("%s has 8–12 valid exercises", (_id, lesson) => {
    expect(lesson.exercises.length).toBeGreaterThanOrEqual(8);
    expect(lesson.exercises.length).toBeLessThanOrEqual(12);
    for (const spec of lesson.exercises) {
      const ids = spec.type === "match" ? spec.entries : [spec.entry];
      for (const id of ids) expect(lesson.entries).toContain(id);
      if (spec.type === "fill_blank") {
        const word = tokensOf(course.entries[spec.entry]!)[spec.blank];
        expect(word).toBeDefined();
        expect(spec.options.map(normalize)).toContain(normalize(word!));
      }
      if (spec.type === "match") {
        for (const lang of UI_LANGS) {
          const items = spec.entries.map((id) => course.entries[id]!);
          expect(new Set(items.map((e) => normalize(e.tr[lang] ?? ""))).size).toBe(items.length);
          expect(new Set(items.map((e) => normalize(e.wo))).size).toBe(items.length);
        }
      }
    }
  });

  it.each(UI_LANGS)("every lesson builds in %s", (lang) => {
    for (const lesson of unit.lessons) expect(() => buildLesson(lesson, { course, lang, rng: seeded(1) })).not.toThrow();
  });

  it("covers the main exercise types and is reproducible", () => {
    const types = new Set(unit.lessons.flatMap((l) => l.exercises.map((e) => e.type)));
    for (const t of ["pick_meaning", "pick_wolof", "listen", "match", "fill_blank", "build", "type_wolof", "speak"]) expect(types.has(t as never)).toBe(true);
    const again = unitFromSource(fixture()).unit;
    expect(again.lessons.map((l) => l.exercises)).toEqual(unit.lessons.map((l) => l.exercises));
  });

  it("still makes a valid lesson from only 6 items", () => {
    const small = unitFromSource(fixture(6)).unit.lessons[0]!;
    expect(small.exercises.length).toBeGreaterThanOrEqual(8);
    expect(exercisesFor([]).length).toBe(0);
  });
});

describe("draft units", () => {
  const modules = [{ unit: { id: "a" } }, { unit: { id: "b", draft: true } }];
  it("are hidden from learners and shown in testing builds", () => {
    expect(visibleModules(modules, false).map((m) => m.unit.id)).toEqual(["a"]);
    expect(visibleModules(modules, true).map((m) => m.unit.id)).toEqual(["a", "b"]);
  });
});

describe("shipping", () => {
  // Normal builds must never contain a draft unit; only builds made with NEXT_PUBLIC_DRAFT_UNITS=on may.
  it.skipIf(process.env.NEXT_PUBLIC_DRAFT_UNITS === "on")("no draft unit is in the course learners see", () => {
    expect(course.units.filter((u) => u.draft)).toEqual([]);
  });
});
