import type { StateCreator } from 'zustand';
import type { RootStore } from '../useGameStore';

/**
 * Shadow Fatigue. IMPORTANT (see GAME_DESIGN.md §9): this gates BONUSES,
 * it is never a punishment. Lower it via the Palantír (rewarded ad),
 * offline camp decay, or daily rituals.
 *
 * Tuning numbers live here on purpose so they are easy to balance.
 */
export const FATIGUE_MAX = 100;
export const FATIGUE_PER_LEVEL = 8;
export const FATIGUE_DECAY_PER_HOUR = 12; // offline camp decay

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

const clamp = (n: number) => Math.max(0, Math.min(FATIGUE_MAX, n));

export const createFatigueSlice: StateCreator<RootStore, [], [], FatigueSlice> = (set) => ({
  fatigue: 0,
  lastClosedAt: null,

  addFatigue: (n) => set((s) => ({ fatigue: clamp(s.fatigue + n) })),
  reduceFatigue: (n) => set((s) => ({ fatigue: clamp(s.fatigue - n) })),

  applyOfflineDecay: (nowMs = Date.now()) =>
    set((s) => {
      if (s.lastClosedAt == null) return {};
      const hours = (nowMs - s.lastClosedAt) / 3_600_000;
      if (hours <= 0) return {};
      const decay = hours * FATIGUE_DECAY_PER_HOUR;
      return { fatigue: clamp(s.fatigue - decay), lastClosedAt: null };
    }),

  markClosed: (nowMs = Date.now()) => set({ lastClosedAt: nowMs }),
});
