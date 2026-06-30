import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getEntity } from '../content';
import { entityProgress } from '../features/map/progression';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Encounter'>;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function EncounterScreen({ navigation, route }: Props) {
  const entity = getEntity(route.params.entityId);
  const completedLevelIds = useGameStore((s) => s.completedLevelIds);

  if (!entity) {
    return (
      <Screen>
        <AppText>Unknown encounter.</AppText>
      </Screen>
    );
  }

  const progress = entityProgress(entity, completedLevelIds);

  return (
    <Screen style={styles.container}>
      <View style={styles.top}>
        <AppText variant="title" style={{ color: colors.accentSoft }}>
          {entity.name}
        </AppText>
        <AppText muted style={styles.dialogue}>
          {/* Layer A dialogue is authored per entity; placeholder for now. */}
          &ldquo;Solve my riddles of words, traveler, and the path shall open.&rdquo;
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {progress.map((p) => {
          const label = `Trial ${ROMAN[p.index] ?? p.index + 1}`;
          const status = p.completed
            ? 'Complete'
            : p.unlocked
              ? p.isBoss
                ? 'Boss · Timed'
                : 'Ready'
              : 'Locked';
          return (
            <View
              key={p.levelId}
              style={[styles.trial, !p.unlocked && styles.trialLocked]}
            >
              <View style={{ flex: 1 }}>
                <AppText style={p.isBoss ? { color: colors.accentSoft } : undefined}>
                  {label}
                  {p.isBoss ? '  ✦' : ''}
                </AppText>
                <AppText
                  variant="small"
                  style={{
                    color: p.completed
                      ? colors.success
                      : p.unlocked
                        ? colors.textMuted
                        : colors.textMuted,
                  }}
                >
                  {status}
                </AppText>
              </View>
              {p.unlocked ? (
                <AppButton
                  title={p.completed ? 'Revisit' : 'Enter'}
                  variant={p.completed ? 'ghost' : 'primary'}
                  onPress={() => navigation.navigate('Puzzle', { levelId: p.levelId })}
                />
              ) : (
                <AppText muted>🔒</AppText>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  top: { marginTop: spacing.md, gap: spacing.md },
  dialogue: { fontStyle: 'italic', lineHeight: 24 },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  trial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  trialLocked: { opacity: 0.5 },
});
