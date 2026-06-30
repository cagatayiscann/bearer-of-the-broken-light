/**
 * Pure letter-wheel logic (ARCHITECTURE.md §6).
 * In the World-of-Wonders mechanic the player connects letters on a wheel to
 * spell answer words. All of this is framework-free and unit-testable; the UI
 * only feeds it selected indices and renders the result.
 */
import { normalizeWord } from './wordGrid';

/** Multiset letter counts for a word, e.g. "MOSS" -> { M:1, O:1, S:2 }. */
function letterCounts(word: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ch of normalizeWord(word)) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  return counts;
}

/**
 * The minimal pool of letters that can spell EVERY answer word.
 * For each letter we take the max count needed by any single word, so the
 * wheel is guaranteed sufficient without being needlessly large.
 * Returned sorted for deterministic wheel layout (UI can re-shuffle for feel).
 */
export function deriveWheel(words: string[]): string[] {
  const max = new Map<string, number>();
  for (const word of words) {
    for (const [ch, n] of letterCounts(word)) {
      max.set(ch, Math.max(max.get(ch) ?? 0, n));
    }
  }
  const pool: string[] = [];
  for (const [ch, n] of max) {
    for (let i = 0; i < n; i++) pool.push(ch);
  }
  return pool.sort();
}

/** True if `word` can be spelled using the wheel's letters (each used once). */
export function canBuildFromWheel(word: string, wheel: string[]): boolean {
  const available = new Map<string, number>();
  for (const ch of wheel) available.set(ch, (available.get(ch) ?? 0) + 1);
  for (const [ch, n] of letterCounts(word)) {
    if ((available.get(ch) ?? 0) < n) return false;
  }
  return true;
}

/**
 * Build the current guess string from selected wheel indices.
 * Out-of-range indices are ignored so transient UI state can't crash logic.
 */
export function wordFromSelection(selection: number[], wheel: string[]): string {
  return selection
    .filter((i) => i >= 0 && i < wheel.length)
    .map((i) => wheel[i])
    .join('');
}

/**
 * Classify a built guess against the target words and what's already found.
 * Pure decision helper the UI uses to react to a finished swipe.
 */
export type GuessResult = 'valid' | 'duplicate' | 'invalid';

export function classifyGuess(
  guess: string,
  words: string[],
  found: string[],
): GuessResult {
  const g = normalizeWord(guess);
  const isTarget = words.some((w) => normalizeWord(w) === g);
  if (!isTarget) return 'invalid';
  const alreadyFound = found.some((w) => normalizeWord(w) === g);
  return alreadyFound ? 'duplicate' : 'valid';
}
