/**
 * Speech recognition placeholder.
 *
 * No free recogniser understands Wolof today, so speaking exercises are
 * self-checked. To add scoring later, implement `SpeechChecker` (for example
 * with a hosted Wolof ASR model) and return it from `getSpeechChecker()`;
 * the speak exercise already calls through this interface.
 */
export interface SpeechResult {
  transcript: string;
  /** 0–1 similarity to the expected phrase. */
  score: number;
}

export interface SpeechChecker {
  readonly available: boolean;
  listen(expected: string): Promise<SpeechResult>;
}

const unavailable: SpeechChecker = {
  available: false,
  listen: () => Promise.reject(new Error("Speech recognition is not available yet")),
};

export function getSpeechChecker(): SpeechChecker {
  return unavailable;
}
