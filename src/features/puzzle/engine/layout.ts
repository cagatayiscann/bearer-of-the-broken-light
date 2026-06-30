/**
 * Pure crossword layout generator (ARCHITECTURE.md §6).
 * Takes a level's word list (DATA) and arranges the words into an intersecting
 * crossword grid — no React, fully deterministic, fully unit-testable.
 *
 * Determinism matters: same input -> same layout, so tests are stable and a
 * level always looks identical across runs/devices.
 */
import type { GridSpec, WordPlacement } from '../../../types';
import { normalizeWord } from './wordGrid';

export type Direction = 'across' | 'down';

/** A single occupied grid cell after layout. */
export interface LayoutCell {
  row: number;
  col: number;
  letter: string;
}

export interface GridLayout {
  rows: number;
  cols: number;
  placements: WordPlacement[];
  cells: LayoutCell[];
  /** Words that could not be intersected into the grid (ideally empty). */
  unplaced: string[];
}

interface InternalPlacement {
  word: string;
  row: number;
  col: number;
  direction: Direction;
}

const step = (dir: Direction) => (dir === 'across' ? { dr: 0, dc: 1 } : { dr: 1, dc: 0 });
const perpendicular = (dir: Direction): Direction => (dir === 'across' ? 'down' : 'across');

const cellKey = (row: number, col: number) => `${row},${col}`;

/**
 * Generate a crossword layout from a word list.
 *
 * Strategy: place the longest word first, then greedily intersect each
 * remaining word on a shared letter using standard crossword legality rules
 * (no run-on words, no accidental side-by-side parallels).
 */
export function generateLayout(words: string[]): GridLayout {
  const cleaned = words
    .map(normalizeWord)
    .filter((w) => w.length > 0)
    // Longest first, then alphabetical -> deterministic ordering.
    .sort((a, b) => b.length - a.length || a.localeCompare(b));

  const grid = new Map<string, string>();
  const placements: InternalPlacement[] = [];
  const unplaced: string[] = [];

  if (cleaned.length === 0) {
    return { rows: 0, cols: 0, placements: [], cells: [], unplaced: [] };
  }

  // Seed: first word placed horizontally at the origin.
  place(grid, placements, { word: cleaned[0], row: 0, col: 0, direction: 'across' });

  for (let i = 1; i < cleaned.length; i++) {
    const word = cleaned[i];
    const spot = findIntersection(grid, placements, word);
    if (spot) {
      place(grid, placements, spot);
    } else {
      unplaced.push(word);
    }
  }

  return finalize(placements, unplaced);
}

function place(
  grid: Map<string, string>,
  placements: InternalPlacement[],
  p: InternalPlacement,
): void {
  const { dr, dc } = step(p.direction);
  for (let i = 0; i < p.word.length; i++) {
    grid.set(cellKey(p.row + dr * i, p.col + dc * i), p.word[i]);
  }
  placements.push(p);
}

/**
 * Find a legal placement that intersects the existing grid on a shared letter.
 * Returns the first legal candidate in deterministic scan order, or null.
 */
function findIntersection(
  grid: Map<string, string>,
  placements: InternalPlacement[],
  word: string,
): InternalPlacement | null {
  for (const placed of placements) {
    const { dr, dc } = step(placed.direction);
    const newDir = perpendicular(placed.direction);

    for (let pi = 0; pi < placed.word.length; pi++) {
      const anchorRow = placed.row + dr * pi;
      const anchorCol = placed.col + dc * pi;
      const anchorLetter = placed.word[pi];

      for (let wi = 0; wi < word.length; wi++) {
        if (word[wi] !== anchorLetter) continue;

        const { dr: ndr, dc: ndc } = step(newDir);
        const startRow = anchorRow - ndr * wi;
        const startCol = anchorCol - ndc * wi;
        const candidate: InternalPlacement = {
          word,
          row: startRow,
          col: startCol,
          direction: newDir,
        };
        if (canPlace(grid, candidate)) return candidate;
      }
    }
  }
  return null;
}

/** Standard crossword legality check for a candidate placement. */
function canPlace(grid: Map<string, string>, p: InternalPlacement): boolean {
  const { dr, dc } = step(p.direction);
  const { dr: pdr, dc: pdc } = step(perpendicular(p.direction));

  // Cell just before the word and just after must be empty (no run-on words).
  const beforeRow = p.row - dr;
  const beforeCol = p.col - dc;
  const afterRow = p.row + dr * p.word.length;
  const afterCol = p.col + dc * p.word.length;
  if (grid.has(cellKey(beforeRow, beforeCol))) return false;
  if (grid.has(cellKey(afterRow, afterCol))) return false;

  let intersections = 0;

  for (let i = 0; i < p.word.length; i++) {
    const r = p.row + dr * i;
    const c = p.col + dc * i;
    const existing = grid.get(cellKey(r, c));

    if (existing !== undefined) {
      // Overlap is only legal when letters match (a true intersection).
      if (existing !== p.word[i]) return false;
      intersections++;
    } else {
      // Empty cell: its perpendicular neighbours must be empty too, otherwise
      // we'd glue this word side-by-side to another and form junk words.
      if (grid.has(cellKey(r + pdr, c + pdc))) return false;
      if (grid.has(cellKey(r - pdr, c - pdc))) return false;
    }
  }

  // Must connect to the existing grid on at least one shared letter.
  return intersections >= 1;
}

/** Normalize coordinates to start at (0,0) and emit the public layout shape. */
function finalize(placements: InternalPlacement[], unplaced: string[]): GridLayout {
  let minRow = Infinity;
  let minCol = Infinity;
  let maxRow = -Infinity;
  let maxCol = -Infinity;

  const cellMap = new Map<string, LayoutCell>();
  for (const p of placements) {
    const { dr, dc } = step(p.direction);
    for (let i = 0; i < p.word.length; i++) {
      const row = p.row + dr * i;
      const col = p.col + dc * i;
      minRow = Math.min(minRow, row);
      minCol = Math.min(minCol, col);
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }
  }

  const shiftedPlacements: WordPlacement[] = placements.map((p) => ({
    word: p.word,
    row: p.row - minRow,
    col: p.col - minCol,
    direction: p.direction,
  }));

  for (const p of shiftedPlacements) {
    const { dr, dc } = step(p.direction);
    for (let i = 0; i < p.word.length; i++) {
      const row = p.row + dr * i;
      const col = p.col + dc * i;
      cellMap.set(cellKey(row, col), { row, col, letter: p.word[i] });
    }
  }

  return {
    rows: maxRow - minRow + 1,
    cols: maxCol - minCol + 1,
    placements: shiftedPlacements,
    cells: [...cellMap.values()].sort((a, b) => a.row - b.row || a.col - b.col),
    unplaced,
  };
}

/** Convenience: produce a GridSpec (the content-contract shape) from a word list. */
export function toGridSpec(words: string[]): GridSpec {
  const layout = generateLayout(words);
  return { rows: layout.rows, cols: layout.cols, placements: layout.placements };
}

/**
 * The set of "row,col" cell keys that should be shown filled, given the words
 * the player has already found. Pure so the UI can render reveal state without
 * any layout math of its own.
 */
export function revealedCellKeys(layout: GridLayout, foundWords: string[]): Set<string> {
  const found = new Set(foundWords.map(normalizeWord));
  const keys = new Set<string>();
  for (const p of layout.placements) {
    if (!found.has(normalizeWord(p.word))) continue;
    const { dr, dc } = step(p.direction);
    for (let i = 0; i < p.word.length; i++) {
      keys.add(cellKey(p.row + dr * i, p.col + dc * i));
    }
  }
  return keys;
}

/** Build a "row,col" key (exported to match revealedCellKeys output). */
export function keyOf(row: number, col: number): string {
  return cellKey(row, col);
}
