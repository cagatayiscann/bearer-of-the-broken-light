import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getCompanion } from '../content';
import { useGameStore } from '../store/useGameStore';
import { AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Camp'>;

export function CampScreen(_props: Props) {
  const fatigue = useGameStore((s) => s.fatigue);
  const activeCompanionIds = useGameStore((s) => s.activeCompanionIds);
  const unlockedCompanionIds = useGameStore((s) => s.unlockedCompanionIds);

  const companions = unlockedCompanionIds
    .map((id) => getCompanion(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <Screen style={{ gap: spacing.lg }}>
      <View style={styles.card}>
        <AppText variant="heading">Shadow Fatigue</AppText>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${fatigue}%` }]} />
        </View>
        <AppText variant="small" muted>
          The party rests here. Fatigue fades over time while you are away.
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText variant="heading">Around the Fire</AppText>
        {companions.length === 0 ? (
          <AppText muted>No companions yet. Win a trial to earn one.</AppText>
        ) : (
          companions.map((c) => (
            <AppText key={c.id}>
              {c.name}
              {activeCompanionIds.includes(c.id) ? ' (active)' : ''}: &ldquo;{c.barks[0]}&rdquo;
            </AppText>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  barTrack: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.fog,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.danger },
});
