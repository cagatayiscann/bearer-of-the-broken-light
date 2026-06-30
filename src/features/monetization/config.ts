/**
 * Monetization & Shadow Fatigue tuning (GAME_DESIGN.md §9).
 * Feel-based numbers live here — never hardcoded in screens.
 */
export const monetizationConfig = {
  fatigue: {
    max: 100,
    /** Added after each completed trial. */
    perLevel: 8,
    /** Offline camp decay per real hour while away. */
    decayPerHour: 12,
  },
  palantir: {
    /** Fatigue removed after a successful channel (rewarded ad or IAP bypass). */
    fatigueReduction: 40,
    /** Bonus shard granted on channel — the real retention hook. */
    shardReward: 1,
    /** Map shows a gentle nudge (not a block) at/above this level. */
    nudgeThreshold: 50,
  },
} as const;
