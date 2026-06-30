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
} as const;
