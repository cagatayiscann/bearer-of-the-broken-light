/**
 * Feel-based puzzle tuning. These numbers shape difficulty/pacing and are
 * expected to be hand-tuned on a real device (AGENTS.md: feel is human-validated).
 * Keep them here, never hardcoded in components.
 */
export const puzzleConfig = {
  timer: {
    /** Seconds granted on a timed (boss) trial. */
    baseSeconds: 60,
    /** Extra seconds when the player owns the Time-Slowing Crystal. */
    crystalBonusSeconds: 15,
  },
  /** Artifact whose effect adds time on timed trials. */
  timeBonusArtifactId: 'time-slowing-crystal',
  companion: {
    /** Companion Boosts allowed per puzzle (GAME_DESIGN.md §8: help is limited). */
    boostsPerPuzzle: 1,
  },
  wheel: {
    /** Shuffle is a calm-flow comfort tool — no per-puzzle cap in the slice. */
    shuffleEnabled: true,
  },
  juice: {
    flashDurationMs: 900,
    cellPopMs: 420,
    previewPulseMs: 280,
  },
  darkness: {
    /** Extra touch padding around each cell for braille-style reading. */
    touchPadding: 6,
  },
} as const;
