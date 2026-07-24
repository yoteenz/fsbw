import type { FdsGlassElevation, FdsGlassVariant } from '../tokens/types';

export type FdsGlassConfig = {
  blur: number;
  opacity: number;
  borderGlow: number;
  reflection: number;
  elevation: FdsGlassElevation;
};

export const FDS_GLASS_VARIANTS: Record<FdsGlassVariant, FdsGlassConfig> = {
  card: { blur: 12, opacity: 0.72, borderGlow: 0.5, reflection: 0.35, elevation: 'raised' },
  panel: { blur: 20, opacity: 0.78, borderGlow: 0.6, reflection: 0.4, elevation: 'floating' },
  window: { blur: 16, opacity: 0.68, borderGlow: 0.45, reflection: 0.5, elevation: 'raised' },
  drawer: { blur: 24, opacity: 0.85, borderGlow: 0.55, reflection: 0.3, elevation: 'floating' },
  navigation: { blur: 24, opacity: 0.82, borderGlow: 0.65, reflection: 0.45, elevation: 'floating' },
  modal: { blur: 32, opacity: 0.88, borderGlow: 0.7, reflection: 0.35, elevation: 'modal' },
  sidebar: { blur: 20, opacity: 0.8, borderGlow: 0.5, reflection: 0.4, elevation: 'raised' },
  tooltip: { blur: 8, opacity: 0.92, borderGlow: 0.4, reflection: 0.25, elevation: 'flat' },
  badge: { blur: 6, opacity: 0.75, borderGlow: 0.35, reflection: 0.2, elevation: 'flat' },
  chip: { blur: 8, opacity: 0.7, borderGlow: 0.3, reflection: 0.15, elevation: 'flat' },
};

export const FDS_GLASS_CSS_VARS = {
  '--fds-glass-blur-sm': '8px',
  '--fds-glass-blur-md': '16px',
  '--fds-glass-blur-lg': '24px',
  '--fds-glass-blur-xl': '32px',
  '--fds-glass-fill': 'var(--fds-brand-crystal-glass)',
  '--fds-glass-fill-heavy': 'rgba(255, 255, 255, 0.85)',
  '--fds-glass-border': 'rgba(255, 255, 255, 0.9)',
  '--fds-glass-chrome': 'var(--fds-brand-chrome-silver)',
  '--fds-glass-glow': 'rgba(255, 255, 255, 0.55)',
} as const;

export function fdsGlassClass(variant: FdsGlassVariant): string {
  return `fds-glass fds-glass--${variant}`;
}
