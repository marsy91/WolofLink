// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { botPoints, BOT_LEVELS, isBotLevel } from "./duel-bot";

const avg = (level: (typeof BOT_LEVELS)[number]) => {
  let total = 0;
  for (let seed = 1; seed <= 200; seed++) total += botPoints(seed, level).reduce((a, b) => a + b, 0);
  return total / 200;
};

describe("duel bot", () => {
  it("gives ten valid answers and the same ones for the same seed", () => {
    for (const level of BOT_LEVELS) {
      const p = botPoints(42, level);
      expect(p).toHaveLength(10);
      for (const x of p) expect(x === 0 || (x >= 100 && x <= 150)).toBe(true);
      expect(botPoints(42, level)).toEqual(p);
    }
  });
  it("gets harder from easy to hard", () => {
    const [e, m, h] = BOT_LEVELS.map(avg);
    expect(e).toBeLessThan(m!);
    expect(m).toBeLessThan(h!);
    expect(h).toBeLessThan(1500);
  });
  it("only accepts known levels", () => {
    expect(isBotLevel("hard")).toBe(true);
    expect(isBotLevel("expert")).toBe(false);
  });
});
