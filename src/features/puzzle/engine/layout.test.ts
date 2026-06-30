import { generateLayout, keyOf, revealedCellKeys, toGridSpec } from './layout';
import type { LayoutCell } from './layout';

/** Build a quick lookup of "row,col" -> letter for assertions. */
function cellMap(cells: LayoutCell[]): Map<string, string> {
  return new Map(cells.map((c) => [`${c.row},${c.col}`, c.letter]));
}

describe('generateLayout', () => {
  it('returns an empty layout for no words', () => {
    const layout = generateLayout([]);
    expect(layout).toEqual({ rows: 0, cols: 0, placements: [], cells: [], unplaced: [] });
  });

  it('places a single word horizontally at the origin', () => {
    const layout = generateLayout(['ROOT']);
    expect(layout.rows).toBe(1);
    expect(layout.cols).toBe(4);
    expect(layout.placements).toEqual([
      { word: 'ROOT', row: 0, col: 0, direction: 'across' },
    ]);
  });

  it('normalizes and uppercases words', () => {
    const layout = generateLayout([' root ']);
    expect(layout.placements[0].word).toBe('ROOT');
  });

  it('intersects two words on a shared letter', () => {
    const layout = generateLayout(['ROOT', 'MOSS']);
    // Both words should be placed (MOSS shares O with ROOT).
    expect(layout.unplaced).toHaveLength(0);
    expect(layout.placements).toHaveLength(2);
    const dirs = layout.placements.map((p) => p.direction).sort();
    expect(dirs).toEqual(['across', 'down']);
  });

  it('keeps overlapping cells letter-consistent (no contradictions)', () => {
    const layout = generateLayout(['ROOT', 'MOSS', 'TOME', 'STORM', 'MOTOR']);
    const map = cellMap(layout.cells);
    // Every placement must agree with the shared cell map.
    for (const p of layout.placements) {
      const dr = p.direction === 'down' ? 1 : 0;
      const dc = p.direction === 'across' ? 1 : 0;
      for (let i = 0; i < p.word.length; i++) {
        const key = `${p.row + dr * i},${p.col + dc * i}`;
        expect(map.get(key)).toBe(p.word[i]);
      }
    }
  });

  it('normalizes coordinates so the grid starts at (0,0)', () => {
    const layout = generateLayout(['ROOT', 'MOSS', 'TOME', 'STORM', 'MOTOR']);
    const minRow = Math.min(...layout.cells.map((c) => c.row));
    const minCol = Math.min(...layout.cells.map((c) => c.col));
    expect(minRow).toBe(0);
    expect(minCol).toBe(0);
    expect(layout.cells.every((c) => c.row < layout.rows && c.col < layout.cols)).toBe(true);
  });

  it('is deterministic for the same input', () => {
    const a = generateLayout(['STORM', 'MOTOR', 'ROOT', 'MOSS', 'TOME']);
    const b = generateLayout(['STORM', 'MOTOR', 'ROOT', 'MOSS', 'TOME']);
    expect(a.placements).toEqual(b.placements);
  });

  it('reports words it cannot intersect rather than dropping them silently', () => {
    // "XYZ" shares no letter with "ROOT", so it cannot be intersected.
    const layout = generateLayout(['ROOT', 'XYZ']);
    expect(layout.unplaced).toContain('XYZ');
    expect(layout.placements).toHaveLength(1);
  });

  it('reveals only the cells of found words', () => {
    const layout = generateLayout(['ROOT', 'MOSS']);
    const none = revealedCellKeys(layout, []);
    expect(none.size).toBe(0);

    const rootPlacement = layout.placements.find((p) => p.word === 'ROOT')!;
    const revealed = revealedCellKeys(layout, ['root']);
    expect(revealed.size).toBe(4);
    const dr = rootPlacement.direction === 'down' ? 1 : 0;
    const dc = rootPlacement.direction === 'across' ? 1 : 0;
    for (let i = 0; i < 4; i++) {
      expect(revealed.has(keyOf(rootPlacement.row + dr * i, rootPlacement.col + dc * i))).toBe(true);
    }
  });

  it('toGridSpec mirrors the layout dimensions and placements', () => {
    const layout = generateLayout(['ROOT', 'MOSS']);
    const spec = toGridSpec(['ROOT', 'MOSS']);
    expect(spec).toEqual({
      rows: layout.rows,
      cols: layout.cols,
      placements: layout.placements,
    });
  });
});
