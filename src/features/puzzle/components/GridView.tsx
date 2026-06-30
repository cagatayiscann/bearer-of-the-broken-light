import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '../../../ui/components';
import { colors, radius } from '../../../ui/theme';
import { puzzleConfig } from '../config';
import { keyOf, revealedCellKeys, type GridLayout } from '../engine/layout';

/**
 * Renders the crossword grid produced by the pure layout engine.
 * Cells belonging to found words show their letter; the rest are blank slots.
 * Newly revealed cells get a short scale "pop" (GAME_DESIGN.md §10 juice).
 */
export function GridView({
  layout,
  foundWords,
  hintCells,
  maxWidth,
}: {
  layout: GridLayout;
  foundWords: string[];
  hintCells?: string[];
  maxWidth: number;
}) {
  const revealed = React.useMemo(
    () => revealedCellKeys(layout, foundWords),
    [layout, foundWords],
  );

  const hinted = React.useMemo(() => new Set(hintCells ?? []), [hintCells]);

  const cellLetters = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const c of layout.cells) m.set(keyOf(c.row, c.col), c.letter);
    return m;
  }, [layout]);

  // Track which cells just became visible so we can pulse them once.
  const prevRevealed = React.useRef<Set<string>>(new Set());
  const [pulsing, setPulsing] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    const fresh = new Set<string>();
    for (const k of revealed) {
      if (!prevRevealed.current.has(k)) fresh.add(k);
    }
    prevRevealed.current = revealed;
    if (fresh.size === 0) return;
    setPulsing(fresh);
    const id = setTimeout(() => setPulsing(new Set()), puzzleConfig.juice.cellPopMs);
    return () => clearTimeout(id);
  }, [revealed]);

  if (layout.cols === 0 || layout.rows === 0) return null;

  const gap = 5;
  const tile = Math.floor((maxWidth - gap * (layout.cols - 1)) / layout.cols);
  const size = Math.max(18, Math.min(tile, 52));

  return (
    <View style={styles.grid}>
      {Array.from({ length: layout.rows }).map((_, row) => (
        <View key={row} style={[styles.row, { gap }]}>
          {Array.from({ length: layout.cols }).map((_, col) => {
            const cellKey = keyOf(row, col);
            const letter = cellLetters.get(cellKey);
            if (!letter) {
              return <View key={col} style={{ width: size, height: size }} />;
            }
            const isRevealed = revealed.has(cellKey);
            const isHint = !isRevealed && hinted.has(cellKey);
            return (
              <GridCell
                key={col}
                size={size}
                letter={letter}
                isRevealed={isRevealed}
                isHint={isHint}
                pulse={pulsing.has(cellKey)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function GridCell({
  size,
  letter,
  isRevealed,
  isHint,
  pulse,
}: {
  size: number;
  letter: string;
  isRevealed: boolean;
  isHint: boolean;
  pulse: boolean;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (!pulse) return;
    scale.value = withSequence(
      withSpring(1.18, { damping: 9, stiffness: 320 }),
      withSpring(1, { damping: 14, stiffness: 260 }),
    );
  }, [pulse, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.cell,
        { width: size, height: size, borderRadius: size * 0.18 },
        isRevealed && styles.cellRevealed,
        isHint && styles.cellHint,
        animStyle,
      ]}
    >
      {(isRevealed || isHint) && (
        <AppText
          style={[styles.letter, isHint && styles.letterHint, { fontSize: size * 0.48 }]}
        >
          {letter}
        </AppText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: {
    marginVertical: 1,
    backgroundColor: colors.puzzleCellEmpty,
    borderWidth: 1.5,
    borderColor: colors.puzzleGoldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cellRevealed: {
    backgroundColor: colors.puzzleCellRevealed,
    borderColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  cellHint: {
    backgroundColor: colors.puzzleCellRevealed,
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
  },
  letter: { color: colors.accentSoft, fontWeight: '800' },
  letterHint: { color: colors.textMuted },
});
