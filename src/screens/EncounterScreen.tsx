import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getBiomeBackground, getEntityPortrait } from '../assets/images';
import { getEntity, getTheme } from '../content';
import { getEntityDialogue } from '../content/dialogue';
import { entityProgress } from '../features/map/progression';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Encounter'>;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const TWIST_LABEL: Record<string, string> = {
  timer: 'Timed',
  darkness: 'Shrouded',
};

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

  const theme = getTheme(entity.themeId);
  const biomeBackground = theme ? getBiomeBackground(theme.id) : undefined;
  const progress = entityProgress(entity, completedLevelIds);
  const portrait = getEntityPortrait(entity.id);
  const dialogue =
    getEntityDialogue(entity.dialogueId) ??
    'Solve my riddles of words, traveler, and the path shall open.';

  const body = (
    <>
      <View style={styles.top}>
        {portrait && (
          <View style={styles.portraitFrame}>
            <Image source={portrait} style={styles.portrait} resizeMode="cover" />
          </View>
        )}
        <AppText variant="title" style={styles.entityName}>
          {entity.name}
        </AppText>
        {theme && (
          <AppText variant="small" style={styles.regionLabel}>
            {theme.name}
          </AppText>
        )}
        <AppText style={styles.dialogue}>&ldquo;{dialogue}&rdquo;</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {progress.map((p) => {
          const label = `Trial ${ROMAN[p.index] ?? p.index + 1}`;
          const twistLabel = p.isBoss && entity.twist ? TWIST_LABEL[entity.twist] : undefined;
          const status = p.completed
            ? 'Complete'
            : p.unlocked
              ? twistLabel
                ? `Boss · ${twistLabel}`
                : 'Ready'
              : 'Locked';
          return (
            <View
              key={p.levelId}
              style={[styles.trialRow, !p.unlocked && styles.trialLocked]}
            >
              <View style={styles.trialInfo}>
                <AppText style={[styles.trialLabel, p.isBoss && styles.trialBoss]}>
                  {label}
                  {p.isBoss ? '  ✦' : ''}
                </AppText>
                <AppText
                  variant="small"
                  style={[
                    styles.trialStatus,
                    p.completed && { color: colors.success },
                  ]}
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
                <AppText style={styles.lockMark}>—</AppText>
              )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );

  if (biomeBackground) {
    return (
      <ImageBackground source={biomeBackground} style={styles.background} resizeMode="cover">
        <View style={styles.scrim} pointerEvents="none" />
        <Screen transparent style={styles.container}>
          {body}
        </Screen>
      </ImageBackground>
    );
  }

  return <Screen style={styles.container}>{body}</Screen>;
}

const textShadow = {
  textShadowColor: 'rgba(0, 0, 0, 0.85)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 8,
} as const;

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(14, 11, 20, 0.5)',
  },
  container: { gap: spacing.lg },
  top: { marginTop: spacing.sm, gap: spacing.sm, alignItems: 'center', paddingHorizontal: spacing.sm },
  portraitFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(201, 162, 39, 0.65)',
    overflow: 'hidden',
    backgroundColor: 'rgba(14, 10, 20, 0.4)',
  },
  portrait: { width: '100%', height: '100%' },
  entityName: { color: colors.accentSoft, ...textShadow },
  regionLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    ...textShadow,
  },
  dialogue: {
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
    color: colors.text,
    ...textShadow,
  },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  trialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 162, 39, 0.2)',
  },
  trialLocked: { opacity: 0.45 },
  trialInfo: { flex: 1, gap: 2 },
  trialLabel: { color: colors.text, ...textShadow },
  trialBoss: { color: colors.accentSoft },
  trialStatus: { color: colors.textMuted, ...textShadow },
  lockMark: { color: colors.textMuted, fontSize: 18, width: 72, textAlign: 'center' },
});
