import { FDS_BRAND_COLORS } from './brand';

/** CSS custom properties for the Frontal Slayer Design System */
export const FDS_CSS_VARS = {
  /* Brand */
  '--fds-brand-primary-red': FDS_BRAND_COLORS.primaryRed,
  '--fds-brand-white': FDS_BRAND_COLORS.pureWhite,
  '--fds-brand-chrome-silver': FDS_BRAND_COLORS.chromeSilver,
  '--fds-brand-crystal-glass': FDS_BRAND_COLORS.crystalGlass,
  '--fds-brand-luxury-marble': FDS_BRAND_COLORS.luxuryMarble,
  '--fds-brand-soft-gray': FDS_BRAND_COLORS.softGray,

  /* Semantic */
  '--fds-color-primary': FDS_BRAND_COLORS.primaryRed,
  '--fds-color-secondary': FDS_BRAND_COLORS.black,
  '--fds-color-accent': FDS_BRAND_COLORS.primaryRed,
  '--fds-color-success': '#2D6A4F',
  '--fds-color-warning': '#B8860B',
  '--fds-color-danger': FDS_BRAND_COLORS.primaryRed,
  '--fds-color-neutral': FDS_BRAND_COLORS.softGray,
  '--fds-color-background': FDS_BRAND_COLORS.pureWhite,
  '--fds-color-surface': 'rgba(255, 255, 255, 0.6)',
  '--fds-color-glass': FDS_BRAND_COLORS.crystalGlass,
  '--fds-color-overlay': 'rgba(255, 255, 255, 0.15)',
  '--fds-color-border': 'rgba(200, 200, 200, 0.45)',
  '--fds-color-shadow': 'rgba(15, 20, 28, 0.08)',
  '--fds-color-text-primary': FDS_BRAND_COLORS.black,
  '--fds-color-text-secondary': FDS_BRAND_COLORS.softGray,
  '--fds-color-disabled': FDS_BRAND_COLORS.grayMuted,
  '--fds-color-interactive': FDS_BRAND_COLORS.primaryRed,
  '--fds-color-hover': '#C91820',
  '--fds-color-pressed': '#A8141A',
  '--fds-color-focus': 'rgba(235, 28, 36, 0.35)',
} as const;

export function applyFdsCssVariables(el: HTMLElement = document.documentElement): void {
  Object.entries(FDS_CSS_VARS).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
}
