import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getBiomeBackground, getEntityPortrait } from '../assets/images';
import { getArtifact, getCompanion, getEntity, getLevel, getTheme } from '../content';
import { entityLevelSequence, nextLevelId } from '../features/map/progression';
import { syncMapReveals } from '../features/map/syncMapReveals';
import { FATIGUE_PER_LEVEL } from '../store/slices/fatigueSlice';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reward'>;

export function RewardScreen({ navigation, route }: Props) {
  const { levelId, entityId } = route.params;
  const level = getLevel(levelId);
  const entity = getEntity(entityId);
  const theme = entity ? getTheme(entity.themeId) : undefined;
  const biomeBackground = theme ? getBiomeBackground(theme.id) : undefined;
  const portrait = entity ? getEntityPortrait(entity.id) : undefined;

  const completeLevel = useGameStore((s) => s.completeLevel);
  const addCoins = useGameStore((s) => s.addCoins);
  const grantArtifact = useGameStore((s) => s.grantArtifact);
  const unlockCompanion = useGameStore((s) => s.unlockCompanion);
  const setCompanionActive = useGameStore((s) => s.setCompanionActive);
  const addFatigue = useGameStore((s) => s.addFatigue);

  // Award once on mount. Boss levels grant the artifact + companion.
  React.useEffect(() => {
    completeLevel(levelId);
    addCoins(10);
    addFatigue(FATIGUE_PER_LEVEL);
    syncMapReveals();
    if (level?.isBoss && entity) {
      if (entity.artifactId) grantArtifact(entity.artifactId);
      if (entity.companionId) {
        unlockCompanion(entity.companionId);
        setCompanionActive(entity.companionId, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const artifact = level?.isBoss && entity?.artifactId ? getArtifact(entity.artifactId) : undefined;
  const companion =
    level?.isBoss && entity?.companionId ? getCompanion(entity.companionId) : undefined;

  const next = entity ? nextLevelId(entityLevelSequence(entity), levelId) : null;

  const headline = level?.isBoss ? 'The trial yields' : 'Word found';
  const flavor = level?.isBoss
    ? 'The wood exhales. A path glimmers ahead.'
    : 'Another thread of the forest\'s secret, woven.';

  const body = (
    <>
      <View style={styles.body}>
        {portrait && level?.isBoss && (
          <View style={styles.portraitFrame}>
            <Image source={portrait} style={styles.portrait} resizeMode="cover" />
          </View>
        )}
        <AppText variant="small" style={styles.eyebrow}>
          {headline}
        </AppText>
        <AppText variant="title" style={styles.title}>
          Trial Complete
        </AppText>
        <AppText style={styles.flavor}>{flavor}</AppText>

        <View style={styles.rewards}>
          <AppText style={styles.rewardLine}>
            <AppText style={styles.rewardGold}>+10</AppText> coins
          </AppText>
          {artifact && (
            <AppText style={styles.rewardLine}>
              Artifact:{' '}
              <AppText style={styles.rewardGold}>{artifact.name}</AppText>
            </AppText>
          )}
          {companion && (
            <AppText style={styles.rewardLine}>
              <AppText style={styles.rewardGold}>{companion.name}</AppText> joins your journey
            </AppText>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {next && entity && (
          <AppButton
            title="Next Trial"
            onPress={() => navigation.replace('Puzzle', { levelId: next })}
          />
        )}
        <AppButton
          title={next ? 'Return to the Map' : 'Continue the Journey'}
          variant={next ? 'ghost' : 'primary'}
          style={next ? styles.ghostAction : undefined}
          onPress={() => navigation.navigate('Map')}
        />
      </View>
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
  textShadowColor: 'rgba(0, 0, 0, 0.9)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 10,
} as const;

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(14, 11, 20, 0.55)',
  },
  container: { justifyContent: 'space-between' },
  body: {
    marginTop: spacing.xl * 2,
    gap: spacing.md,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  portraitFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(201, 162, 39, 0.65)',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  portrait: { width: '100%', height: '100%' },
  eyebrow: {
    color: colors.accentSoft,
    textTransform: 'uppercase',
    letterSpacing: 2,
    ...textShadow,
  },
  title: { color: colors.success, ...textShadow },
  flavor: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: colors.text,
    lineHeight: 24,
    ...textShadow,
  },
  rewards: { marginTop: spacing.md, gap: spacing.sm, alignItems: 'center' },
  rewardLine: { color: colors.text, textAlign: 'center', ...textShadow },
  rewardGold: { color: colors.accentSoft, fontWeight: '700' },
  actions: { gap: spacing.sm, paddingBottom: spacing.md },
  ghostAction: { backgroundColor: 'transparent', borderWidth: 0 },
});
