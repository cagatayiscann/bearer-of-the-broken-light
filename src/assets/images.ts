import type { ImageSourcePropType } from 'react-native';

/** Biome puzzle backgrounds keyed by Theme id. */
export const biomeBackgrounds: Record<string, ImageSourcePropType> = {
  'whispering-wood': require('../../assets/biomes/whispering-wood-background.png'),
};

/** Entity encounter portraits keyed by Entity id. */
export const entityPortraits: Record<string, ImageSourcePropType> = {
  'grizz-goblin': require('../../assets/entities/grizz-goblin.png'),
  'whisper-wisp': require('../../assets/entities/whisper-wisp.png'),
};

export function getBiomeBackground(themeId: string): ImageSourcePropType | undefined {
  return biomeBackgrounds[themeId];
}

export function getEntityPortrait(entityId: string): ImageSourcePropType | undefined {
  return entityPortraits[entityId];
}
