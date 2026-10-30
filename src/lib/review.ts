// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Builds a review session from spaced-repetition cards that are due. */
import { allLessons, course } from "@/content/course";
import type { ExerciseSpec, UiLang } from "@/content/types";
import { buildExercise, shuffle, tokensOf, type Exercise, type Rng } from "./engine";

const ROTATION: ExerciseSpec["type"][] = ["pick_wolof", "listen", "type_wolof", "pick_meaning", "build"];

function poolFor(entryId: string): string[] {
  return allLessons.find((l) => l.entries.includes(entryId))?.entries ?? [];
}

/** Two words from neighbouring phrases, so a tile puzzle has wrong options. */
function extraTiles(entryId: string, rng: Rng): string[] {
  const own = new Set(tokensOf(course.entries[entryId]!).map((w) => w.toLowerCase()));
  const words = poolFor(entryId)
    .filter((id) => id !== entryId)
    .flatMap((id) => tokensOf(course.entries[id]!))
    .filter((w) => !own.has(w.toLowerCase()));
  return [...new Set(shuffle(words, rng))].slice(0, 2);
}

export function buildReview(entryIds: string[], lang: UiLang, rng: Rng): Exercise[] {
  const ids = shuffle(
    entryIds.filter((id) => course.entries[id]),
    rng,
  );
  return ids.map((id, i) => {
    const entry = course.entries[id]!;
    let type = ROTATION[i % ROTATION.length]!;
    // Single words make poor tile puzzles; reverse-translate them instead.
    if (type === "build" && tokensOf(entry).length < 2) type = entry.pic ? "pick_picture" : "pick_wolof";
    const spec: ExerciseSpec =
      type === "build"
        ? { type, entry: id, distractors: extraTiles(id, rng) }
        : ({ type, entry: id } as ExerciseSpec);
    return buildExercise(spec, i, { course, lang, rng, pool: poolFor(id) });
  });
}
