import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../app/navigation';
import { entities, themes } from '../content';
import { buildMapNodes, isThemeUnlocked, nodeVisualState } from '../features/map/fog';
import { MapNodeCard } from '../features/map/components/MapNodeCard';
import { syncMapReveals } from '../features/map/syncMapReveals';
import { FatigueBar } from '../features/monetization/components/FatigueBar';
import { monetizationConfig } from '../features/monetization/config';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText, Screen } from '../ui/components';
import { colors, radius, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const completedLevelIds = useGameStore((s) => s.completedLevelIds);
  const revealedNodeIds = useGameStore((s) => s.revealedNodeIds);
  const fatigue = useGameStore((s) => s.fatigue);

  React.useEffect(() => {
    syncMapReveals();
  }, [completedLevelIds]);

  const showNudge = fatigue >= monetizationConfig.palantir.nudgeThreshold;
  const mapNodes = buildMapNodes(themes, entities);

  return (
    <Screen>
      <View style={styles.fatigueStrip}>
        <FatigueBar fatigue={fatigue} compact onPress={() => navigation.navigate('Palantir')} />
      </View>

      {showNudge && (
        <View style={styles.nudge}>
          <AppText variant="small" style={{ flex: 1, color: colors.accentSoft }}>
            The light wavers. Channel distant energy for a bonus shard.
          </AppText>
          <AppButton
            title="Seeing Stone"
            variant="ghost"
            onPress={() => navigation.navigate('Palantir')}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {[...themes]
          .sort((a, b) => a.order - b.order)
          .map((theme) => {
            const themeUnlocked = isThemeUnlocked(
              theme,
              themes,
              entities,
              completedLevelIds,
            );
            const themeNodes = mapNodes.filter((n) => n.themeId === theme.id);

            return (
              <View key={theme.id} style={styles.themeBlock}>
                <AppText variant="heading" style={{ color: colors.accentSoft }}>
                  {themeUnlocked ? theme.name : `${theme.name} (locked)`}
                </AppText>
                {!themeUnlocked ? (
                  <View style={styles.themeFog}>
                    <AppText variant="small" muted>
                      Complete the region before to unveil this part of the map.
                    </AppText>
                  </View>
                ) : (
                  themeNodes.map((node, idx) => {
                    const entity = entities.find((e) => e.id === node.entityId);
                    if (!entity) return null;
                    const state = nodeVisualState(
                      node,
                      revealedNodeIds,
                      entity,
                      completedLevelIds,
                    );
                    return (
                      <MapNodeCard
                        key={node.id}
                        node={node}
                        entity={entity}
                        state={state}
                        completedLevelIds={completedLevelIds}
                        onApproach={(entityId) =>
                          navigation.navigate('Encounter', { entityId })
                        }
                        showConnector={idx < themeNodes.length - 1}
                      />
                    );
                  })
                )}
              </View>
            );
          })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fatigueStrip: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  list: { gap: spacing.lg, paddingBottom: spacing.xl },
  themeBlock: { gap: spacing.sm },
  themeFog: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.fog,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
