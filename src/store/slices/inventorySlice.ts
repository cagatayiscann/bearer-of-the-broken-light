import type { StateCreator } from 'zustand';
import type { RootStore } from '../useGameStore';

export interface InventorySlice {
  coins: number;
  shards: number;
  artifactIds: string[];

  addCoins: (n: number) => void;
  addShards: (n: number) => void;
  grantArtifact: (artifactId: string) => void;
  hasArtifact: (artifactId: string) => boolean;
}

export const createInventorySlice: StateCreator<RootStore, [], [], InventorySlice> = (
  set,
  get,
) => ({
  coins: 0,
  shards: 0,
  artifactIds: [],

  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
  addShards: (n) => set((s) => ({ shards: s.shards + n })),

  grantArtifact: (artifactId) =>
    set((s) => ({
      artifactIds: s.artifactIds.includes(artifactId)
        ? s.artifactIds
        : [...s.artifactIds, artifactId],
    })),

  hasArtifact: (artifactId) => get().artifactIds.includes(artifactId),
});
