/**
 * Pure map fog / node-reveal logic (GAME_DESIGN.md §6).
 * The journey map shows entity nodes; unreached nodes stay fogged silhouettes.
 * No React — unit-testable.
 */
import type { Entity, Theme } from '../../types';
import { completedCount, entityLevelSequence } from './progression';

export interface MapNode {
  /** Node id (same as entity id for now). */
  id: string;
  entityId: string;
  themeId: string;
  themeOrder: number;
  indexInTheme: number;
}

export type NodeVisualState = 'fogged' | 'active' | 'complete';

/** Flatten themes → entities into a single journey order. */
export function buildMapNodes(themes: Theme[], entities: Entity[]): MapNode[] {
  const sorted = [...themes].sort((a, b) => a.order - b.order);
  const nodes: MapNode[] = [];
  for (const theme of sorted) {
    theme.entityIds.forEach((entityId, indexInTheme) => {
      nodes.push({
        id: entityId,
        entityId,
        themeId: theme.id,
        themeOrder: theme.order,
        indexInTheme,
      });
    });
  }
  return nodes;
}

export function isEntityComplete(entity: Entity, completedLevelIds: string[]): boolean {
  const total = entityLevelSequence(entity).length;
  return completedCount(entity, completedLevelIds) >= total;
}

/** A theme is playable once its prerequisite theme (if any) is fully cleared. */
export function isThemeUnlocked(
  theme: Theme,
  themes: Theme[],
  entities: Entity[],
  completedLevelIds: string[],
): boolean {
  if (!theme.unlockAfterThemeId) return true;
  const prev = themes.find((t) => t.id === theme.unlockAfterThemeId);
  if (!prev) return true;
  return prev.entityIds.every((eid) => {
    const entity = entities.find((e) => e.id === eid);
    return entity ? isEntityComplete(entity, completedLevelIds) : false;
  });
}

/**
 * Compute which map nodes should be revealed (un-fogged).
 * First node of the first unlocked theme is always open; each subsequent node
 * opens when the previous journey node is fully complete.
 */
export function computeRevealedNodes(
  nodes: MapNode[],
  themes: Theme[],
  entities: Entity[],
  completedLevelIds: string[],
  currentRevealed: string[],
): string[] {
  const revealed = new Set(currentRevealed);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const theme = themes.find((t) => t.id === node.themeId);
    if (!theme || !isThemeUnlocked(theme, themes, entities, completedLevelIds)) continue;

    if (i === 0 || node.indexInTheme === 0) {
      // First node globally, or first entity in an unlocked theme.
      if (i === 0) {
        revealed.add(node.id);
        continue;
      }
      // First of a later theme: previous theme must be fully cleared.
      const prevTheme = themes.find((t) => t.id === nodes[i - 1]?.themeId);
      if (prevTheme && isThemeUnlocked(theme, themes, entities, completedLevelIds)) {
        const prevThemeEntities = prevTheme.entityIds;
        const allPrevDone = prevThemeEntities.every((eid) => {
          const e = entities.find((en) => en.id === eid);
          return e ? isEntityComplete(e, completedLevelIds) : false;
        });
        if (allPrevDone) revealed.add(node.id);
      }
      continue;
    }

    const prev = nodes[i - 1];
    const prevEntity = entities.find((e) => e.id === prev.entityId);
    if (prevEntity && isEntityComplete(prevEntity, completedLevelIds)) {
      revealed.add(node.id);
    }
  }

  return [...revealed];
}

export function nodeVisualState(
  node: MapNode,
  revealedNodeIds: string[],
  entity: Entity,
  completedLevelIds: string[],
): NodeVisualState {
  if (!revealedNodeIds.includes(node.id)) return 'fogged';
  if (isEntityComplete(entity, completedLevelIds)) return 'complete';
  return 'active';
}
