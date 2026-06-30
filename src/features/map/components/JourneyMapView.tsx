import React from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

import type { RegionLabel } from '../../../content/mapLayouts';
import type { Entity } from '../../../types';
import { AppText } from '../../../ui/components';
import { colors, radius } from '../../../ui/theme';
import type { NodeVisualState } from '../fog';

const WORLD_MAP = require('../../../../assets/world-map.png');

export interface JourneyMapNode {
  entityId: string;
  x: number;
  y: number;
  state: NodeVisualState;
  entity: Entity;
}

export interface JourneyRegion extends RegionLabel {
  unlocked: boolean;
}

interface Props {
  nodes: JourneyMapNode[];
  regions: JourneyRegion[];
  selectedEntityId: string | null;
  onSelectNode: (entityId: string) => void;
  width: number;
  height: number;
}

/**
 * The hero journey map: a painted world-map background (assets/world-map.png)
 * inside a wooden frame, with region labels and tappable node markers placed by
 * data (content/mapLayouts.ts). Unreached regions stay dim; fogged nodes hidden.
 */
export function JourneyMapView({
  nodes,
  regions,
  selectedEntityId,
  onSelectNode,
  width,
  height,
}: Props) {
  return (
    <View style={[styles.frame, { width: width + 12, height: height + 12 }]}>
      <View style={styles.frameInner}>
        <ImageBackground source={WORLD_MAP} style={{ width, height }} resizeMode="cover">
          {/* Soft vignette to lift labels off the busy art. */}
          <View style={styles.vignette} pointerEvents="none" />

          {/* Region labels across the full arc. */}
          {regions.map((region) => (
            <View
              key={region.themeId}
              pointerEvents="none"
              style={[
                styles.regionLabel,
                {
                  left: region.x * width,
                  top: region.y * height,
                },
              ]}
            >
              <AppText
                variant="small"
                style={[styles.regionText, !region.unlocked && styles.regionTextLocked]}
                numberOfLines={1}
              >
                {region.unlocked ? region.name : '? ? ?'}
              </AppText>
            </View>
          ))}

          {/* Tappable node markers. */}
          {nodes.map((node) => {
            const selected = selectedEntityId === node.entityId;
            const fogged = node.state === 'fogged';
            return (
              <Pressable
                key={node.entityId}
                style={[
                  styles.markerHit,
                  { left: node.x * width - 28, top: node.y * height - 28 },
                ]}
                onPress={() => !fogged && onSelectNode(node.entityId)}
                disabled={fogged}
              >
                {selected && !fogged && (
                  <View style={styles.ribbon}>
                    <AppText variant="small" style={styles.ribbonText} numberOfLines={1}>
                      {node.entity.name}
                    </AppText>
                  </View>
                )}
                <View style={styles.markerGlowWrap}>
                  {selected && !fogged && <View style={styles.markerGlow} />}
                  <View
                    style={[
                      styles.diamond,
                      fogged && styles.diamondFogged,
                      node.state === 'active' && styles.diamondActive,
                      node.state === 'complete' && styles.diamondComplete,
                      selected && !fogged && styles.diamondSelected,
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </ImageBackground>
      </View>
    </View>
  );
}

const MARKER = 20;

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    backgroundColor: colors.mapWood,
    borderRadius: radius.lg,
    padding: 6,
    borderWidth: 2,
    borderColor: colors.mapWoodDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  frameInner: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.mapWoodLight,
    overflow: 'hidden',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.md,
    borderWidth: 18,
    borderColor: 'rgba(14,11,20,0.35)',
  },
  regionLabel: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(14,11,20,0.55)',
    transform: [{ translateX: -40 }],
    minWidth: 80,
    alignItems: 'center',
  },
  regionText: { color: colors.accentSoft, fontWeight: '700', fontSize: 11 },
  regionTextLocked: { color: colors.textMuted, opacity: 0.7 },
  markerHit: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerGlowWrap: { alignItems: 'center', justifyContent: 'center' },
  markerGlow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentSoft,
    opacity: 0.3,
  },
  diamond: {
    width: MARKER,
    height: MARKER,
    transform: [{ rotate: '45deg' }],
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: colors.surface,
  },
  diamondFogged: { backgroundColor: colors.fog, opacity: 0.4 },
  diamondActive: { borderColor: colors.accent, backgroundColor: colors.bgElevated },
  diamondComplete: { borderColor: colors.success, backgroundColor: colors.mapHillLight },
  diamondSelected: { borderColor: colors.accentSoft, backgroundColor: colors.accent },
  ribbon: {
    position: 'absolute',
    top: -22,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    maxWidth: 150,
    zIndex: 2,
  },
  ribbonText: { color: '#FFF', fontWeight: '700', textAlign: 'center' },
});
