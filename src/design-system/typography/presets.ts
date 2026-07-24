import type { FdsTypographyPreset } from '../tokens/types';

export type FdsTypographySpec = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  letterSpacing: string;
  lineHeight: number;
  textTransform?: 'none' | 'uppercase';
};

export const FDS_TYPOGRAPHY: Record<FdsTypographyPreset, FdsTypographySpec> = {
  'display-xl': {
    fontFamily: 'var(--fds-font-demi)',
    fontSize: 'clamp(2.5rem, 10vw, 5rem)',
    fontWeight: 600,
    letterSpacing: '0.08em',
    lineHeight: 1.05,
    textTransform: 'uppercase',
  },
  'display-large': {
    fontFamily: 'var(--fds-font-demi)',
    fontSize: 'clamp(2rem, 8vw, 4rem)',
    fontWeight: 600,
    letterSpacing: '0.1em',
    lineHeight: 1.08,
    textTransform: 'uppercase',
  },
  hero: {
    fontFamily: 'var(--fds-font-demi)',
    fontSize: 'clamp(1.75rem, 6vw, 3rem)',
    fontWeight: 600,
    letterSpacing: '0.12em',
    lineHeight: 1.1,
    textTransform: 'uppercase',
  },
  'heading-1': {
    fontFamily: 'var(--fds-font-demi)',
    fontSize: 'clamp(1.375rem, 4vw, 2rem)',
    fontWeight: 600,
    letterSpacing: '0.14em',
    lineHeight: 1.15,
    textTransform: 'uppercase',
  },
  'heading-2': {
    fontFamily: 'var(--fds-font-medium)',
    fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
    fontWeight: 500,
    letterSpacing: '0.12em',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
  'heading-3': {
    fontFamily: 'var(--fds-font-medium)',
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 500,
    letterSpacing: '0.1em',
    lineHeight: 1.25,
    textTransform: 'uppercase',
  },
  'body-large': {
    fontFamily: 'var(--fds-font-book)',
    fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
    fontWeight: 400,
    letterSpacing: '0.04em',
    lineHeight: 1.5,
  },
  body: {
    fontFamily: 'var(--fds-font-book)',
    fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)',
    fontWeight: 400,
    letterSpacing: '0.06em',
    lineHeight: 1.55,
  },
  caption: {
    fontFamily: 'var(--fds-font-book)',
    fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)',
    fontWeight: 400,
    letterSpacing: '0.08em',
    lineHeight: 1.4,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: 'var(--fds-font-demi)',
    fontSize: 'clamp(0.625rem, 1.4vw, 0.6875rem)',
    fontWeight: 600,
    letterSpacing: '0.14em',
    lineHeight: 1.3,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: 'var(--fds-font-medium)',
    fontSize: 'clamp(0.6875rem, 1.6vw, 0.8125rem)',
    fontWeight: 500,
    letterSpacing: '0.16em',
    lineHeight: 1,
    textTransform: 'uppercase',
  },
  navigation: {
    fontFamily: 'var(--fds-font-medium)',
    fontSize: 'clamp(0.625rem, 1.4vw, 0.75rem)',
    fontWeight: 500,
    letterSpacing: '0.18em',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
  legal: {
    fontFamily: 'var(--fds-font-book)',
    fontSize: '0.625rem',
    fontWeight: 400,
    letterSpacing: '0.04em',
    lineHeight: 1.45,
  },
};

export const FDS_TYPOGRAPHY_CSS_VARS = {
  '--fds-font-book': '"Futura PT Book", Futura, sans-serif',
  '--fds-font-medium': '"Futura PT Medium", Futura, sans-serif',
  '--fds-font-demi': '"Futura PT Demi", Futura, sans-serif',
  '--fds-font-accent': '"Covered By Your Grace", cursive',
} as const;

export function fdsTypographyClass(preset: FdsTypographyPreset): string {
  return `fds-text-${preset}`;
}
