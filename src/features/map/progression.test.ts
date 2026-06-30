import type { Entity } from '../../types';
import {
  completedCount,
  entityLevelSequence,
  entityProgress,
  isLevelUnlocked,
  nextLevelId,
} from './progression';

const entity: Entity = {
  id: 'e',
  themeId: 't',
  name: 'Test Entity',
  bossLevelId: 'boss',
  levelIds: ['relaxed-1', 'relaxed-2'],
};

describe('entityLevelSequence', () => {
  it('puts the boss first, then relaxed levels', () => {
    expect(entityLevelSequence(entity)).toEqual(['boss', 'relaxed-1', 'relaxed-2']);
  });
});

describe('isLevelUnlocked', () => {
  const seq = entityLevelSequence(entity);

  it('always unlocks the first level', () => {
    expect(isLevelUnlocked(seq, [], 'boss')).toBe(true);
  });

  it('locks a later level until the previous is complete', () => {
    expect(isLevelUnlocked(seq, [], 'relaxed-1')).toBe(false);
    expect(isLevelUnlocked(seq, ['boss'], 'relaxed-1')).toBe(true);
  });

  it('locks the third until the second is complete', () => {
    expect(isLevelUnlocked(seq, ['boss'], 'relaxed-2')).toBe(false);
    expect(isLevelUnlocked(seq, ['boss', 'relaxed-1'], 'relaxed-2')).toBe(true);
  });

  it('returns false for an unknown level', () => {
    expect(isLevelUnlocked(seq, ['boss'], 'ghost')).toBe(false);
  });
});

describe('nextLevelId', () => {
  const seq = entityLevelSequence(entity);

  it('returns the following level', () => {
    expect(nextLevelId(seq, 'boss')).toBe('relaxed-1');
    expect(nextLevelId(seq, 'relaxed-1')).toBe('relaxed-2');
  });

  it('returns null after the last level', () => {
    expect(nextLevelId(seq, 'relaxed-2')).toBeNull();
  });

  it('returns null for an unknown level', () => {
    expect(nextLevelId(seq, 'ghost')).toBeNull();
  });
});

describe('entityProgress', () => {
  it('marks completion and unlock per level', () => {
    const progress = entityProgress(entity, ['boss']);
    expect(progress).toEqual([
      { levelId: 'boss', index: 0, isBoss: true, completed: true, unlocked: true },
      { levelId: 'relaxed-1', index: 1, isBoss: false, completed: false, unlocked: true },
      { levelId: 'relaxed-2', index: 2, isBoss: false, completed: false, unlocked: false },
    ]);
  });
});

describe('completedCount', () => {
  it('counts completed levels in the sequence', () => {
    expect(completedCount(entity, [])).toBe(0);
    expect(completedCount(entity, ['boss', 'relaxed-1'])).toBe(2);
    // Ignores ids outside the sequence.
    expect(completedCount(entity, ['boss', 'other'])).toBe(1);
  });
});
