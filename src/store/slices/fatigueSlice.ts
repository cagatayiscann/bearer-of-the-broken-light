import type { StateCreator } from 'zustand';

import { monetizationConfig } from '../../features/monetization/config';
import { applyOfflineDecay as computeDecay, clampFatigue } from '../../features/monetization/fatigue';
import type { RootStore } from '../useGameStore';

/**
 * Shadow Fatigue. IMPORTANT (see GAME_DESIGN.md §9): this gates BONUSES,
 * it is never a punishment. Lower it via the Palantír (rewarded ad),
 * offline camp decay, or daily rituals.
 */
export interface FatigueSlice {
  fatigue: number;
  /** Epoch ms when the app was last backgrounded/closed. */
  lastClosedAt: number | null;

  addFatigue: (n: number) => void;
  reduceFatigue: (n: number) => void;
  /** Apply offline camp decay based on elapsed real time. */
  applyOfflineDecay: (nowMs?: number) => void;
  markClosed: (nowMs?: number) => void;
}

const FATIGUE_MAX = monetizationConfig.fatigue.max;

export const createFatigueSlice: StateCreator<RootStore, [], [], FatigueSlice> = (set) => ({
  fatigue: 0,
  lastClosedAt: null,

  addFatigue: (n) =>
    set((s) => ({ fatigue: clampFatigue(s.fatigue + n, FATIGUE_MAX) })),

  reduceFatigue: (n) =>
    set((s) => ({ fatigue: clampFatigue(s.fatigue - n, FATIGUE_MAX) })),

  applyOfflineDecay: (nowMs = Date.now()) =>
    set((s) => {
      const fatigue = computeDecay(
        s.fatigue,
        s.lastClosedAt,
        nowMs,
        monetizationConfig.fatigue.decayPerHour,
        FATIGUE_MAX,
      );
      if (fatigue === s.fatigue && s.lastClosedAt != null) {
        return { fatigue, lastClosedAt: null };
      }
      if (s.lastClosedAt == null) return {};
      return { fatigue, lastClosedAt: null };
    }),

  markClosed: (nowMs = Date.now()) => set({ lastClosedAt: nowMs }),
});

// Re-export for existing imports (RewardScreen, etc.).
export const FATIGUE_PER_LEVEL = monetizationConfig.fatigue.perLevel;
export { FATIGUE_MAX };
