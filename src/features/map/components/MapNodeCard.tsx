import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Entity } from '../../../types';
import { completedCount, entityLevelSequence } from '../progression';
import type { MapNode, NodeVisualState } from '../fog';
import { AppButton, AppText } from '../../../ui/components';
import { colors, radius, spacing } from '../../../ui/theme';

export function MapNodeCard({
  node,
  entity,
  state,
  completedLevelIds,
  onApproach,
  showConnector,
}: {
  node: MapNode;
  entity: Entity;
  state: NodeVisualState;
  completedLevelIds: string[];
  onApproach: (entityId: string) => void;
  showConnector: boolean;
}) {
  const total = entityLevelSequence(entity).length;
  const done = completedCount(entity, completedLevelIds);

  return (
    <View style={styles.wrap}>
      {showConnector && <View style={styles.connector} />}
      <View
        style={[
          styles.card,
          state === 'complete' && styles.cardComplete,
          state === 'active' && styles.cardActive,
          state === 'fogged' && styles.cardFogged,
        ]}
      >
        {state === 'fogged' ? (
          <>
            <View style={styles.silhouette}>
              <AppText variant="heading" style={styles.silhouetteMark}>
                ?
              </AppText>
            </View>
            <View style={styles.fogBody}>
              <AppText muted>Unknown path</AppText>
              <AppText variant="small" muted>
                Clear the trials ahead to reveal what waits in the mist.
              </AppText>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.silhouette, state === 'complete' && styles.silhouetteLit]}>
              <AppText variant="heading" style={{ color: colors.accentSoft }}>
                {state === 'complete' ? '✦' : '◆'}
              </AppText>
            </View>
            <View style={styles.body}>
              <AppText style={state === 'complete' ? { color: colors.accentSoft } : undefined}>
                {entity.name}
              </AppText>
              <AppText
                variant="small"
                style={{ color: state === 'complete' ? colors.success : colors.textMuted }}
              >
                {state === 'complete' ? 'Trials complete' : `${done}/${total} trials`}
              </AppText>
            </View>
            <AppButton
              title={done > 0 ? 'Continue' : 'Approach'}
              variant={state === 'complete' ? 'ghost' : 'primary'}
              onPress={() => onApproach(entity.id)}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', paddingLeft: spacing.lg },
  connector: {
    position: 'absolute',
    left: spacing.lg + 22,
    top: 56,
    bottom: -spacing.md,
    width: 2,
    backgroundColor: colors.border,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardActive: { borderColor: colors.accent },
  cardComplete: { borderColor: colors.success, backgroundColor: colors.bgElevated },
  cardFogged: {
    backgroundColor: colors.fog,
    borderColor: colors.border,
    opacity: 0.85,
  },
  silhouette: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteLit: { borderColor: colors.accent, backgroundColor: colors.surface },
  silhouetteMark: { color: colors.textMuted },
  fogBody: { flex: 1, gap: spacing.xs },
  body: { flex: 1, gap: spacing.xs },
});
