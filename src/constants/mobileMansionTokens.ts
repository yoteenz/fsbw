/**
 * Frontal Slayer Mansion — mobile design tokens.
 * Central source for colors, typography, spacing, glass effects, and motion.
 */

export const mansionColors = {
  primaryRed: '#EB1C24',
  gray: '#808080',
  grayLight: '#B0B0B0',
  grayMuted: '#C8C8C8',
  white: '#FFFFFF',
  chrome: 'rgba(255, 255, 255, 0.65)',
  chromeBorder: 'rgba(200, 200, 200, 0.45)',
  glassFill: 'rgba(255, 255, 255, 0.72)',
  glassFillHeavy: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.9)',
  overlayDark: 'rgba(255, 255, 255, 0.15)',
  glowWhite: 'rgba(255, 255, 255, 0.6)',
} as const;

export const mansionTypography = {
  serif: '"Playfair Display", "Georgia", "Times New Roman", serif',
  sans: '"Futura PT Book", "Inter", "SF Pro Text", system-ui, sans-serif',
  sansMedium: '"Futura PT Medium", "Inter", "SF Pro Text", system-ui, sans-serif',
  titleSize: '1.375rem',
  titleTracking: '0.18em',
  subtitleSize: '0.625rem',
  subtitleTracking: '0.22em',
  bodySize: '0.75rem',
  bodyTracking: '0.08em',
} as const;

export const mansionSpacing = {
  pagePaddingX: '1.25rem',
  pagePaddingTop: '0.75rem',
  pagePaddingBottom: '6.5rem',
  sectionGap: '1rem',
  cardGap: '0.75rem',
  navHeight: '4.25rem',
  headerHeight: '3.5rem',
  safeAreaBottom: 'env(safe-area-inset-bottom, 0px)',
  safeAreaTop: 'env(safe-area-inset-top, 0px)',
} as const;

export const mansionRadii = {
  panel: '1.75rem',
  card: '1.25rem',
  button: '2rem',
  nav: '2rem',
  listItem: '0.875rem',
  modal: '2rem',
} as const;

export const mansionShadows = {
  panel: '0 8px 32px rgba(255, 255, 255, 0.35), 0 2px 12px rgba(0, 0, 0, 0.04)',
  card: '0 4px 20px rgba(255, 255, 255, 0.4), 0 1px 8px rgba(0, 0, 0, 0.03)',
  nav: '0 -4px 24px rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)',
  glow: '0 0 24px rgba(255, 255, 255, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  button: '0 2px 12px rgba(235, 28, 36, 0.15)',
} as const;

export const mansionBlur = {
  light: 12,
  medium: 20,
  heavy: 32,
  nav: 24,
  background: 8,
} as const;

export const mansionAnimation = {
  durationFast: 0.2,
  durationNormal: 0.35,
  durationSlow: 0.55,
  springStiffness: 280,
  springDamping: 28,
  springMass: 0.8,
} as const;

/** Placeholder background images per page zone (replace with final mansion photography). */
export const mansionPlaceholderBackgrounds = {
  home: '/assets/new-background.jpg',
  lobby: '/assets/new-background.jpg',
  concierge: '/assets/new-background.jpg',
  penthouse: '/assets/new-background.jpg',
  showroom: '/assets/new-background.jpg',
  analysis: '/assets/new-background.jpg',
  buildAWig: '/assets/new-background.jpg',
  rewards: '/assets/new-background.jpg',
  slayCam: '/assets/new-background.jpg',
  lounge: '/assets/new-background.jpg',
  profile: '/assets/new-background.jpg',
} as const;

export type MansionZone = keyof typeof mansionPlaceholderBackgrounds;
