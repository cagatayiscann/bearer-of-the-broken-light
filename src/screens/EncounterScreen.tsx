import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { getEntity } from '../content';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Encounter'>;

export function EncounterScreen({ navigation, route }: Props) {
  const entity = getEntity(route.params.entityId);

  if (!entity) {
    return (
      <Screen>
        <AppText>Unknown encounter.</AppText>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.top}>
        <AppText variant="title" style={{ color: colors.accentSoft }}>
          {entity.name}
        </AppText>
        <AppText muted style={styles.dialogue}>
          {/* Layer A dialogue is authored per entity; placeholder for now. */}
          &ldquo;Solve my riddle of words, traveler, and the path shall open.&rdquo;
        </AppText>
      </View>

      <AppButton
        title="Accept the Trial"
        onPress={() => navigation.navigate('Puzzle', { levelId: entity.bossLevelId })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  top: { marginTop: spacing.xl, gap: spacing.md },
  dialogue: { fontStyle: 'italic', lineHeight: 24 },
});
