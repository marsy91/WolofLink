// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Wrestling (làmb) duels: how far the wrestlers push each other in the sand circle.
 * Every answer is a move: a right answer pushes (harder when fast), a wrong one gives ground.
 * The balance runs from -1 (I am at the edge) to +1 (they are at the edge); past ±1 is out.
 * Pure functions, tested in lamb.test.ts.
 */
import { DUEL_LENGTH } from "./duels";

/** Strength of one answer: 0 when wrong, 0.7–1 when right (faster is stronger). */
export function strength(points: number): number {
  if (points <= 0) return 0;
  return 0.7 + (0.3 * Math.min(50, Math.max(0, points - 100))) / 50;
}

const sum = (xs: number[]) => xs.reduce((a, p) => a + strength(p), 0);
const clamp = (x: number) => Math.min(1, Math.max(-1, x));

/** Net answers needed to push someone to the edge. */
export const EDGE = 4;

/** Balance after these answers (both players' points so far). */
export function balance(mine: number[], theirs: number[]): number {
  return clamp((sum(mine) - sum(theirs)) / EDGE);
}

/**
 * While the friend's answers are still hidden, my wrestler pushes against a steady
 * opponent who gets about three answers in four right.
 */
export const GHOST = 0.75;
export function ghostBalance(mine: number[]): number {
  return clamp((sum(mine) - GHOST * mine.length) / EDGE);
}

/** Where the bout ends: the winner throws the other out of the circle; a draw stays in the middle. */
export function finalBalance(result: "won" | "lost" | "draw"): number {
  return result === "won" ? 1.35 : result === "lost" ? -1.35 : 0;
}

/** Progress through the bout, 0–1 (for the screen reader label and the crowd's noise). */
export const boutProgress = (answered: number) => Math.min(1, answered / DUEL_LENGTH);
