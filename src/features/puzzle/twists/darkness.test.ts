import { generateLayout } from '../engine/layout';
import { cellAtPoint, shouldShowLetter } from './darkness';

const metrics = { cellSize: 40, gap: 5, cellMarginY: 1 };

describe('shouldShowLetter', () => {
  it('always shows found and hinted cells', () => {
    expect(shouldShowLetter({ darkness: true, isRevealed: true, isHint: false, isLit: false })).toBe(
      true,
    );
    expect(shouldShowLetter({ darkness: true, isRevealed: false, isHint: true, isLit: false })).toBe(
      true,
    );
  });

  it('shows lit cells only in darkness mode', () => {
    expect(shouldShowLetter({ darkness: true, isRevealed: false, isHint: false, isLit: true })).toBe(
      true,
    );
    expect(shouldShowLetter({ darkness: false, isRevealed: false, isHint: false, isLit: true })).toBe(
      false,
    );
  });

  it('hides unknown cells in darkness until lit', () => {
    expect(shouldShowLetter({ darkness: true, isRevealed: false, isHint: false, isLit: false })).toBe(
      false,
    );
  });
});

describe('cellAtPoint', () => {
  const layout = generateLayout(['ROOT', 'ROT', 'TOO']);
  const occupied = new Set(layout.cells.map((c) => `${c.row},${c.col}`));

  it('returns null outside the grid', () => {
    expect(cellAtPoint(layout, occupied, -1, 0, metrics)).toBeNull();
    expect(cellAtPoint(layout, occupied, 9999, 9999, metrics)).toBeNull();
  });

  it('returns null for empty grid slots', () => {
    // Top-left empty padding cell if any — pick a coord in gap between letters if exists
    const empty = Array.from({ length: layout.rows }).flatMap((_, row) =>
      Array.from({ length: layout.cols }, (_, col) => {
        const key = `${row},${col}`;
        return occupied.has(key) ? null : { row, col };
      }),
    ).find(Boolean);
    if (!empty) return;
    const x = empty.col * (metrics.cellSize + metrics.gap) + metrics.cellSize / 2;
    const y = empty.row * (metrics.cellSize + metrics.cellMarginY * 2) + metrics.cellSize / 2;
    expect(cellAtPoint(layout, occupied, x, y, metrics)).toBeNull();
  });

  it('hits a letter cell at its center', () => {
    const cell = layout.cells[0];
    const x = cell.col * (metrics.cellSize + metrics.gap) + metrics.cellSize / 2;
    const y = cell.row * (metrics.cellSize + metrics.cellMarginY * 2) + metrics.cellSize / 2;
    expect(cellAtPoint(layout, occupied, x, y, metrics)).toBe(`${cell.row},${cell.col}`);
  });
});
