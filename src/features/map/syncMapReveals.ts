import { entities, themes } from '../../content';
import { useGameStore } from '../../store/useGameStore';
import { buildMapNodes, computeRevealedNodes } from './fog';

/** Recompute map fog from current progress and persist to the store. */
export function syncMapReveals(): void {
  const { completedLevelIds, revealedNodeIds } = useGameStore.getState();
  const nodes = buildMapNodes(themes, entities);
  const next = computeRevealedNodes(
    nodes,
    themes,
    entities,
    completedLevelIds,
    revealedNodeIds,
  );
  useGameStore.setState({ revealedNodeIds: next });
}
