import type { ImageSourcePropType } from 'react-native';

/** Default biome puzzle backgrounds keyed by Theme id. */
export const biomeBackgrounds: Record<string, ImageSourcePropType> = {
  'whispering-wood': require('../../assets/biomes/whispering-wood-background.png'),
};

/** Entity-specific trial atmospheres — override the biome default when set. */
export const entityBackgrounds: Record<string, ImageSourcePropType> = {
  'whisper-wisp': require('../../assets/biomes/whispering-wood-mist.png'),
};

/** Entity encounter portraits keyed by Entity id. */
export const entityPortraits: Record<string, ImageSourcePropType> = {
  'grizz-goblin': require('../../assets/entities/grizz-goblin.png'),
  'whisper-wisp': require('../../assets/entities/whisper-wisp.png'),
};

export function getBiomeBackground(themeId: string): ImageSourcePropType | undefined {
  return biomeBackgrounds[themeId];
}

/** Puzzle/encounter backdrop: entity atmosphere wins over biome default. */
export function getPuzzleBackground(
  entityId: string,
  themeId: string,
): ImageSourcePropType | undefined {
  return entityBackgrounds[entityId] ?? biomeBackgrounds[themeId];
}

export function getEntityPortrait(entityId: string): ImageSourcePropType | undefined {
  return entityPortraits[entityId];
}
