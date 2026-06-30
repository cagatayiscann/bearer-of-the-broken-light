import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { entities, themes } from '../content';
import { completedCount, entityLevelSequence } from '../features/map/progression';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const completedLevelIds = useGameStore((s) => s.completedLevelIds);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.list}>
        {themes.map((theme) => (
          <View key={theme.id} style={styles.themeBlock}>
            <AppText variant="heading" style={{ color: colors.accentSoft }}>
              {theme.name}
            </AppText>
            {theme.entityIds.map((entityId) => {
              const entity = entities.find((e) => e.id === entityId);
              if (!entity) return null;
              const total = entityLevelSequence(entity).length;
              const done = completedCount(entity, completedLevelIds);
              const allDone = done >= total;
              return (
                <View key={entity.id} style={styles.node}>
                  <View style={{ flex: 1 }}>
                    <AppText>{entity.name}</AppText>
                    <AppText
                      variant="small"
                      style={{ color: allDone ? colors.success : colors.textMuted }}
                    >
                      {allDone ? 'All trials complete' : `${done}/${total} trials`}
                    </AppText>
                  </View>
                  <AppButton
                    title={done > 0 ? 'Continue' : 'Approach'}
                    variant={allDone ? 'ghost' : 'primary'}
                    onPress={() => navigation.navigate('Encounter', { entityId: entity.id })}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.lg, paddingBottom: spacing.xl },
  themeBlock: { gap: spacing.sm },
  node: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
});
