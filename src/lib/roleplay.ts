// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Role-play: the learner takes one part in a dialogue. At each of their turns
 * they pick what to say from three lines; the other part is played for them.
 * Uses only lines already in the course.
 */
import { allStories } from "@/content/course";
import type { Story } from "@/content/types";
import { normalize, shuffle, type Rng } from "./engine";

export interface RoleTurn {
  index: number;
  mine: boolean;
  /** For the learner's turns: three lines to choose from, the right one included. */
  options: { wo: string; correct: boolean }[];
}

export const ROLEPLAY_OPTIONS = 3;

/** Lines that could be wrong answers: other lines in this dialogue first, then other dialogues. */
function decoys(story: Story, index: number): string[] {
  const right = normalize(story.lines[index]!.wo);
  const near = story.lines.filter((_, i) => i !== index).map((l) => l.wo);
  const far = allStories.filter((s) => s.story.id !== story.id).flatMap((s) => s.story.lines.map((l) => l.wo));
  const seen = new Set([right]);
  const out: string[] = [];
  for (const wo of [...near, ...far]) {
    const k = normalize(wo);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(wo);
  }
  return out;
}

export function buildRoleplay(story: Story, speaker: string, rng: Rng): RoleTurn[] {
  return story.lines.map((line, index) => {
    if (line.speaker !== speaker) return { index, mine: false, options: [] };
    const pool = decoys(story, index);
    // Keep one wrong answer from this dialogue when possible, so the choice needs understanding, not just recognition.
    const sameStory = shuffle(pool.filter((wo) => story.lines.some((l) => l.wo === wo)), rng).slice(0, 1);
    const rest = shuffle(pool.filter((wo) => !sameStory.includes(wo)), rng).slice(0, ROLEPLAY_OPTIONS - 1 - sameStory.length);
    const options = shuffle([{ wo: line.wo, correct: true }, ...[...sameStory, ...rest].map((wo) => ({ wo, correct: false }))], rng);
    return { index, mine: true, options };
  });
}

/** The parts a learner can take (everyone who speaks at least twice). */
export function playableSpeakers(story: Story): string[] {
  const counts = new Map<string, number>();
  for (const l of story.lines) counts.set(l.speaker, (counts.get(l.speaker) ?? 0) + 1);
  return [...counts].filter(([, n]) => n >= 2).map(([s]) => s);
}
