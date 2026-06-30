/**
 * Pure level-progression logic (no React, fully testable).
 *
 * An entity is played as an ordered sequence: the boss trial first (Layer A),
 * then its relaxed levels (Layer B) — see GAME_DESIGN.md §5. A level unlocks
 * once the previous one in the sequence is complete. This is the spine of the
 * "grind loop" and must be verifiable without a device.
 */
import type { Entity } from '../../types';

/** Ordered level ids for an entity: boss first, then the relaxed levels. */
export function entityLevelSequence(entity: Entity): string[] {
  return [entity.bossLevelId, ...entity.levelIds];
}

/** The first level is always open; later ones need the previous one completed. */
export function isLevelUnlocked(
  sequence: string[],
  completedLevelIds: string[],
  levelId: string,
): boolean {
  const idx = sequence.indexOf(levelId);
  if (idx < 0) return false;
  if (idx === 0) return true;
  return completedLevelIds.includes(sequence[idx - 1]);
}

/** The next level after `levelId`, or null if it's the last in the sequence. */
export function nextLevelId(sequence: string[], levelId: string): string | null {
  const idx = sequence.indexOf(levelId);
  if (idx < 0 || idx + 1 >= sequence.length) return null;
  return sequence[idx + 1];
}

export interface LevelProgress {
  levelId: string;
  /** 0-based position in the entity sequence. */
  index: number;
  isBoss: boolean;
  completed: boolean;
  unlocked: boolean;
}

/** Full per-level status for an entity, ready for the UI to render. */
export function entityProgress(entity: Entity, completedLevelIds: string[]): LevelProgress[] {
  const sequence = entityLevelSequence(entity);
  return sequence.map((levelId, index) => ({
    levelId,
    index,
    isBoss: levelId === entity.bossLevelId,
    completed: completedLevelIds.includes(levelId),
    unlocked: isLevelUnlocked(sequence, completedLevelIds, levelId),
  }));
}

/** How many of an entity's levels are complete. */
export function completedCount(entity: Entity, completedLevelIds: string[]): number {
  return entityLevelSequence(entity).filter((id) => completedLevelIds.includes(id)).length;
}
