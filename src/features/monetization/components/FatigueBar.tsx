import React from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { monetizationConfig } from '../config';
import { AppText } from '../../../ui/components';
import { colors, radius, spacing } from '../../../ui/theme';

/**
 * Shared Shadow Fatigue meter. Used on Map, Camp, and Palantír.
 * Framed as ambient state — never a punishment bar (GAME_DESIGN.md §9).
 */
export function FatigueBar({
  fatigue,
  onPress,
  compact,
  style,
}: {
  fatigue: number;
  /** When set, the bar is tappable (e.g. opens the Seeing Stone). */
  onPress?: () => void;
  compact?: boolean;
  style?: ViewProps['style'];
}) {
  const max = monetizationConfig.fatigue.max;
  const pct = Math.round((fatigue / max) * 100);
  const fillColor =
    pct >= monetizationConfig.palantir.nudgeThreshold ? colors.danger : colors.accent;

  const content = (
    <View style={[styles.wrap, compact && styles.wrapCompact, style]}>
      <View style={styles.labelRow}>
        <AppText variant="small" muted>
          Shadow Fatigue
        </AppText>
        <AppText variant="small" style={{ color: colors.textMuted }}>
          {Math.round(fatigue)} / {max}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fillColor }]} />
      </View>
      {!compact && (
        <AppText variant="small" muted>
          Rest at camp or channel distant light for a bonus — never required to play.
        </AppText>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  wrapCompact: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.fog,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
  pressed: { opacity: 0.85 },
});
