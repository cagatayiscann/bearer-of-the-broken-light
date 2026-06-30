/**
 * Pure, framework-free puzzle engine helpers (ARCHITECTURE.md §6).
 * No React here — these are unit-testable building blocks for the word grid.
 * The full grid layout/solver lands during the vertical slice.
 */

export function normalizeWord(word: string): string {
  return word.trim().toUpperCase();
}

/** A guess matches if it equals one of the (normalized) target words. */
export function isValidGuess(guess: string, words: string[]): boolean {
  const g = normalizeWord(guess);
  return words.some((w) => normalizeWord(w) === g);
}

/** True when every target word has been found. */
export function isPuzzleSolved(found: string[], words: string[]): boolean {
  const foundSet = new Set(found.map(normalizeWord));
  return words.every((w) => foundSet.has(normalizeWord(w)));
}

/**
 * Score = base per word + a speed bonus when time remains.
 * Kept here (not in UI) so it can be tuned and tested without a device.
 */
export function scorePuzzle(params: {
  wordCount: number;
  timeRemaining?: number | null;
}): number {
  const base = params.wordCount * 100;
  const speedBonus = params.timeRemaining && params.timeRemaining > 0 ? params.timeRemaining * 5 : 0;
  return base + speedBonus;
}
