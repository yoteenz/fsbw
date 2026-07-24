import type { CSSProperties } from 'react';
import { FDS_GLASS_VARIANTS } from '../glass/tokens';
import type { FdsGlassVariant } from '../tokens/types';

export function buildGlassStyle(variant: FdsGlassVariant): CSSProperties {
  const config = FDS_GLASS_VARIANTS[variant];
  return {
    ['--fds-glass-opacity' as string]: config.opacity,
    ['--fds-glass-blur' as string]: `${config.blur}px`,
    ['--fds-glass-border-glow' as string]: config.borderGlow,
    ['--fds-glass-reflection' as string]: config.reflection,
  };
}
