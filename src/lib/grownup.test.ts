// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { closeGrownUp, GROWN_UP_OPEN_MS, grownUpOpen, grownUpQuestion, isGrownUpAnswer, openGrownUp } from "./grownup";

describe("grown-up check", () => {
  it("asks a two-digit number times 6–9 and checks the answer", () => {
    for (let s = 0; s < 200; s++) {
      const q = grownUpQuestion(s);
      expect(q.a).toBeGreaterThanOrEqual(12);
      expect(q.a).toBeLessThanOrEqual(29);
      expect(q.b).toBeGreaterThanOrEqual(6);
      expect(q.b).toBeLessThanOrEqual(9);
      expect(isGrownUpAnswer(q, String(q.a * q.b))).toBe(true);
      expect(isGrownUpAnswer(q, ` ${q.a * q.b} `)).toBe(true);
      expect(isGrownUpAnswer(q, String(q.a * q.b + 1))).toBe(false);
    }
    expect(isGrownUpAnswer({ a: 12, b: 6, answer: 72 }, "7e1")).toBe(false);
    expect(isGrownUpAnswer({ a: 12, b: 6, answer: 72 }, "")).toBe(false);
  });

  it("stays open for a few minutes once passed", () => {
    closeGrownUp();
    expect(grownUpOpen(1000)).toBe(false);
    openGrownUp(1000);
    expect(grownUpOpen(1000 + GROWN_UP_OPEN_MS - 1)).toBe(true);
    expect(grownUpOpen(1000 + GROWN_UP_OPEN_MS)).toBe(false);
  });
});
