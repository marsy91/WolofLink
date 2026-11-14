// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { balance, boutProgress, finalBalance, ghostBalance, move, strength } from "./lamb";

describe("wrestling duel balance", () => {
  it("makes every right answer a clear push, faster ones further", () => {
    expect(move(0)).toBeLessThan(0);
    expect(move(100)).toBeCloseTo(0.1);
    expect(move(150)).toBeCloseTo(0.16);
    expect(move(999)).toBeCloseTo(0.16);
    expect(strength(0)).toBe(0);
    expect(strength(150)).toBeCloseTo(1);
  });

  it("walks the opponent to the edge answer by answer when their answers are hidden", () => {
    let last = 0;
    const pts: number[] = [];
    for (let i = 0; i < 6; i++) {
      pts.push(130);
      const b = ghostBalance(pts);
      expect(b).toBeGreaterThan(last + 0.09);
      last = b;
    }
    expect(ghostBalance(Array(10).fill(150))).toBe(1);
    expect(ghostBalance([0, 0, 0])).toBeLessThan(0);
    expect(ghostBalance([])).toBe(0);
  });

  it("against the computer, answering better pushes, and it stops at the edge", () => {
    expect(balance([], [])).toBe(0);
    expect(balance([150], [0])).toBeGreaterThan(0.3);
    expect(balance([0], [150])).toBeLessThan(-0.3);
    expect(balance([120, 0, 140], [120, 0, 140])).toBe(0);
    expect(balance(Array(10).fill(150), Array(10).fill(0))).toBe(1);
  });

  it("throws the loser out of the circle at the end", () => {
    expect(finalBalance("won")).toBeGreaterThan(1);
    expect(finalBalance("lost")).toBeLessThan(-1);
    expect(finalBalance("draw")).toBe(0);
    expect(boutProgress(5)).toBe(0.5);
  });
});
