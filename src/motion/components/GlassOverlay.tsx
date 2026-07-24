import type { CSSProperties } from 'react';
import { useCrystalReveal } from '../hooks/useCrystalReveal';
import type { FsmsBaseProps } from '../tokens/types';

export type GlassOverlayProps = FsmsBaseProps & {
  intensity?: number;
};

export function GlassOverlay({
  preset = 'morning-reveal',
  duration,
  delay,
  autoPlay = true,
  intensity = 1,
  className = '',
  style,
}: GlassOverlayProps) {
  const { phase } = useCrystalReveal({ preset, duration, delay, autoPlay });
  const visible = phase === 'sweep' || phase === 'hold' || phase === 'dissolve';

  const rootStyle: CSSProperties = {
    ...style,
    ['--fsms-overlay-opacity' as string]: visible ? 0.35 * intensity : 0,
  };

  return <div className={`fsms-glass-overlay ${className}`.trim()} style={rootStyle} aria-hidden />;
}
