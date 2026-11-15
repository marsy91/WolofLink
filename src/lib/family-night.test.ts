// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { seeded } from "./engine";
import {
  boutBalance,
  boutEnd,
  champion,
  inSuddenDeath,
  newTournament,
  nextMatch,
  nightQuestion,
  poolFor,
  PUSH,
  questionNow,
  recordWinner,
  turnOf,
  type Bout,
} from "./family-night";

const bout = (answers: boolean[], left = "grown", right = "grown"): Bout => ({
  left: { id: "a", level: left as "grown" },
  right: { id: "b", level: right as "grown" },
  answers,
  seed: 7,
});

describe("Family Làmb Night questions", () => {
  it("has enough words for every level", () => {
    expect(poolFor("little").length).toBeGreaterThan(40);
    expect(poolFor("kid").length).toBeGreaterThan(100);
    expect(poolFor("grown").length).toBeGreaterThan(100);
    expect(poolFor("little").every((e) => !!e.pic)).toBe(true);
    expect(poolFor("kid").every((e) => !/\s/.test(e.wo.trim()))).toBe(true);
  });

  it("gives pictures to little ones, 3 options to children and 4 to grown-ups, with distinct options", () => {
    for (let s = 0; s < 100; s++) {
      const little = nightQuestion("little", seeded(s), 0);
      expect(little.kind).toBe("picture");
      expect(little.options).toHaveLength(3);
      expect(new Set(little.options.map((o) => o.pic)).size).toBe(3);
      expect(little.options[little.answer]).toBe(little.entry);
      const kid = nightQuestion("kid", seeded(s), s);
      expect(kid.options).toHaveLength(3);
      expect(new Set(kid.options.map((o) => o.tr.en.toLowerCase())).size).toBe(3);
      const grown = nightQuestion("grown", seeded(s), s);
      expect(grown.options).toHaveLength(4);
      expect(new Set(grown.options.map((o) => o.wo)).size).toBe(4);
    }
  });

  it("offers a word with other words and a phrase with other phrases", () => {
    const isPhrase = (wo: string) => /\s/.test(wo.trim());
    for (let seed = 1; seed <= 200; seed++) {
      const q = nightQuestion("grown", seeded(seed), seed % 2 === 0 ? 0 : 1);
      for (const o of q.options) expect([q.entry.wo, isPhrase(o.wo)]).toEqual([q.entry.wo, isPhrase(q.entry.wo)]);
    }
  });

  it("doesn't repeat a word in a bout and rebuilds the same question every time", () => {
    const b = bout([true, false, true, true, false, true, true, true]);
    expect(questionNow(b).entry.id).toBe(questionNow(b).entry.id);
    const ids = Array.from({ length: 10 }, (_, i) => questionNow(bout(Array(i).fill(true), "kid", "kid")).entry.id);
    expect(new Set(ids).size).toBe(10);
  });
});

describe("a bout", () => {
  it("takes turns and shoves by level", () => {
    expect(turnOf(bout([]))).toBe(0);
    expect(turnOf(bout([true]))).toBe(1);
    expect(boutBalance(bout([true]))).toBe(PUSH.grown);
    expect(boutBalance(bout([true, true], "little", "grown"))).toBeCloseTo(PUSH.little - PUSH.grown);
    expect(boutBalance(bout([false, true]))).toBe(-PUSH.grown);
  });

  it("ends early when a wrestler is thrown out, otherwise on points after 5 turns each", () => {
    // Little one right every time, grown-up always wrong: thrown on the 5th push (5 × 0.25 > 1).
    const thrown = bout([true, false, true, false, true, false, true, false, true], "little", "grown");
    expect(boutEnd(thrown)).toEqual({ winner: 0, how: "thrown" });
    expect(boutEnd(bout([true, false, true, false]))).toBeNull();
    const points = bout([true, true, true, true, true, false, false, false, false, false]);
    expect(boutEnd(points)).toEqual({ winner: 0, how: "points" });
  });

  it("gives a child the edge when both answer everything right", () => {
    const all = Array(10).fill(true);
    expect(boutEnd(bout(all, "grown", "little"))).toEqual({ winner: 1, how: "points" });
  });

  it("goes to sudden death on a tie, then the crowd decides", () => {
    const tie = bout(Array(10).fill(true));
    expect(boutEnd(tie)).toBeNull();
    expect(inSuddenDeath(tie)).toBe(true);
    expect(boutEnd(bout([...Array(10).fill(true), true, false]))).toEqual({ winner: 0, how: "points" });
    const end = boutEnd(bout(Array(16).fill(true)));
    expect(end?.how).toBe("crowd");
    expect(boutEnd(bout(Array(16).fill(false), "grown", "kid"))).toEqual({ winner: 1, how: "crowd" });
  });
});

describe("the tournament", () => {
  const play = (ids: string[]) => {
    let t = newTournament(ids, 3);
    let bouts = 0;
    for (let next = nextMatch(t); next; next = nextMatch(t)) {
      t = recordWinner(t, next.match.a);
      bouts++;
      expect(bouts).toBeLessThan(10);
    }
    return { t, bouts };
  };

  it("crowns one champion after n − 1 bouts for 2 to 6 players", () => {
    for (let n = 2; n <= 6; n++) {
      const ids = Array.from({ length: n }, (_, i) => `p${i}`);
      const { t, bouts } = play(ids);
      expect(bouts).toBe(n - 1);
      expect(ids).toContain(champion(t));
    }
  });

  it("never gives the same player two byes in a row", () => {
    const { t } = play(["a", "b", "c", "d", "e"]);
    for (let r = 1; r < t.rounds.length; r++) {
      const before = t.rounds[r - 1]!.filter((m) => m.b === null).map((m) => m.a);
      const now = t.rounds[r]!.filter((m) => m.b === null).map((m) => m.a);
      expect(now.some((x) => before.includes(x))).toBe(false);
    }
  });

  it("ignores a winner who isn't in the bout and refuses too few or too many players", () => {
    const t = newTournament(["a", "b"], 1);
    expect(recordWinner(t, "zz")).toEqual(t);
    expect(() => newTournament(["a"], 1)).toThrow();
    expect(() => newTournament(["a", "b", "c", "d", "e", "f", "g"], 1)).toThrow();
  });
});
