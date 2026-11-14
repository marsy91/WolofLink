// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { balance, boutProgress, EDGE, finalBalance, ghostBalance, strength } from "./lamb";

describe("wrestling duel balance", () => {
  it("scores each answer as a move", () => {
    expect(strength(0)).toBe(0);
    expect(strength(100)).toBeCloseTo(0.7);
    expect(strength(150)).toBeCloseTo(1);
    expect(strength(999)).toBeCloseTo(1);
  });

  it("pushes towards whoever is answering worse, and stops at the edge", () => {
    expect(balance([], [])).toBe(0);
    expect(balance([150, 150], [0, 0])).toBeCloseTo(2 / EDGE);
    expect(balance([0], [150])).toBeLessThan(0);
    expect(balance(Array(10).fill(150), Array(10).fill(0))).toBe(1);
    expect(balance(Array(10).fill(0), Array(10).fill(150))).toBe(-1);
    expect(balance([120, 0, 140], [120, 0, 140])).toBe(0);
  });

  it("pushes against a steady opponent while the friend's answers are hidden", () => {
    expect(ghostBalance([])).toBe(0);
    expect(ghostBalance([150, 150, 150])).toBeGreaterThan(0);
    expect(ghostBalance([0, 0, 0])).toBeLessThan(0);
  });

  it("throws the loser out of the circle at the end", () => {
    expect(finalBalance("won")).toBeGreaterThan(1);
    expect(finalBalance("lost")).toBeLessThan(-1);
    expect(finalBalance("draw")).toBe(0);
    expect(boutProgress(5)).toBe(0.5);
    expect(boutProgress(20)).toBe(1);
  });
});
