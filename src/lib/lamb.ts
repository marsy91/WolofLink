// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Wrestling (làmb) duels: how far the wrestlers push each other in the sand circle.
 * Every answer is a move: a right answer pushes the opponent a clear step towards the edge
 * (a bigger step when it's fast), a wrong one gives a little ground back.
 * The balance runs from -1 (I am at the edge) to +1 (they are at the edge); past ±1 is out.
 * Pure functions, tested in lamb.test.ts.
 */
import { DUEL_LENGTH } from "./duels";

/** Speed of a right answer, 0 (slow) to 1 (fast), from its points (100–150). */
const speed = (points: number) => Math.min(1, Math.max(0, (points - 100) / 50));

/** How far one answer moves the opponent: +0.1 to +0.16 when right, -0.06 when wrong. */
export function move(points: number): number {
  return points > 0 ? 0.1 + 0.06 * speed(points) : -0.06;
}

/** Older name kept for the results screen: strength of an answer (0 when wrong, 0.7–1 when right). */
export function strength(points: number): number {
  return points > 0 ? 0.7 + 0.3 * speed(points) : 0;
}

const total = (xs: number[]) => xs.reduce((a, p) => a + move(p), 0);
const clamp = (x: number) => Math.min(1, Math.max(-1, x));

/** Against a visible opponent, the difference in moves counts this much (so a duel feels close). */
export const VERSUS = 1.6;

/** Balance after these answers (both players' points so far). */
export function balance(mine: number[], theirs: number[]): number {
  return clamp((total(mine) - total(theirs)) * VERSUS);
}

/** While the friend's answers are hidden, every right answer simply pushes them back. */
export function ghostBalance(mine: number[]): number {
  return clamp(total(mine));
}

/** Where the bout ends: the winner throws the other out of the circle; a draw stays in the middle. */
export function finalBalance(result: "won" | "lost" | "draw"): number {
  return result === "won" ? 1.35 : result === "lost" ? -1.35 : 0;
}

/** Progress through the bout, 0–1 (for the screen reader label and the crowd's noise). */
export const boutProgress = (answered: number) => Math.min(1, answered / DUEL_LENGTH);
