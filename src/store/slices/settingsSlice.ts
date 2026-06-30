import type { StateCreator } from 'zustand';
import type { RootStore } from '../useGameStore';

export interface SettingsSlice {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  /** Accessibility: use shape cues in addition to color (see GAME_DESIGN.md §10). */
  colorBlindCues: boolean;
  /** Set by the IAP "remove ads" purchase. */
  adsRemoved: boolean;

  toggleMusic: () => void;
  toggleSfx: () => void;
  toggleColorBlindCues: () => void;
  setAdsRemoved: (v: boolean) => void;
}

export const createSettingsSlice: StateCreator<RootStore, [], [], SettingsSlice> = (set) => ({
  musicEnabled: true,
  sfxEnabled: true,
  colorBlindCues: false,
  adsRemoved: false,

  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  toggleSfx: () => set((s) => ({ sfxEnabled: !s.sfxEnabled })),
  toggleColorBlindCues: () => set((s) => ({ colorBlindCues: !s.colorBlindCues })),
  setAdsRemoved: (v) => set({ adsRemoved: v }),
});
