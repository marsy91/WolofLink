// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { allLessons, course } from "@/content/course";
import { guide } from "./guide";

describe("guide", () => {
  it("lists every lesson tip once, in course order", () => {
    const all = guide("en");
    expect(all.flatMap((u) => u.tips).length).toBe(allLessons.filter((l) => l.tip).length);
    expect(all[0]!.unitId).toBe(course.units[0]!.id);
  });
  it("finds tips by a word, ignoring accents and case", () => {
    const hits = guide("en", "DINAA").flatMap((u) => u.tips.map((t) => t.lessonId));
    expect(hits).toContain("future-1");
    expect(guide("en", "mbir-that-does-not-exist")).toEqual([]);
  });
  it("matches a unit title and keeps all its tips", () => {
    const [unit] = guide("en", "On the phone");
    expect(unit!.unitId).toBe("u23");
    expect(unit!.tips).toHaveLength(2);
  });
  it("uses the learner's language", () => {
    expect(guide("fr")[0]!.title).toBe(course.units[0]!.title.fr);
  });
});
