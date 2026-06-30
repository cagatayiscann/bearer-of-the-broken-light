import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getCompanion } from '../content';
import { FatigueBar } from '../features/monetization/components/FatigueBar';
import { monetizationConfig } from '../features/monetization/config';
import { useGameStore } from '../store/useGameStore';
import { AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Camp'>;

export function CampScreen({ navigation }: Props) {
  const fatigue = useGameStore((s) => s.fatigue);
  const activeCompanionIds = useGameStore((s) => s.activeCompanionIds);
  const unlockedCompanionIds = useGameStore((s) => s.unlockedCompanionIds);

  const companions = unlockedCompanionIds
    .map((id) => getCompanion(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const hoursToClear = Math.round(
    monetizationConfig.fatigue.max / monetizationConfig.fatigue.decayPerHour,
  );

  return (
    <Screen style={{ gap: spacing.lg }}>
      <View style={styles.card}>
        <AppText variant="heading">Camp</AppText>
        <FatigueBar fatigue={fatigue} onPress={() => navigation.navigate('Palantir')} />
        <AppText variant="small" muted>
          The party rests here. Fatigue fades while you are away (about {hoursToClear}h from
          full). Tap the bar to channel light at the Seeing Stone.
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText variant="heading">Around the Fire</AppText>
        {companions.length === 0 ? (
          <AppText muted>No companions yet.</AppText>
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
});
