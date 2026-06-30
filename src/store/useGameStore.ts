import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createCompanionSlice, type CompanionSlice } from './slices/companionSlice';
import { createFatigueSlice, type FatigueSlice } from './slices/fatigueSlice';
import { createInventorySlice, type InventorySlice } from './slices/inventorySlice';
import { createProgressSlice, type ProgressSlice } from './slices/progressSlice';
import { createPuzzleSlice, type PuzzleSlice } from './slices/puzzleSlice';
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice';

export type RootStore = ProgressSlice &
  InventorySlice &
  CompanionSlice &
  FatigueSlice &
  SettingsSlice &
  PuzzleSlice;

export const useGameStore = create<RootStore>()(
  persist(
    (...a) => ({
      ...createProgressSlice(...a),
      ...createInventorySlice(...a),
      ...createCompanionSlice(...a),
      ...createFatigueSlice(...a),
      ...createSettingsSlice(...a),
      ...createPuzzleSlice(...a),
    }),
    {
      name: 'bbl-save-v2',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist progression/economy/settings; never persist transient puzzle state.
      partialize: (s) => ({
        currentThemeId: s.currentThemeId,
        currentEntityId: s.currentEntityId,
        completedLevelIds: s.completedLevelIds,
        revealedNodeIds: s.revealedNodeIds,
        coins: s.coins,
        shards: s.shards,
        artifactIds: s.artifactIds,
        unlockedCompanionIds: s.unlockedCompanionIds,
        activeCompanionIds: s.activeCompanionIds,
        fatigue: s.fatigue,
        lastClosedAt: s.lastClosedAt,
        musicEnabled: s.musicEnabled,
        sfxEnabled: s.sfxEnabled,
        colorBlindCues: s.colorBlindCues,
        adsRemoved: s.adsRemoved,
      }),
    },
  ),
);
