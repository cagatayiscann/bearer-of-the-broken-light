import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

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
  /** Fired on release with the spelled word (may be empty/invalid — parent judges). */
  onWord: (word: string) => void;
  /** Fired as the selection changes, for a live "current guess" readout. */
  onPreview?: (current: string) => void;
  disabled?: boolean;
}) {
  const [diameter, setDiameter] = React.useState(0);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [finger, setFinger] = React.useState<Point | null>(null);

  // Keep a ref in sync so gesture callbacks (via runOnJS) read current selection.
  const selectedRef = React.useRef<number[]>([]);
  selectedRef.current = selected;

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
    // touch/end close over nodes; rebuild when geometry or letters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, nodes, letters],
  );

  // Connecting segments between consecutive selected nodes (+ live finger trail).
  const segments: { from: Point; to: Point }[] = [];
  for (let i = 0; i < selected.length - 1; i++) {
    segments.push({ from: nodes[selected[i]], to: nodes[selected[i + 1]] });
  }
  if (selected.length > 0 && finger) {
    segments.push({ from: nodes[selected[selected.length - 1]], to: finger });
  }

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container} onLayout={onLayout}>
        {segments.map((s, i) => (
          <Segment key={i} from={s.from} to={s.to} />
        ))}

        {nodes.map((node, i) => {
          const isSelected = selected.includes(i);
          const order = selected.indexOf(i);
          return (
            <View
              key={i}
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
      </View>
    </GestureDetector>
  );
}

/** A single connecting line drawn as a rotated View (avoids an SVG dependency). */
function Segment({ from, to }: { from: Point; to: Point }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const thickness = 6;
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
        backgroundColor: colors.accent,
        opacity: 0.7,
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
  node: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accentSoft,
  },
  nodeText: { color: colors.text, fontWeight: '800' },
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
