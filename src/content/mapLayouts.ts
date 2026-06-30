/**
 * World-map placement data (DATA ONLY — no logic). See GAME_DESIGN.md §4/§6.
 * Coordinates are 0–1 relative to the world-map image (assets/world-map.png),
 * tuned to the painted regions so markers sit on the journey trail.
 */

/** A playable entity node placed on the world map. */
export interface MapNodePosition {
  entityId: string;
  x: number;
  y: number;
}

/** A region label for the full biome arc (atmosphere + visible end point). */
export interface RegionLabel {
  /** Matches a Theme id once that biome is built; future biomes have no theme yet. */
  themeId: string;
  name: string;
  /** Journey order (1 = start). */
  order: number;
  x: number;
  y: number;
}

/** Entity node positions, placed in their biome region on the art. */
export const worldMapNodes: MapNodePosition[] = [
  // Whispering Wood — the forest in the lower-left, along the trail's start.
  { entityId: 'grizz-goblin', x: 0.22, y: 0.85 },
  { entityId: 'whisper-wisp', x: 0.4, y: 0.66 },
];

/** The full biome arc, positioned over the painted regions. */
export const worldRegions: RegionLabel[] = [
  { themeId: 'whispering-wood', name: 'Whispering Wood', order: 1, x: 0.14, y: 0.6 },
  { themeId: 'drowned-fen', name: 'Drowned Fen', order: 2, x: 0.42, y: 0.82 },
  { themeId: 'ash-desert', name: 'Ash Desert', order: 3, x: 0.28, y: 0.26 },
  { themeId: 'frostpeak', name: 'Frostpeak', order: 4, x: 0.55, y: 0.14 },
  { themeId: 'sunken-city', name: 'Sunken City', order: 5, x: 0.78, y: 0.42 },
  { themeId: 'ember-deep', name: 'Ember Deep', order: 6, x: 0.72, y: 0.84 },
  { themeId: 'shattered-spire', name: 'The Shattered Spire', order: 7, x: 0.88, y: 0.18 },
];

export const getNodePosition = (entityId: string) =>
  worldMapNodes.find((n) => n.entityId === entityId);
