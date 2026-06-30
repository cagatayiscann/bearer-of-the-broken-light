/**
 * Pure hint logic for the Companion Boost (GAME_DESIGN.md §8).
 * Decides which grid cells to reveal as a hint — framework-free and testable,
 * so the "reveal a letter" help is deterministic and never crashes the UI.
 */
import { keyOf, revealedCellKeys, type GridLayout } from './layout';
import { normalizeWord } from './wordGrid';

const deltas = (direction: 'across' | 'down') =>
  direction === 'across' ? { dr: 0, dc: 1 } : { dr: 1, dc: 0 };

/**
 * Pick up to `count` cell keys to reveal as hints.
 *
 * A cell is eligible if it belongs to a word the player hasn't found yet and
 * isn't already visible (revealed by a found word or a prior hint). We spread
 * hints across different unfound words first so a single boost gives a wider
 * nudge rather than finishing one word.
 */
export function pickHintCells(
  layout: GridLayout,
  foundWords: string[],
  existingHints: string[],
  count: number,
): string[] {
  if (count <= 0) return [];

  const shown = new Set<string>([...revealedCellKeys(layout, foundWords), ...existingHints]);
  const found = new Set(foundWords.map(normalizeWord));

  const unfound = layout.placements.filter((p) => !found.has(normalizeWord(p.word)));

  const picks: string[] = [];
  // Round-robin one cell per unfound word until we hit `count` or run dry.
  let progressed = true;
  while (picks.length < count && progressed) {
    progressed = false;
    for (const p of unfound) {
      if (picks.length >= count) break;
      const { dr, dc } = deltas(p.direction);
      for (let i = 0; i < p.word.length; i++) {
        const key = keyOf(p.row + dr * i, p.col + dc * i);
        if (!shown.has(key)) {
          shown.add(key);
          picks.push(key);
          progressed = true;
          break;
        }
      }
    }
  }

  return picks;
}
