import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { Entity } from '../../../types';
import { AppText } from '../../../ui/components';
import { colors, radius, spacing } from '../../../ui/theme';
import { completedCount, entityLevelSequence } from '../progression';
import type { NodeVisualState } from '../fog';

export interface SelectorNode {
  entityId: string;
  entity: Entity;
  state: NodeVisualState;
}

/**
 * Bottom challenge strip (Hand of Fate 2 style): scrollable diamond icons
 * for each journey stop on the current theme.
 */
export function MapNodeSelector({
  nodes,
  selectedEntityId,
  completedLevelIds,
  onSelect,
}: {
  nodes: SelectorNode[];
  selectedEntityId: string | null;
  completedLevelIds: string[];
  onSelect: (entityId: string) => void;
}) {
  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {nodes.map((node) => {
          const selected = node.entityId === selectedEntityId;
          const total = entityLevelSequence(node.entity).length;
          const done = completedCount(node.entity, completedLevelIds);
          const fogged = node.state === 'fogged';

          return (
            <Pressable
              key={node.entityId}
              style={[styles.slot, selected && styles.slotSelected]}
              onPress={() => !fogged && onSelect(node.entityId)}
              disabled={fogged}
            >
              <View
                style={[
                  styles.diamond,
                  fogged && styles.diamondFogged,
                  node.state === 'complete' && styles.diamondComplete,
                  selected && styles.diamondSelected,
                ]}
              />
              <AppText
                variant="small"
                numberOfLines={1}
                style={[
                  styles.label,
                  fogged && styles.labelFogged,
                  selected && styles.labelSelected,
                ]}
              >
                {fogged ? '???' : node.entity.name.split(' ').slice(-1)[0]}
              </AppText>
              {!fogged && (
                <AppText variant="small" muted style={styles.progress}>
                  {done}/{total}
                </AppText>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.mapWoodDark,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.mapWood,
    paddingVertical: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  slot: {
    alignItems: 'center',
    width: 72,
    gap: spacing.xs,
    opacity: 0.75,
  },
  slotSelected: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  diamond: {
    width: 18,
    height: 18,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  diamondFogged: {
    backgroundColor: colors.fog,
    opacity: 0.45,
  },
  diamondComplete: {
    borderColor: colors.success,
    backgroundColor: colors.mapHillLight,
  },
  diamondSelected: {
    width: 22,
    height: 22,
    borderColor: colors.accentSoft,
    backgroundColor: colors.bgElevated,
  },
  label: {
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelFogged: { opacity: 0.4 },
  labelSelected: { color: colors.accentSoft },
  progress: { fontSize: 11 },
});
