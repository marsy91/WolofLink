// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { allStories } from "@/content/course";
import { normalize, seeded } from "./engine";
import { ROLEPLAY_OPTIONS, buildRoleplay, playableSpeakers } from "./roleplay";

describe("role-play", () => {
  it("every dialogue has at least one part to play", () => {
    for (const { story } of allStories) expect(playableSpeakers(story).length, story.id).toBeGreaterThan(0);
  });
  it("gives each of the learner's turns one right line and distinct wrong ones", () => {
    for (const { story } of allStories) {
      for (const speaker of playableSpeakers(story)) {
        const turns = buildRoleplay(story, speaker, seeded(7));
        expect(turns).toHaveLength(story.lines.length);
        for (const turn of turns) {
          const line = story.lines[turn.index]!;
          expect(turn.mine).toBe(line.speaker === speaker);
          if (!turn.mine) continue;
          expect(turn.options).toHaveLength(ROLEPLAY_OPTIONS);
          expect(turn.options.filter((o) => o.correct).map((o) => o.wo)).toEqual([line.wo]);
          expect(new Set(turn.options.map((o) => normalize(o.wo))).size).toBe(ROLEPLAY_OPTIONS);
        }
      }
    }
  });
  it("is repeatable for the same seed", () => {
    const { story } = allStories[0]!;
    const sp = playableSpeakers(story)[0]!;
    expect(buildRoleplay(story, sp, seeded(3))).toEqual(buildRoleplay(story, sp, seeded(3)));
  });
});
