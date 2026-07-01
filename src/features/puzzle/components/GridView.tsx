import React from 'react';
import {
  type GestureResponderEvent,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
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

function gridMetrics(layout: GridLayout, maxWidth: number) {
  const tile = Math.floor((maxWidth - GAP * (layout.cols - 1)) / layout.cols);
  const cellSize = Math.max(18, Math.min(tile, 52));
  const rowStride = cellSize + CELL_MARGIN_Y * 2;
  const colStride = cellSize + GAP;
  const width = layout.cols * colStride - GAP;
  const height = layout.rows * rowStride;
  return {
    cellSize,
    width,
    height,
    touch: { cellSize, gap: GAP, cellMarginY: CELL_MARGIN_Y },
  };
}

/**
 * Renders the crossword grid produced by the pure layout engine.
 * With `darkness`, unfound letters stay shrouded until the player brushes the cell.
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

  const { cellSize: size, width: gridWidth, height: gridHeight, touch } = gridMetrics(
    layout,
    maxWidth,
  );

  const brushAt = React.useCallback(
    (x: number, y: number) => {
      const key = cellAtPoint(layout, occupiedKeys, x, y, touch);
      if (!key) return;
      setLitCells((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    },
    [layout, occupiedKeys, touch],
  );

  const clearBrush = React.useCallback(() => setLitCells(new Set()), []);

  const onTouch = (e: GestureResponderEvent) => {
    brushAt(e.nativeEvent.locationX, e.nativeEvent.locationY);
  };

  const gridBody = (
    <>
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
            const isShrouded = !!darkness && !isRevealed && !isHint && !isLit;
            const showLetter = shouldShowLetter({
              darkness: !!darkness,
              isRevealed,
              isHint,
              isLit,
            });
            return (
              <GridCell
                key={col}
                size={size}
                letter={letter}
                showLetter={showLetter}
                isRevealed={isRevealed}
                isHint={isHint}
                isLit={isLit}
                isShrouded={isShrouded}
                darkness={!!darkness}
                pulse={pulsing.has(cellKey)}
              />
            );
          })}
        </View>
      ))}
    </>
  );

  if (!darkness) {
    return <View style={styles.grid}>{gridBody}</View>;
  }

  return (
    <View
      style={[styles.grid, styles.gridTouch, { width: gridWidth, height: gridHeight }]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={onTouch}
      onResponderMove={onTouch}
      onResponderRelease={clearBrush}
      onResponderTerminate={clearBrush}
    >
      {gridBody}
    </View>
  );
}

function GridCell({
  size,
  letter,
  showLetter,
  isRevealed,
  isHint,
  isLit,
  isShrouded,
  darkness,
  pulse,
}: {
  size: number;
  letter: string;
  showLetter: boolean;
  isRevealed: boolean;
  isHint: boolean;
  isLit: boolean;
  isShrouded: boolean;
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

  const radius = size * 0.18;

  return (
    <Animated.View
      style={[
        styles.cell,
        { width: size, height: size, borderRadius: radius },
        !darkness && !isRevealed && !isHint && styles.cellOpen,
        isRevealed && styles.cellRevealed,
        isHint && styles.cellHint,
        isLit && styles.cellLit,
        isShrouded && styles.cellShrouded,
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
      {isShrouded && (
        <View style={[styles.shroudVeil, { borderRadius: radius }]}>
          <AppText style={[styles.shroudMark, { fontSize: size * 0.34 }]}>∿</AppText>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { alignItems: 'center', justifyContent: 'center' },
  gridTouch: { alignSelf: 'center' },
  row: { flexDirection: 'row' },
  cell: {
    marginVertical: CELL_MARGIN_Y,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** Normal trials: visible empty slots waiting for a word. */
  cellOpen: {
    backgroundColor: 'rgba(8, 5, 14, 0.32)',
    borderWidth: 1.5,
    borderColor: 'rgba(201, 162, 39, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  /** Darkness: thick mist hides the letter entirely. */
  cellShrouded: {
    backgroundColor: 'rgba(12, 8, 22, 0.92)',
    borderWidth: 2,
    borderColor: 'rgba(120, 100, 160, 0.45)',
    shadowColor: 'rgba(80, 60, 120, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  shroudVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(100, 80, 140, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shroudMark: {
    color: 'rgba(200, 180, 230, 0.55)',
    fontWeight: '700',
  },
  cellLit: {
    backgroundColor: 'rgba(28, 22, 44, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(230, 195, 74, 0.7)',
    shadowColor: colors.accentSoft,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
  },
  cellRevealed: {
    backgroundColor: 'rgba(22, 16, 30, 0.72)',
    borderWidth: 1.5,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  cellHint: {
    backgroundColor: 'rgba(22, 16, 30, 0.5)',
    borderWidth: 1.5,
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
