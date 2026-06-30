import type { StateCreator } from 'zustand';
import type { RootStore } from '../useGameStore';

/**
 * Transient state for the puzzle currently being played.
 * NOT persisted — it is rebuilt from level data on entry (see ARCHITECTURE.md §4).
 */
export interface PuzzleSlice {
  activeLevelId: string | null;
  foundWords: string[];
  /** Seconds remaining for timed twists; null when no timer is active. */
  timeRemaining: number | null;
  /** Grid cells revealed by a Companion Boost hint (cell keys "row,col"). */
  hintCells: string[];
  /** How many Companion Boosts have been spent this puzzle. */
  boostsUsed: number;

  startPuzzle: (levelId: string, timeRemaining?: number | null) => void;
  addFoundWord: (word: string) => void;
  setTimeRemaining: (seconds: number | null) => void;
  revealHintCells: (keys: string[]) => void;
  useBoost: () => void;
  endPuzzle: () => void;
}

export const createPuzzleSlice: StateCreator<RootStore, [], [], PuzzleSlice> = (set) => ({
  activeLevelId: null,
  foundWords: [],
  timeRemaining: null,
  hintCells: [],
  boostsUsed: 0,

  startPuzzle: (levelId, timeRemaining = null) =>
    set({ activeLevelId: levelId, foundWords: [], timeRemaining, hintCells: [], boostsUsed: 0 }),

  addFoundWord: (word) =>
    set((s) => ({
      foundWords: s.foundWords.includes(word) ? s.foundWords : [...s.foundWords, word],
    })),

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  revealHintCells: (keys) =>
    set((s) => ({
      hintCells: [...s.hintCells, ...keys.filter((k) => !s.hintCells.includes(k))],
    })),

  useBoost: () => set((s) => ({ boostsUsed: s.boostsUsed + 1 })),

  endPuzzle: () =>
    set({ activeLevelId: null, foundWords: [], timeRemaining: null, hintCells: [], boostsUsed: 0 }),
});
