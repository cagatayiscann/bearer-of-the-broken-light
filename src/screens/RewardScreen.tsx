import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getArtifact, getCompanion, getEntity, getLevel } from '../content';
import { FATIGUE_PER_LEVEL } from '../store/slices/fatigueSlice';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reward'>;

export function RewardScreen({ navigation, route }: Props) {
  const { levelId, entityId } = route.params;
  const level = getLevel(levelId);
  const entity = getEntity(entityId);

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
    if (level?.isBoss && entity) {
      if (entity.artifactId) grantArtifact(entity.artifactId);
      if (entity.companionId) {
        unlockCompanion(entity.companionId);
        // Auto-equip if there's room, so the boost is usable right away.
        setCompanionActive(entity.companionId, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const artifact = level?.isBoss && entity?.artifactId ? getArtifact(entity.artifactId) : undefined;
  const companion =
    level?.isBoss && entity?.companionId ? getCompanion(entity.companionId) : undefined;

  return (
    <Screen style={styles.container}>
      <View style={styles.body}>
        <AppText variant="title" style={{ color: colors.success }}>
          Trial Complete
        </AppText>
        <AppText muted>+10 coins</AppText>
        {artifact && (
          <AppText style={styles.reward}>
            Artifact gained: <AppText style={{ color: colors.accentSoft }}>{artifact.name}</AppText>
          </AppText>
        )}
        {companion && (
          <AppText style={styles.reward}>
            {companion.name} joins your journey!
          </AppText>
        )}
      </View>

      <AppButton title="Continue" onPress={() => navigation.navigate('Map')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  body: { marginTop: spacing.xl * 2, gap: spacing.md, alignItems: 'center' },
  reward: { textAlign: 'center' },
});
