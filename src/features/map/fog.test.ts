import type { Entity, Theme } from '../../types';
import {
  buildMapNodes,
  computeRevealedNodes,
  isEntityComplete,
  isThemeUnlocked,
  nodeVisualState,
} from './fog';

const themes: Theme[] = [
  { id: 't1', name: 'Theme 1', order: 0, entityIds: ['e1', 'e2'] },
  { id: 't2', name: 'Theme 2', order: 1, entityIds: ['e3'], unlockAfterThemeId: 't1' },
];

const entities: Entity[] = [
  { id: 'e1', themeId: 't1', name: 'One', bossLevelId: 'b1', levelIds: ['l1'] },
  { id: 'e2', themeId: 't1', name: 'Two', bossLevelId: 'b2', levelIds: ['l2'] },
  { id: 'e3', themeId: 't2', name: 'Three', bossLevelId: 'b3', levelIds: ['l3'] },
];

describe('buildMapNodes', () => {
  it('orders entities by theme then entityIds', () => {
    expect(buildMapNodes(themes, entities).map((n) => n.id)).toEqual(['e1', 'e2', 'e3']);
  });
});

describe('computeRevealedNodes', () => {
  const nodes = buildMapNodes(themes, entities);

  it('reveals only the first node on a fresh save', () => {
    expect(computeRevealedNodes(nodes, themes, entities, [], [])).toEqual(['e1']);
  });

  it('reveals the next node when the previous entity is complete', () => {
    const done = ['b1', 'l1'];
    expect(computeRevealedNodes(nodes, themes, entities, done, ['e1'])).toContain('e2');
  });

  it('does not reveal theme 2 until theme 1 is fully cleared', () => {
    const partial = ['b1', 'l1'];
    const revealed = computeRevealedNodes(nodes, themes, entities, partial, ['e1', 'e2']);
    expect(revealed).not.toContain('e3');
  });

  it('reveals theme 2 first node when theme 1 is complete', () => {
    const allT1 = ['b1', 'l1', 'b2', 'l2'];
    const revealed = computeRevealedNodes(nodes, themes, entities, allT1, ['e1', 'e2']);
    expect(revealed).toContain('e3');
  });
});

describe('nodeVisualState', () => {
  const nodes = buildMapNodes(themes, entities);

  it('returns fogged for unrevealed nodes', () => {
    expect(nodeVisualState(nodes[1], [], entities[1], [])).toBe('fogged');
  });

  it('returns active for revealed but incomplete nodes', () => {
    expect(nodeVisualState(nodes[0], ['e1'], entities[0], [])).toBe('active');
  });

  it('returns complete for finished entities', () => {
    expect(nodeVisualState(nodes[0], ['e1'], entities[0], ['b1', 'l1'])).toBe('complete');
  });
});

describe('isThemeUnlocked', () => {
  it('locks a theme until the previous one is cleared', () => {
    expect(isThemeUnlocked(themes[1], themes, entities, [])).toBe(false);
    expect(isThemeUnlocked(themes[1], themes, entities, ['b1', 'l1', 'b2', 'l2'])).toBe(true);
  });
});

describe('isEntityComplete', () => {
  it('is true only when every level in the sequence is done', () => {
    expect(isEntityComplete(entities[0], ['b1'])).toBe(false);
    expect(isEntityComplete(entities[0], ['b1', 'l1'])).toBe(true);
  });
});
