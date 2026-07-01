import React from 'react';
import {
  type GestureResponderEvent,
  Pressable,
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
import { cellAtPoint } from '../twists/darkness';

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

  const metrics = React.useMemo(
    () => (layout.cols > 0 && layout.rows > 0 ? gridMetrics(layout, maxWidth) : null),
    [layout, maxWidth],
  );

  const brushAt = React.useCallback(
    (x: number, y: number) => {
      if (!metrics) return;
      const key = cellAtPoint(layout, occupiedKeys, x, y, metrics.touch);
      if (!key) return;
      setLitCells((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    },
    [layout, occupiedKeys, metrics],
  );

  const clearBrush = React.useCallback(() => setLitCells(new Set()), []);

  const lightCell = React.useCallback((key: string) => {
    setLitCells((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const dimCell = React.useCallback((key: string) => {
    setLitCells((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

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

  const onTouch = React.useCallback(
    (e: GestureResponderEvent) => {
      brushAt(e.nativeEvent.locationX, e.nativeEvent.locationY);
    },
    [brushAt],
  );

  if (!metrics) return null;

  const { cellSize: size, width: gridWidth, height: gridHeight } = metrics;

  const gridBody = (
    <>
      {Array.from({ length: layout.rows }).map((_, row) => (
        <View key={row} style={[styles.row, { gap: GAP }]} pointerEvents="box-none">
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

            const cell = (pressed = false) => {
              const lit = isLit || pressed;
              const shrouded = !!darkness && !isRevealed && !isHint && !lit;
              const showLetter = isRevealed || isHint || (!!darkness && lit);
              return (
                <GridCell
                  size={size}
                  letter={letter}
                  showLetter={showLetter}
                  isRevealed={isRevealed}
                  isHint={isHint}
                  isLit={lit}
                  isShrouded={shrouded}
                  darkness={!!darkness}
                  pulse={pulsing.has(cellKey)}
                />
              );
            };

            if (!isShrouded) {
              return <View key={col}>{cell()}</View>;
            }

            return (
              <Pressable
                key={col}
                onPressIn={() => lightCell(cellKey)}
                onPressOut={() => dimCell(cellKey)}
                style={({ pressed }) => [{ width: size, height: size + CELL_MARGIN_Y * 2 }]}
              >
                {({ pressed }) => cell(pressed)}
              </Pressable>
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
      onStartShouldSetResponderCapture={() => true}
      onMoveShouldSetResponderCapture={() => true}
      onResponderGrant={onTouch}
      onResponderMove={onTouch}
      onResponderRelease={clearBrush}
      onResponderTerminate={clearBrush}
    >
      {gridBody}
      <View style={[styles.gridMist, { width: gridWidth, height: gridHeight }]} pointerEvents="none" />
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
      {showLetter && !isShrouded && (
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
          <View style={[styles.shroudFog, { borderRadius: radius }]} />
          <AppText style={[styles.shroudMark, { fontSize: size * 0.38 }]}>?</AppText>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { alignItems: 'center', justifyContent: 'center' },
  gridTouch: { alignSelf: 'center' },
  gridMist: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(40, 28, 60, 0.18)',
    borderRadius: 12,
  },
  row: { flexDirection: 'row' },
  cell: {
    marginVertical: CELL_MARGIN_Y,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellOpen: {
    backgroundColor: 'rgba(8, 5, 14, 0.32)',
    borderWidth: 1.5,
    borderColor: 'rgba(201, 162, 39, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  cellShrouded: {
    backgroundColor: '#06040c',
    borderWidth: 2,
    borderColor: 'rgba(130, 110, 170, 0.55)',
    shadowColor: 'rgba(60, 40, 90, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 6,
  },
  shroudVeil: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0816',
  },
  shroudFog: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(120, 95, 160, 0.55)',
  },
  shroudMark: {
    color: 'rgba(210, 190, 240, 0.35)',
    fontWeight: '800',
  },
  cellLit: {
    backgroundColor: 'rgba(28, 22, 44, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(230, 195, 74, 0.85)',
    shadowColor: colors.accentSoft,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
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
