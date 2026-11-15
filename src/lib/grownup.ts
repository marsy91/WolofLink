// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * The grown-up check: before a child's profile reaches settings, another profile or an
 * online screen, an adult answers a multiplication a young child can't do in their head
 * (a two-digit number times 6–9). Once passed, it stays open for a few minutes.
 * Pure; tested in grownup.test.ts.
 */
import { seeded } from "./engine";

export interface GrownUpQuestion {
  a: number;
  b: number;
  answer: number;
}

export function grownUpQuestion(seed: number): GrownUpQuestion {
  const rng = seeded(seed);
  const a = 12 + Math.floor(rng() * 18); // 12–29
  const b = 6 + Math.floor(rng() * 4); // 6–9
  return { a, b, answer: a * b };
}

export function isGrownUpAnswer(q: GrownUpQuestion, typed: string): boolean {
  const n = typed.replace(/\s/g, "");
  return /^\d{1,4}$/.test(n) && Number(n) === q.answer;
}

/** How long a passed check stays open. */
export const GROWN_UP_OPEN_MS = 5 * 60 * 1000;

let openUntil = 0;

export function grownUpOpen(now = Date.now()): boolean {
  return now < openUntil;
}

export function openGrownUp(now = Date.now()) {
  openUntil = now + GROWN_UP_OPEN_MS;
}

export function closeGrownUp() {
  openUntil = 0;
}
