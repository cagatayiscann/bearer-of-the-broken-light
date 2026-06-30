import type { StateCreator } from 'zustand';
import type { RootStore } from '../useGameStore';

/** Max companions active at once (see GAME_DESIGN.md §8). */
export const MAX_ACTIVE_COMPANIONS = 2;

export interface CompanionSlice {
  unlockedCompanionIds: string[];
  activeCompanionIds: string[];

  unlockCompanion: (id: string) => void;
  setCompanionActive: (id: string, active: boolean) => boolean;
}

export const createCompanionSlice: StateCreator<RootStore, [], [], CompanionSlice> = (
  set,
  get,
) => ({
  unlockedCompanionIds: [],
  activeCompanionIds: [],

  unlockCompanion: (id) =>
    set((s) => ({
      unlockedCompanionIds: s.unlockedCompanionIds.includes(id)
        ? s.unlockedCompanionIds
        : [...s.unlockedCompanionIds, id],
    })),

  /** Returns false if activating would exceed the active cap. */
  setCompanionActive: (id, active) => {
    const { activeCompanionIds } = get();
    if (active) {
      if (activeCompanionIds.includes(id)) return true;
      if (activeCompanionIds.length >= MAX_ACTIVE_COMPANIONS) return false;
      set({ activeCompanionIds: [...activeCompanionIds, id] });
      return true;
    }
    set({ activeCompanionIds: activeCompanionIds.filter((c) => c !== id) });
    return true;
  },
});
