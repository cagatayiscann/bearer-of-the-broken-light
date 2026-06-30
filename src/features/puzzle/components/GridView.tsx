import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../ui/components';
import { colors, radius } from '../../../ui/theme';
import { keyOf, revealedCellKeys, type GridLayout } from '../engine/layout';

/**
 * Renders the crossword grid produced by the pure layout engine.
 * Cells belonging to found words show their letter; the rest are blank slots.
 * Purely presentational — all layout math comes from `engine/layout`.
 */
export function GridView({
  layout,
  foundWords,
  hintCells,
  maxWidth,
}: {
  layout: GridLayout;
  foundWords: string[];
  /** Cell keys revealed by a Companion Boost (shown but not yet "found"). */
  hintCells?: string[];
  /** Available horizontal space; tiles are sized to fit within it. */
  maxWidth: number;
}) {
  const revealed = React.useMemo(
    () => revealedCellKeys(layout, foundWords),
    [layout, foundWords],
  );

  const hinted = React.useMemo(() => new Set(hintCells ?? []), [hintCells]);

  // Map occupied cells for O(1) lookup while rendering the rectangle.
  const cellLetters = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const c of layout.cells) m.set(keyOf(c.row, c.col), c.letter);
    return m;
  }, [layout]);

  if (layout.cols === 0 || layout.rows === 0) return null;

  const gap = 4;
  const tile = Math.floor((maxWidth - gap * (layout.cols - 1)) / layout.cols);
  const size = Math.max(18, Math.min(tile, 52));

  return (
    <View style={styles.grid}>
      {Array.from({ length: layout.rows }).map((_, row) => (
        <View key={row} style={[styles.row, { gap }]}>
          {Array.from({ length: layout.cols }).map((_, col) => {
            const key = keyOf(row, col);
            const letter = cellLetters.get(key);
            if (!letter) {
              return <View key={col} style={{ width: size, height: size }} />;
            }
            const isRevealed = revealed.has(key);
            const isHint = !isRevealed && hinted.has(key);
            return (
              <View
                key={col}
                style={[
                  styles.cell,
                  { width: size, height: size },
                  isRevealed && styles.cellRevealed,
                  isHint && styles.cellHint,
                ]}
              >
                {(isRevealed || isHint) && (
                  <AppText
                    style={[
                      styles.letter,
                      isHint && styles.letterHint,
                      { fontSize: size * 0.5 },
                    ]}
                  >
                    {letter}
                  </AppText>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: {
    marginVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellRevealed: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.accent,
  },
  cellHint: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
  },
  letter: { color: colors.accentSoft, fontWeight: '800' },
  letterHint: { color: colors.textMuted },
});
