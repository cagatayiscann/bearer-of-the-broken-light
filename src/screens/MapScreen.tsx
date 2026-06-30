import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../app/navigation';
import { entities, themes } from '../content';
import { worldMapNodes, worldRegions } from '../content/mapLayouts';
import { buildMapNodes, isThemeUnlocked, nodeVisualState } from '../features/map/fog';
import {
  JourneyMapView,
  type JourneyMapNode,
  type JourneyRegion,
} from '../features/map/components/JourneyMapView';
import { MapNodeSelector } from '../features/map/components/MapNodeSelector';
import { completedCount, entityLevelSequence } from '../features/map/progression';
import { syncMapReveals } from '../features/map/syncMapReveals';
import { FatigueBar } from '../features/monetization/components/FatigueBar';
import { monetizationConfig } from '../features/monetization/config';
import { useGameStore } from '../store/useGameStore';
import { AppButton, AppText } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const mapWidth = width - spacing.lg * 2;
  const mapHeight = Math.round(mapWidth * 0.66);

  const completedLevelIds = useGameStore((s) => s.completedLevelIds);
  const revealedNodeIds = useGameStore((s) => s.revealedNodeIds);
  const fatigue = useGameStore((s) => s.fatigue);

  const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(null);

  React.useEffect(() => {
    syncMapReveals();
  }, [completedLevelIds]);

  const allNodes = React.useMemo(() => buildMapNodes(themes, entities), []);

  // Entity nodes placed on the world map (only those with positions in data).
  const journeyNodes: JourneyMapNode[] = React.useMemo(() => {
    return worldMapNodes
      .map((pos) => {
        const entity = entities.find((e) => e.id === pos.entityId);
        const mapNode = allNodes.find((n) => n.entityId === pos.entityId);
        if (!entity || !mapNode) return null;
        return {
          entityId: pos.entityId,
          x: pos.x,
          y: pos.y,
          entity,
          state: nodeVisualState(mapNode, revealedNodeIds, entity, completedLevelIds),
        };
      })
      .filter((n): n is JourneyMapNode => n != null);
  }, [allNodes, revealedNodeIds, completedLevelIds]);

  // Full biome arc with unlock state (future biomes have no theme yet → locked).
  const regions: JourneyRegion[] = React.useMemo(() => {
    return worldRegions.map((region) => {
      const theme = themes.find((t) => t.id === region.themeId);
      const unlocked = theme
        ? isThemeUnlocked(theme, themes, entities, completedLevelIds)
        : false;
      return { ...region, unlocked };
    });
  }, [completedLevelIds]);

  // Default selection: first active node, else first revealed.
  React.useEffect(() => {
    if (selectedEntityId && journeyNodes.some((n) => n.entityId === selectedEntityId)) return;
    const pick =
      journeyNodes.find((n) => n.state === 'active') ??
      journeyNodes.find((n) => n.state !== 'fogged') ??
      null;
    setSelectedEntityId(pick?.entityId ?? null);
  }, [journeyNodes, selectedEntityId]);

  const selected = journeyNodes.find((n) => n.entityId === selectedEntityId);
  const showNudge = fatigue >= monetizationConfig.palantir.nudgeThreshold;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.fatigueStrip}>
          <FatigueBar
            fatigue={fatigue}
            compact
            onPress={() => navigation.navigate('Palantir')}
          />
        </View>

        {showNudge && (
          <View style={styles.nudge}>
            <AppText variant="small" style={{ flex: 1, color: colors.accentSoft }}>
              Channel distant light for a bonus shard.
            </AppText>
            <AppButton
              title="Seeing Stone"
              variant="ghost"
              onPress={() => navigation.navigate('Palantir')}
            />
          </View>
        )}

        <JourneyMapView
          nodes={journeyNodes}
          regions={regions}
          selectedEntityId={selectedEntityId}
          onSelectNode={setSelectedEntityId}
          width={mapWidth}
          height={mapHeight}
        />

        <MapNodeSelector
          nodes={journeyNodes.map((n) => ({
            entityId: n.entityId,
            entity: n.entity,
            state: n.state,
          }))}
          selectedEntityId={selectedEntityId}
          completedLevelIds={completedLevelIds}
          onSelect={setSelectedEntityId}
        />

        <View style={styles.actionPanel}>
          {selected && selected.state !== 'fogged' ? (
            <>
              <View style={styles.actionText}>
                <AppText variant="heading" style={{ color: colors.accentSoft }}>
                  {selected.entity.name}
                </AppText>
                <AppText variant="small" muted>
                  {selected.state === 'complete'
                    ? 'All trials complete'
                    : `${completedCount(selected.entity, completedLevelIds)}/${entityLevelSequence(selected.entity).length} trials`}
                </AppText>
              </View>
              <AppButton
                title={
                  completedCount(selected.entity, completedLevelIds) > 0 ? 'Continue' : 'Approach'
                }
                variant={selected.state === 'complete' ? 'ghost' : 'primary'}
                onPress={() => navigation.navigate('Encounter', { entityId: selected.entityId })}
              />
            </>
          ) : (
            <AppText muted style={{ textAlign: 'center', flex: 1 }}>
              Clear the path ahead to reveal more of the realm.
            </AppText>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  fatigueStrip: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  actionPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { flex: 1, gap: spacing.xs },
});
