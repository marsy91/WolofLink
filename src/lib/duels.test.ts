// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import { UI_LANGS } from "@/content/types";
import { buildDuel, crownsFor, duelProblem, duelState, optionLabel, pickDuelEntries, pointsFor, roundOf, type DuelRow } from "./duels";
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

  it("splits the duel into three rounds and gives a crown per round won", () => {
    expect([0, 2, 3, 5, 6, 9].map(roundOf)).toEqual([0, 0, 1, 1, 2, 2]);
    const a = [100, 100, 100, 0, 0, 0, 150, 150, 0, 0];
    const b = [150, 0, 120, 100, 0, 0, 130, 0, 100, 0];
    const c = crownsFor(a, b);
    expect(c.rounds.map((r) => r.winner)).toEqual(["me", "them", "me"]);
    expect([c.mine, c.theirs]).toEqual([2, 1]);
    expect(crownsFor(a, a)).toMatchObject({ mine: 0, theirs: 0 });
  });

  it("decides by crowns first, then by score", () => {
    const base: DuelRow = { id: "d", other_name: "Awa", i_challenged: true, my_score: 500, their_score: 900, status: "done", seed: 1, entries: [], created_at: "" };
    expect(duelState({ ...base, my_crowns: 2, their_crowns: 1 })).toBe("won");
    expect(duelState({ ...base, my_crowns: 1, their_crowns: 1 })).toBe("lost");
    expect(duelState({ ...base, my_crowns: null, their_crowns: null })).toBe("lost");
  });

  it("the server knows every course entry (one trophy each, never more)", () => {
    const dir = join(__dirname, "../../supabase/migrations");
    const known = new Set<string>();
    for (const f of readdirSync(dir)) {
      const sql = readFileSync(join(dir, f), "utf8");
      for (const block of sql.split("insert into private.duel_entries").slice(1)) {
        const values = block.slice(0, block.indexOf("on conflict"));
        for (const m of values.matchAll(/\('([^']+)'\)/g)) known.add(m[1]!);
      }
    }
    const missing = Object.keys(course.entries).filter((id) => !known.has(id));
    // New units need a migration adding their entries: insert into private.duel_entries (id) values (...).
    expect(missing, "add these to private.duel_entries in a new migration").toEqual([]);
    expect([...known].filter((id) => !course.entries[id])).toEqual([]);
  });

  it("turns duel errors into something to tell the player", () => {
    expect(duelProblem(new Error("no new words"))).toBe("noNewWords");
    expect(duelProblem({ message: "paused" })).toBe("paused");
    expect(duelProblem({ message: "too many duels today" })).toBe("tooMany");
    expect(duelProblem({ message: "this duel is over" })).toBe("over");
    expect(duelProblem({ kind: "network", message: "Failed to fetch" })).toBe("offline");
    expect(duelProblem({ message: "Could not find the function public.start_duel(friend) in the schema cache", code: "PGRST202" })).toBe("updating");
    expect(duelProblem({ message: "boom", status: 503 })).toBe("updating");
    expect(duelProblem(null)).toBe("failed");
  });
});
