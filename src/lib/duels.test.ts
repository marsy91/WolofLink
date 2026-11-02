// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import { UI_LANGS } from "@/content/types";
import { buildDuel, duelState, optionLabel, pickDuelEntries, pointsFor, type DuelRow } from "./duels";
import { normalize } from "./engine";
import { emptyProgress } from "./progress";

describe("duels", () => {
  it("picks 10 different real entries, from the first units for a new learner", () => {
    const ids = pickDuelEntries(emptyProgress(0), 42);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    for (const id of ids) expect(course.entries[id]).toBeDefined();
  });

  it("rebuilds exactly the same questions from the seed", () => {
    const ids = pickDuelEntries(emptyProgress(0), 7);
    const a = buildDuel(1234, ids);
    const b = buildDuel(1234, ids);
    expect(a.map((q) => [q.kind, q.entry.id, q.options.map((o) => o.id), q.answer])).toEqual(
      b.map((q) => [q.kind, q.entry.id, q.options.map((o) => o.id), q.answer]),
    );
    expect(a.map((q) => q.kind).slice(0, 3)).toEqual(["meaning", "wolof", "listen"]);
  });

  it("gives four distinct options with the answer among them, in every language", () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of buildDuel(seed, pickDuelEntries(emptyProgress(0), seed))) {
        expect(q.options).toHaveLength(4);
        expect(q.options[q.answer]!.id).toBe(q.entry.id);
        for (const lang of UI_LANGS) {
          const labels = q.options.map((o) => normalize(optionLabel(q, o, lang)));
          if (lang === "en" || q.kind !== "meaning") expect(new Set(labels).size, `${seed} ${q.entry.id} ${lang}`).toBe(4);
        }
      }
    }
  });

  it("scores right answers with a speed bonus", () => {
    expect(pointsFor(false, 500)).toBe(0);
    expect(pointsFor(true, 1000)).toBe(150);
    expect(pointsFor(true, 4500)).toBe(125);
    expect(pointsFor(true, 20000)).toBe(100);
  });

  it("works out who won", () => {
    const base: DuelRow = { id: "d", other_name: "Awa", i_challenged: true, my_score: 900, their_score: null, status: "waiting", seed: 1, entries: [], created_at: "" };
    expect(duelState(base)).toBe("waiting");
    expect(duelState({ ...base, i_challenged: false })).toBe("your-turn");
    expect(duelState({ ...base, status: "done", their_score: 800 })).toBe("won");
    expect(duelState({ ...base, status: "done", their_score: 900 })).toBe("draw");
    expect(duelState({ ...base, status: "done", their_score: 1000 })).toBe("lost");
    expect(duelState({ ...base, status: "expired" })).toBe("expired");
  });
});
