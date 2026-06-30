import { keyOf, type GridLayout } from '../engine/layout';

export interface DarknessGridMetrics {
  cellSize: number;
  gap: number;
  /** Vertical margin on each cell (GridView uses marginVertical: 1). */
  cellMarginY: number;
}

/**
 * Whether a grid cell should show its letter.
 * In darkness mode only found words, hints, and finger-lit cells reveal letters.
 */
export function shouldShowLetter(opts: {
  darkness: boolean;
  isRevealed: boolean;
  isHint: boolean;
  isLit: boolean;
}): boolean {
  if (opts.isRevealed || opts.isHint) return true;
  if (!opts.darkness) return false;
  return opts.isLit;
}

/**
 * Map a touch point (relative to the grid's top-left) to a cell key, or null.
 * Pure geometry — matches GridView row/col layout.
 */
export function cellAtPoint(
  layout: GridLayout,
  occupiedKeys: Set<string>,
  x: number,
  y: number,
  metrics: DarknessGridMetrics,
): string | null {
  const { cellSize, gap, cellMarginY } = metrics;
  const rowStride = cellSize + cellMarginY * 2;
  const colStride = cellSize + gap;

  const row = Math.floor(y / rowStride);
  const col = Math.floor(x / colStride);
  if (row < 0 || row >= layout.rows || col < 0 || col >= layout.cols) return null;

  const localX = x - col * colStride;
  const localY = y - row * rowStride;
  if (localX < 0 || localX > cellSize || localY < 0 || localY > cellSize) return null;

  const cellKey = keyOf(row, col);
  return occupiedKeys.has(cellKey) ? cellKey : null;
}
