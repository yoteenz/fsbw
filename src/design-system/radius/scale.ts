import type { FdsRadiusToken } from '../tokens/types';

export const FDS_RADIUS: Record<FdsRadiusToken, string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.875rem',
  xl: '1.25rem',
  '2xl': '1.75rem',
  full: '9999px',
};

export const FDS_RADIUS_CSS_VARS = Object.fromEntries(
  Object.entries(FDS_RADIUS).map(([key, value]) => [`--fds-radius-${key}`, value]),
) as Record<`--fds-radius-${FdsRadiusToken}`, string>;

export function fdsRadius(token: FdsRadiusToken): string {
  return `var(--fds-radius-${token})`;
}
