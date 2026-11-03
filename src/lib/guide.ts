// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** The grammar and culture guide: every lesson tip, by unit, searchable. */
import { course } from "@/content/course";
import type { UiLang } from "@/content/types";
import { stripMarks } from "./engine";

export interface GuideTip {
  lessonId: string;
  lesson: string;
  text: string;
}
export interface GuideUnit {
  unitId: string;
  number: number;
  title: string;
  tips: GuideTip[];
}

const fold = (s: string) => stripMarks(s).toLowerCase();

/** Units with their tips in `lang`; with a query, only tips (or units) that mention it. */
export function guide(lang: UiLang, query = ""): GuideUnit[] {
  const q = fold(query.trim());
  return course.units
    .map((u, i) => {
      const title = u.title[lang] || u.title.en;
      const tips = u.lessons
        .filter((l) => l.tip)
        .map((l) => ({ lessonId: l.id, lesson: l.title[lang] || l.title.en, text: l.tip![lang] || l.tip!.en }));
      const hit = !q || fold(title).includes(q) ? tips : tips.filter((tip) => fold(`${tip.lesson} ${tip.text}`).includes(q));
      return { unitId: u.id, number: i + 1, title, tips: hit };
    })
    .filter((u) => u.tips.length);
}
