import type { StateCreator } from 'zustand';
import type { RootStore } from '../useGameStore';

export interface ProgressSlice {
  currentThemeId: string | null;
  currentEntityId: string | null;
  /** Level ids the player has completed. */
  completedLevelIds: string[];
  /** Map node ids the player has revealed (un-fogged). */
  revealedNodeIds: string[];

  completeLevel: (levelId: string) => void;
  revealNode: (nodeId: string) => void;
  setCurrent: (themeId: string | null, entityId: string | null) => void;
  isLevelCompleted: (levelId: string) => boolean;
}

export const createProgressSlice: StateCreator<RootStore, [], [], ProgressSlice> = (
  set,
  get,
) => ({
  currentThemeId: null,
  currentEntityId: null,
  completedLevelIds: [],
  revealedNodeIds: [],

  completeLevel: (levelId) =>
    set((s) => ({
      completedLevelIds: s.completedLevelIds.includes(levelId)
        ? s.completedLevelIds
        : [...s.completedLevelIds, levelId],
    })),

  revealNode: (nodeId) =>
    set((s) => ({
      revealedNodeIds: s.revealedNodeIds.includes(nodeId)
        ? s.revealedNodeIds
        : [...s.revealedNodeIds, nodeId],
    })),

  setCurrent: (themeId, entityId) =>
    set({ currentThemeId: themeId, currentEntityId: entityId }),

  isLevelCompleted: (levelId) => get().completedLevelIds.includes(levelId),
});
