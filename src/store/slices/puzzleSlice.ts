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

  startPuzzle: (levelId: string, timeRemaining?: number | null) => void;
  addFoundWord: (word: string) => void;
  setTimeRemaining: (seconds: number | null) => void;
  endPuzzle: () => void;
}

export const createPuzzleSlice: StateCreator<RootStore, [], [], PuzzleSlice> = (set) => ({
  activeLevelId: null,
  foundWords: [],
  timeRemaining: null,

  startPuzzle: (levelId, timeRemaining = null) =>
    set({ activeLevelId: levelId, foundWords: [], timeRemaining }),

  addFoundWord: (word) =>
    set((s) => ({
      foundWords: s.foundWords.includes(word) ? s.foundWords : [...s.foundWords, word],
    })),

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  endPuzzle: () => set({ activeLevelId: null, foundWords: [], timeRemaining: null }),
});
