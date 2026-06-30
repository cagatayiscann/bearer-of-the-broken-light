import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '../../../ui/components';
import { colors } from '../../../ui/theme';
import { puzzleConfig } from '../config';
import { keyOf, revealedCellKeys, type GridLayout } from '../engine/layout';
import { cellAtPoint, shouldShowLetter } from '../twists/darkness';

const GAP = 5;
const CELL_MARGIN_Y = 1;

/**
 * Renders the crossword grid produced by the pure layout engine.
 * Cells belonging to found words show their letter; the rest are blank slots.
 * Newly revealed cells get a short scale "pop" (GAME_DESIGN.md §10 juice).
 *
 * With `darkness`, unfound letters hide until the player brushes the cell.
 */
export function GridView({
  layout,
  foundWords,
  hintCells,
  maxWidth,
  darkness,
}: {
  layout: GridLayout;
  foundWords: string[];
  hintCells?: string[];
  maxWidth: number;
  darkness?: boolean;
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

  const occupiedKeys = React.useMemo(() => new Set(cellLetters.keys()), [cellLetters]);

  const [litCells, setLitCells] = React.useState<Set<string>>(() => new Set());

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

  React.useEffect(() => {
    setLitCells(new Set());
  }, [layout, darkness]);

  if (layout.cols === 0 || layout.rows === 0) return null;

  const tile = Math.floor((maxWidth - GAP * (layout.cols - 1)) / layout.cols);
  const size = Math.max(18, Math.min(tile, 52));

  const metrics = { cellSize: size, gap: GAP, cellMarginY: CELL_MARGIN_Y };

  const brush = (x: number, y: number) => {
    const key = cellAtPoint(layout, occupiedKeys, x, y, metrics);
    if (!key) return;
    setLitCells((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const clearBrush = () => setLitCells(new Set());

  const pan = React.useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => {
          runOnJS(brush)(e.x, e.y);
        })
        .onUpdate((e) => {
          runOnJS(brush)(e.x, e.y);
        })
        .onFinalize(() => {
          runOnJS(clearBrush)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout, size, darkness],
  );

  const grid = (
    <View style={styles.grid}>
      {Array.from({ length: layout.rows }).map((_, row) => (
        <View key={row} style={[styles.row, { gap: GAP }]}>
          {Array.from({ length: layout.cols }).map((_, col) => {
            const cellKey = keyOf(row, col);
            const letter = cellLetters.get(cellKey);
            if (!letter) {
              return <View key={col} style={{ width: size, height: size }} />;
            }
            const isRevealed = revealed.has(cellKey);
            const isHint = !isRevealed && hinted.has(cellKey);
            const isLit = litCells.has(cellKey);
            const showLetter = shouldShowLetter({ darkness: !!darkness, isRevealed, isHint, isLit });
            return (
              <GridCell
                key={col}
                size={size}
                letter={letter}
                showLetter={showLetter}
                isRevealed={isRevealed}
                isHint={isHint}
                isLit={isLit}
                darkness={!!darkness}
                pulse={pulsing.has(cellKey)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );

  if (!darkness) return grid;

  return <GestureDetector gesture={pan}>{grid}</GestureDetector>;
}

function GridCell({
  size,
  letter,
  showLetter,
  isRevealed,
  isHint,
  isLit,
  darkness,
  pulse,
}: {
  size: number;
  letter: string;
  showLetter: boolean;
  isRevealed: boolean;
  isHint: boolean;
  isLit: boolean;
  darkness: boolean;
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

  const isDark = darkness && !isRevealed && !isHint && !isLit;

  return (
    <Animated.View
      style={[
        styles.cell,
        { width: size, height: size, borderRadius: size * 0.18 },
        isRevealed && styles.cellRevealed,
        isHint && styles.cellHint,
        isLit && styles.cellLit,
        isDark && styles.cellDark,
        animStyle,
      ]}
    >
      {showLetter && (
        <AppText
          style={[
            styles.letter,
            isHint && styles.letterHint,
            isLit && styles.letterLit,
            { fontSize: size * 0.48 },
          ]}
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
    marginVertical: CELL_MARGIN_Y,
    backgroundColor: 'rgba(8, 5, 14, 0.32)',
    borderWidth: 1.5,
    borderColor: 'rgba(201, 162, 39, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  cellDark: {
    backgroundColor: 'rgba(4, 2, 8, 0.75)',
    borderColor: 'rgba(60, 50, 80, 0.35)',
    shadowOpacity: 0,
  },
  cellLit: {
    backgroundColor: 'rgba(30, 24, 42, 0.85)',
    borderColor: 'rgba(230, 195, 74, 0.55)',
    shadowColor: colors.accentSoft,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  cellRevealed: {
    backgroundColor: 'rgba(22, 16, 30, 0.72)',
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  cellHint: {
    backgroundColor: 'rgba(22, 16, 30, 0.5)',
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
  },
  letter: {
    color: colors.accentSoft,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  letterLit: { color: colors.text },
  letterHint: { color: colors.textMuted },
});
