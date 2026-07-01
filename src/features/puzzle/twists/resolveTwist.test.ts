import type { Entity, Level } from '../../../types';
import { resolveLevelTwist } from './resolveTwist';

describe('resolveLevelTwist', () => {
  const boss: Level = {
    id: 'boss',
    entityId: 'e1',
    isBoss: true,
    words: ['A'],
    twist: 'darkness',
  };
  const relaxed: Level = {
    id: 'r1',
    entityId: 'e1',
    isBoss: false,
    words: ['A'],
  };
  const entity: Entity = {
    id: 'e1',
    themeId: 't1',
    name: 'Wisp',
    bossLevelId: 'boss',
    levelIds: ['r1'],
    twist: 'darkness',
  };

  it('uses level twist when set', () => {
    expect(resolveLevelTwist(boss, entity)).toBe('darkness');
  });

  it('falls back to entity twist on boss levels without level twist', () => {
    expect(resolveLevelTwist({ ...boss, twist: undefined }, entity)).toBe('darkness');
  });

  it('returns undefined for relaxed levels without twist', () => {
    expect(resolveLevelTwist(relaxed, entity)).toBeUndefined();
  });
});
