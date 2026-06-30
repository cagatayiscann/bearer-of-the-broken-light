import { pickHintCells } from './hints';
import { generateLayout, keyOf, revealedCellKeys } from './layout';

describe('pickHintCells', () => {
  const layout = generateLayout(['ROOT', 'MOSS', 'TOME', 'STORM', 'MOTOR']);
  const words = ['ROOT', 'MOSS', 'TOME', 'STORM', 'MOTOR'];

  it('returns nothing when count is zero or negative', () => {
    expect(pickHintCells(layout, [], [], 0)).toEqual([]);
    expect(pickHintCells(layout, [], [], -1)).toEqual([]);
  });

  it('reveals a cell of an unfound word', () => {
    const picks = pickHintCells(layout, [], [], 1);
    expect(picks).toHaveLength(1);
    // The pick must correspond to a real occupied cell.
    const occupied = new Set(layout.cells.map((c) => keyOf(c.row, c.col)));
    expect(occupied.has(picks[0])).toBe(true);
  });

  it('never re-picks a cell already shown by a found word', () => {
    const revealed = revealedCellKeys(layout, ['ROOT']);
    const picks = pickHintCells(layout, ['ROOT'], [], 3);
    for (const k of picks) {
      expect(revealed.has(k)).toBe(false);
    }
  });

  it('never re-picks an existing hint cell', () => {
    const first = pickHintCells(layout, [], [], 1);
    const second = pickHintCells(layout, [], first, 1);
    expect(second[0]).not.toBe(first[0]);
  });

  it('spreads hints across different unfound words', () => {
    // Two distinct words -> two hints should touch two different words.
    const picks = pickHintCells(layout, [], [], 2);
    expect(new Set(picks).size).toBe(2);
  });

  it('returns no more than the available unshown cells', () => {
    // Everything found -> nothing left to hint.
    const picks = pickHintCells(layout, words, [], 5);
    expect(picks).toEqual([]);
  });
});
