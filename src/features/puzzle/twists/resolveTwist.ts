import type { Entity, Level, TwistId } from '../../../types';

/** Level twist wins; boss levels fall back to the entity twist. */
export function resolveLevelTwist(level: Level, entity?: Entity): TwistId | undefined {
  return level.twist ?? (level.isBoss ? entity?.twist : undefined);
}
