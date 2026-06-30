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
