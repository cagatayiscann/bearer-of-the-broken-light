/** Shared visual tokens. Dark, atmospheric, LotR-journey feel. */
export const colors = {
  bg: '#0E0B14',
  bgElevated: '#1A1422',
  surface: '#241A30',
  border: '#3A2D4A',
  text: '#EDE7F6',
  textMuted: '#A99CBF',
  accent: '#C9A227', // broken-light gold
  accentSoft: '#E6C34A',
  danger: '#C0392B',
  success: '#5FB07A',
  fog: '#15101D',
  /** Journey map / diorama palette (Hand-of-Fate-inspired tabletop). */
  mapWood: '#3D2817',
  mapWoodLight: '#6B4423',
  mapWoodDark: '#26180F',
  mapSkyTop: '#2A3548',
  mapSkyBottom: '#141C24',
  mapHill: '#2A4030',
  mapHillLight: '#3D5A42',
  mapHillFar: '#1E2E38',
  mapWater: '#1A3340',
  mapMist: 'rgba(14, 11, 20, 0.72)',
  /** Puzzle overlay — glass panels & rune discs over biome art. */
  puzzleGlass: 'rgba(18, 12, 26, 0.58)',
  puzzleGlassStrong: 'rgba(14, 10, 22, 0.78)',
  puzzleGoldBorder: 'rgba(201, 162, 39, 0.42)',
  puzzleGoldGlow: 'rgba(230, 195, 74, 0.22)',
  puzzleCellEmpty: 'rgba(10, 7, 16, 0.5)',
  puzzleCellRevealed: 'rgba(30, 22, 40, 0.88)',
  puzzleParchment: 'rgba(36, 28, 20, 0.72)',
  puzzleRuneDisc: 'rgba(22, 16, 30, 0.82)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const font = {
  title: 28,
  heading: 22,
  body: 16,
  small: 13,
} as const;
