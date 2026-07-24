import type { FdsSpacingToken } from '../tokens/types';

/** 8-point spacing system — never use arbitrary values */
export const FDS_SPACING: Record<FdsSpacingToken, string> = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
};

export const FDS_SPACING_CSS_VARS = Object.fromEntries(
  Object.entries(FDS_SPACING).map(([key, value]) => [`--fds-space-${key}`, value]),
) as Record<`--fds-space-${FdsSpacingToken}`, string>;

export function fdsSpacing(token: FdsSpacingToken): string {
  return `var(--fds-space-${token})`;
}
