import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '../../../ui/components';
import { colors, radius } from '../../../ui/theme';

interface Point {
  x: number;
  y: number;
}

/**
 * World-of-Wonders-style letter wheel: press a letter and drag across others to
 * spell a word, release to submit. The component only owns transient selection
 * state; all word validity decisions live in the pure engine (the parent decides
 * what to do with the emitted word).
 */
export function LetterWheel({
  letters,
  onWord,
  onPreview,
  disabled,
}: {
  letters: string[];
  onWord: (word: string) => void;
  onPreview?: (current: string) => void;
  disabled?: boolean;
}) {
  const [diameter, setDiameter] = React.useState(0);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [finger, setFinger] = React.useState<Point | null>(null);

  const selectedRef = React.useRef<number[]>([]);
  selectedRef.current = selected;

  const wheelSpin = useSharedValue(0);

  // Clear in-progress selection when the parent shuffles letter order.
  React.useEffect(() => {
    selectedRef.current = [];
    setSelected([]);
    setFinger(null);
    onPreview?.('');
    wheelSpin.value = withSequence(
      withSpring(-0.08, { damping: 12, stiffness: 280 }),
      withSpring(0, { damping: 14, stiffness: 220 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letters]);

  const nodes = React.useMemo<Point[]>(() => {
    if (!diameter) return [];
    const center = diameter / 2;
    const ring = diameter * 0.36;
    const n = letters.length;
    return letters.map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: center + ring * Math.cos(angle), y: center + ring * Math.sin(angle) };
    });
  }, [diameter, letters]);

  const nodeSize = diameter ? Math.max(36, Math.min(diameter * 0.18, 60)) : 44;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDiameter(Math.min(width, height));
  };

  const hitTest = (x: number, y: number): number => {
    let best = -1;
    let bestDist = nodeSize * 0.75;
    nodes.forEach((node, i) => {
      const d = Math.hypot(node.x - x, node.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  const emitPreview = (indices: number[]) => {
    onPreview?.(indices.map((i) => letters[i]).join(''));
  };

  const touch = (x: number, y: number) => {
    setFinger({ x, y });
    const idx = hitTest(x, y);
    if (idx >= 0 && !selectedRef.current.includes(idx)) {
      const next = [...selectedRef.current, idx];
      selectedRef.current = next;
      setSelected(next);
      emitPreview(next);
    }
  };

  const end = () => {
    const word = selectedRef.current.map((i) => letters[i]).join('');
    selectedRef.current = [];
    setSelected([]);
    setFinger(null);
    onPreview?.('');
    if (word) onWord(word);
  };

  const pan = React.useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .enabled(!disabled)
        .onBegin((e) => {
          runOnJS(touch)(e.x, e.y);
        })
        .onUpdate((e) => {
          runOnJS(touch)(e.x, e.y);
        })
        .onFinalize(() => {
          runOnJS(end)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, nodes, letters],
  );

  const wheelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelSpin.value}rad` }],
  }));

  const segments: { from: Point; to: Point }[] = [];
  for (let i = 0; i < selected.length - 1; i++) {
    segments.push({ from: nodes[selected[i]], to: nodes[selected[i + 1]] });
  }
  if (selected.length > 0 && finger) {
    segments.push({ from: nodes[selected[selected.length - 1]], to: finger });
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, wheelAnimStyle]} onLayout={onLayout}>
        {diameter > 0 && (
          <>
            <View
              style={[
                styles.outerRing,
                {
                  width: diameter * 0.78,
                  height: diameter * 0.78,
                  borderRadius: diameter * 0.39,
                  left: diameter * 0.11,
                  top: diameter * 0.11,
                },
              ]}
            />
            <View
              style={[
                styles.innerGlow,
                {
                  width: diameter * 0.52,
                  height: diameter * 0.52,
                  borderRadius: diameter * 0.26,
                  left: diameter * 0.24,
                  top: diameter * 0.24,
                },
              ]}
            />
          </>
        )}

        {segments.map((s, i) => (
          <Segment key={i} from={s.from} to={s.to} />
        ))}

        {nodes.map((node, i) => {
          const isSelected = selected.includes(i);
          const order = selected.indexOf(i);
          return (
            <View
              key={`${letters[i]}-${i}`}
              style={[
                styles.node,
                {
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: nodeSize / 2,
                  left: node.x - nodeSize / 2,
                  top: node.y - nodeSize / 2,
                },
                isSelected && styles.nodeSelected,
              ]}
            >
              <AppText
                style={[
                  styles.nodeText,
                  { fontSize: nodeSize * 0.42 },
                  isSelected && styles.nodeTextSelected,
                ]}
              >
                {letters[i]}
              </AppText>
              {order >= 0 && <View style={styles.orderDot} />}
            </View>
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
}

function Segment({ from, to }: { from: Point; to: Point }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const thickness = 5;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: midX - length / 2,
        top: midY - thickness / 2,
        width: length,
        height: thickness,
        borderRadius: thickness / 2,
        backgroundColor: colors.accentSoft,
        opacity: 0.85,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: colors.puzzleGoldBorder,
    backgroundColor: colors.puzzleGoldGlow,
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(201, 162, 39, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.12)',
  },
  node: {
    position: 'absolute',
    backgroundColor: colors.puzzleRuneDisc,
    borderWidth: 2,
    borderColor: colors.puzzleGoldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  nodeSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accentSoft,
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  nodeText: { color: colors.accentSoft, fontWeight: '800' },
  nodeTextSelected: { color: '#1A1206' },
  orderDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: '#1A1206',
  },
});
