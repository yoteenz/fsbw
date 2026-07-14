/** Studio World Icon System — theme compatibility architecture. */
export const STUDIO_WORLD_ICON_THEMES = [
  'studio-dark',
  'studio-light',
  'luxury-gold',
  'monochrome',
  'presentation',
  'accessibility',
] as const;

export type StudioWorldIconTheme = (typeof STUDIO_WORLD_ICON_THEMES)[number];

export type StudioWorldIconThemeCompatibility = Partial<Record<StudioWorldIconTheme, boolean>>;

export const STUDIO_WORLD_ICON_DESIGN_TOKENS = {
  strokeWidth: 1,
  cornerRadius: 2,
  opticalWeight: 1,
  glowIntensity: 0.12,
  highlightIntensity: 0.08,
  chromeEdge: 0.04,
  glassDepth: 0.16,
  padding: 0,
  safeArea: 2,
  minimumSize: 10,
  maximumSize: 48,
  pixelGrid: 1,
  subpixelSnap: true,
  scaleStep: 0.25,
  deviceScales: {
    mobile: 1,
    tablet: 1.125,
    desktop: 1,
    tv: 1.5,
    ar: 1.25,
    vr: 1.25,
  },
} as const;

export type StudioWorldIconDesignTokens = typeof STUDIO_WORLD_ICON_DESIGN_TOKENS;
