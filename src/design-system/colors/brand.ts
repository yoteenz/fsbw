/** Frontal Slayer brand palette — canonical source values */

export const FDS_BRAND_COLORS = {
  primaryRed: '#EB1C24',
  pureWhite: '#FFFFFF',
  chromeSilver: 'rgba(255, 255, 255, 0.65)',
  crystalGlass: 'rgba(255, 255, 255, 0.72)',
  luxuryMarble: "url('/assets/marble-half.png')",
  softGray: '#808080',
  grayLight: '#B0B0B0',
  grayMuted: '#C8C8C8',
  black: '#1A1A1A',
} as const;

export type FdsBrandColorKey = keyof typeof FDS_BRAND_COLORS;
