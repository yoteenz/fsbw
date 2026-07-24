import type { FdsShadowToken } from '../tokens/types';

export const FDS_SHADOWS: Record<FdsShadowToken, string> = {
  none: 'none',
  sm: '0 1px 4px rgba(15, 20, 28, 0.04)',
  md: '0 4px 16px rgba(15, 20, 28, 0.06)',
  lg: '0 8px 32px rgba(15, 20, 28, 0.08)',
  xl: '0 16px 48px rgba(15, 20, 28, 0.1)',
  panel: '0 8px 32px rgba(255, 255, 255, 0.35), 0 2px 12px rgba(0, 0, 0, 0.04)',
  glass: '0 4px 20px rgba(255, 255, 255, 0.4), 0 1px 8px rgba(0, 0, 0, 0.03)',
  elevated: '0 0 24px rgba(255, 255, 255, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
};

export const FDS_SHADOW_CSS_VARS = Object.fromEntries(
  Object.entries(FDS_SHADOWS).map(([key, value]) => [`--fds-shadow-${key}`, value]),
) as Record<`--fds-shadow-${FdsShadowToken}`, string>;

export function fdsShadow(token: FdsShadowToken): string {
  return `var(--fds-shadow-${token})`;
}
