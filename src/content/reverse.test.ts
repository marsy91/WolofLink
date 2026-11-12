// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { tWolof } from "@/i18n";
import { wo } from "@/i18n/wo";
import { buildLesson, seeded } from "@/lib/engine";
import { dueEntries, emptyProgress, migrate } from "@/lib/progress";
import { buildReview } from "@/lib/review";
import { allLessons, course } from "./course";
import {
  allReverseLessonIds,
  courseFor,
  learnText,
  REVERSE_CONTENT_LANG,
  REVERSE_TARGETS,
  reverseCourse,
  targetOfLesson,
  WOLOF_UNIT_TITLES,
} from "./reverse";

describe("text to learn", () => {
  it("drops explanations and keeps one alternative", () => {
    expect(learnText("Hello (in reply)", "Maalekum salaam")).toBe("Hello");
    expect(learnText("Il/Elle est gentil(le)", "Dafa baax")).toBe("Il est gentil");
    expect(learnText("What a pity! / Poor thing!", "Ndeysaan!")).toBe("What a pity!");
    expect(learnText("student, pupil", "ndongo")).toBe("student");
    expect(learnText("Hello, how are you?", "Na nga def?")).toBe("Hello, how are you?");
    expect(learnText("He / she is fine", "Mu ngi fi")).toBe("He is fine");
    expect(learnText("Il / elle prie", "Mu ngi julli")).toBe("Il prie");
    expect(learnText("It's nothing / Never mind", "Amul dara")).toBe("It's nothing");
  });
});

describe("reversed course", () => {
  for (const target of REVERSE_TARGETS) {
    const c = reverseCourse(target);

    it(`${target}: every lesson builds, with ${target} to learn and Wolof as the meaning`, () => {
      expect(c.target).toBe(target);
      expect(c.units.length).toBeGreaterThan(20);
      for (const e of Object.values(c.entries)) {
        expect(e.id.startsWith(`${target}:`)).toBe(true);
        expect(e.voice).toMatch(new RegExp(`^${target}-`));
        expect(e.wo).not.toMatch(/[()]/);
        const wolof = course.entries[e.id.slice(3)]!;
        expect(e.tr.fr).toBe(wolof.wo);
      }
      for (const unit of c.units) {
        for (const lesson of unit.lessons) {
          expect(targetOfLesson(lesson.id)).toBe(target);
          expect(lesson.exercises.some((x) => x.type === "fill_blank" || x.type === "speak")).toBe(false);
          for (const x of lesson.exercises) {
            for (const id of x.type === "match" ? x.entries : [x.entry]) expect(c.entries[id], `${lesson.id} ${id}`).toBeDefined();
          }
          for (const level of [1, 2, 3]) {
            const exercises = buildLesson(lesson, { course: c, lang: REVERSE_CONTENT_LANG, rng: seeded(level) }, level);
            expect(exercises.length).toBe(lesson.exercises.length);
          }
        }
      }
    });

    it(`${target}: titles are in Wolof and ids never clash with the Wolof course`, () => {
      for (const unit of c.units) expect(Object.values(WOLOF_UNIT_TITLES)).toContain(unit.title.en);
      const wolofIds = new Set(allLessons.map((l) => l.id));
      for (const id of c.units.flatMap((u) => u.lessons.map((l) => l.id))) expect(wolofIds.has(id)).toBe(false);
    });
  }

  it("has a Wolof title for every released unit and routes for every lesson", () => {
    for (const u of course.units.filter((x) => !x.draft)) expect(WOLOF_UNIT_TITLES[u.id], u.id).toBeTruthy();
    const ids = allReverseLessonIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(courseFor("wo")).toBe(course);
    expect(courseFor(undefined)).toBe(course);
    expect(courseFor("fr")).toBe(reverseCourse("fr"));
    expect(targetOfLesson(allLessons[0]!.id)).toBeNull();
  });

  it("keeps reviews and due cards apart per course", () => {
    const fr = reverseCourse("fr");
    const frId = Object.keys(fr.entries)[0]!;
    const woId = Object.keys(course.entries)[0]!;
    const p = emptyProgress(0);
    p.srs = { [frId]: { box: 1, due: 0 }, [woId]: { box: 1, due: 0 } } as typeof p.srs;
    expect(dueEntries(p, 10, 10, fr)).toEqual([frId]);
    expect(dueEntries(p, 10, 10, course)).toEqual([woId]);
    expect(dueEntries(p, 10, 10)).toHaveLength(2);
    expect(buildReview([frId, woId], REVERSE_CONTENT_LANG, seeded(1), fr)).toHaveLength(1);
    expect(buildReview([frId, woId], "en", seeded(1))).toHaveLength(1);
  });

  it("falls back to the Wolof course for an unknown target", () => {
    const stored = { ...emptyProgress(0), profile: { id: "x", name: "", uiLang: "fr", target: "zz", goal: "regular", createdAt: 0, guest: true } };
    expect(migrate(stored)?.profile?.target).toBe("wo");
    const ok = { ...stored, profile: { ...stored.profile, target: "en" } };
    expect(migrate(ok)?.profile?.target).toBe("en");
  });
});

describe("Wolof interface", () => {
  it("only has known keys, keeps placeholders and falls back to French", () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const [key, text] of Object.entries(wo)) {
      expect(key in en, key).toBe(true);
      expect(text!.trim(), key).not.toBe("");
      const extra = vars(text!).filter((v) => !vars(en[key as keyof typeof en]).includes(v));
      // Instructions may name the language being learned.
      expect(extra.filter((v) => !(v === "lang" && key.startsWith("ex."))), key).toEqual([]);
    }
    expect(tWolof("lesson.begin")).toBe("Tàmbali");
    expect(tWolof("ex.build", { lang: "angale" })).toBe("Firil ko ci angale");
    expect(tWolof("settings.title")).not.toBe(en["settings.title"]);
  });
});
