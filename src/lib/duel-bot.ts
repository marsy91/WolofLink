// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * "Duel the computer": a practice opponent that answers the same 10 questions with
 * a set accuracy and speed. Played entirely on the phone; nothing is sent to the
 * server and no trophies are earned. Pure and seeded, so a duel can be replayed.
 */
import { seeded } from "./engine";
import { DUEL_LENGTH, pointsFor } from "./duels";

export const BOT_LEVELS = ["easy", "medium", "hard"] as const;
export type BotLevel = (typeof BOT_LEVELS)[number];

/** How often the computer is right, and how fast it answers (milliseconds). */
export const BOT_SKILL: Record<BotLevel, { accuracy: number; fastest: number; slowest: number }> = {
  easy: { accuracy: 0.55, fastest: 4000, slowest: 7500 },
  medium: { accuracy: 0.75, fastest: 2500, slowest: 5000 },
  hard: { accuracy: 0.92, fastest: 1200, slowest: 3000 },
};

export function isBotLevel(v: unknown): v is BotLevel {
  return (BOT_LEVELS as readonly unknown[]).includes(v);
}

/** The computer's points for each of the 10 questions. */
export function botPoints(seed: number, level: BotLevel): number[] {
  const rng = seeded(seed ^ 0xb07);
  const s = BOT_SKILL[level];
  return Array.from({ length: DUEL_LENGTH }, () => {
    const correct = rng() < s.accuracy;
    const ms = s.fastest + rng() * (s.slowest - s.fastest);
    return pointsFor(correct, ms);
  });
}
