/**
 * Lesson session state machine. Missed exercises are re-queued once at the end
 * so the learner sees them again before finishing ("review mistakes").
 */
import type { Exercise } from "./engine";

export type SessionMode = "lesson" | "review";

export interface SessionState {
  mode: SessionMode;
  queue: Exercise[];
  index: number;
  /** Number of exercises before any retries were added. */
  baseCount: number;
  /** Drops left; ignored in review mode (reviews never cost drops). */
  drops: number;
  firstTryCorrect: number;
  /** Exercises missed at least once, in order, without duplicates. */
  mistakes: Exercise[];
  /** Per-entry outcome of the first attempt, for spaced repetition. */
  outcomes: Record<string, boolean>;
  /** Feedback for the current exercise, set by `answer` and cleared by `next`. */
  feedback: null | { correct: boolean };
  status: "playing" | "complete" | "failed";
}

export function startSession(queue: Exercise[], drops: number, mode: SessionMode): SessionState {
  return {
    mode,
    queue,
    index: 0,
    baseCount: queue.length,
    drops,
    firstTryCorrect: 0,
    mistakes: [],
    outcomes: {},
    feedback: null,
    status: queue.length === 0 ? "complete" : "playing",
  };
}

export function current(state: SessionState): Exercise | undefined {
  return state.queue[state.index];
}

export function answer(state: SessionState, correct: boolean): SessionState {
  const ex = current(state);
  if (!ex || state.feedback || state.status !== "playing") return state;

  const outcomes = { ...state.outcomes };
  if (!ex.isRetry) for (const id of ex.entryIds) outcomes[id] = (outcomes[id] ?? true) && correct;

  if (correct) {
    return {
      ...state,
      outcomes,
      feedback: { correct },
      firstTryCorrect: state.firstTryCorrect + (ex.isRetry ? 0 : 1),
    };
  }

  const alreadyMissed = state.mistakes.some((m) => m.key === ex.key.replace(/:retry$/, ""));
  const queue = ex.isRetry ? state.queue : [...state.queue, { ...ex, key: `${ex.key}:retry`, isRetry: true }];
  return {
    ...state,
    queue,
    outcomes,
    feedback: { correct },
    mistakes: alreadyMissed ? state.mistakes : [...state.mistakes, ex],
    drops: state.mode === "lesson" ? Math.max(0, state.drops - 1) : state.drops,
  };
}

export function next(state: SessionState): SessionState {
  if (!state.feedback) return state;
  if (state.mode === "lesson" && state.drops <= 0 && !state.feedback.correct) {
    return { ...state, feedback: null, status: "failed" };
  }
  const index = state.index + 1;
  return {
    ...state,
    index,
    feedback: null,
    status: index >= state.queue.length ? "complete" : "playing",
  };
}

/** Share of exercises answered correctly on the first try, 0–1. */
export function accuracy(state: SessionState): number {
  return state.baseCount === 0 ? 1 : state.firstTryCorrect / state.baseCount;
}

/** Progress bar value 0–1 over the current queue, including re-queued retries. */
export function progressValue(state: SessionState): number {
  if (state.status === "complete") return 1;
  const done = state.index + (state.feedback ? 1 : 0);
  return Math.min(1, done / state.queue.length);
}

export const XP = { lesson: 10, perfectBonus: 5, review: 5 } as const;

export function xpFor(state: SessionState): number {
  if (state.mode === "review") return XP.review;
  return XP.lesson + (state.mistakes.length === 0 ? XP.perfectBonus : 0);
}
