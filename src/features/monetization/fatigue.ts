/**
 * Pure Shadow Fatigue math (ARCHITECTURE.md §6/§7).
 * No React — unit-testable decay and clamp logic.
 */

export function clampFatigue(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

/** How much fatigue decays over `elapsedMs` at `decayPerHour`. */
export function offlineDecayAmount(
  elapsedMs: number,
  decayPerHour: number,
): number {
  if (elapsedMs <= 0) return 0;
  return (elapsedMs / 3_600_000) * decayPerHour;
}

/** Apply camp offline decay; returns the new fatigue value. */
export function applyOfflineDecay(
  fatigue: number,
  lastClosedAt: number | null,
  nowMs: number,
  decayPerHour: number,
  max: number,
): number {
  if (lastClosedAt == null) return fatigue;
  const decay = offlineDecayAmount(nowMs - lastClosedAt, decayPerHour);
  return clampFatigue(fatigue - decay, max);
}

/** Fatigue after the Palantír channel bonus. */
export function palantirFatigueAfter(
  fatigue: number,
  reduction: number,
  max: number,
): number {
  return clampFatigue(fatigue - reduction, max);
}
