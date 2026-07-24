import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';
import { buildEnvironmentReflectionStyle } from '../engine/reflections';
import { generateSparkleField } from '../engine/sparkles';
import { LightSweep } from './LightSweep';
import { SparkleSystem } from './SparkleSystem';
import { useCrystalReveal } from '../hooks/useCrystalReveal';
import type { CrystalTextProps } from '../tokens/types';

export type CrystalTextBaseProps = CrystalTextProps & {
  sizeClass?: string;
  defaultSize?: CrystalTextProps['size'];
};

function materialOpacity(phase: string): number {
  switch (phase) {
    case 'sparkle':
      return 0.12;
    case 'sweep':
      return 0.72;
    case 'hold':
      return 1;
    case 'dissolve':
      return 0.15;
    case 'complete':
      return 0;
    default:
      return 0;
  }
}

export function CrystalTextBase({
  text,
  children,
  className = '',
  style,
  preset = 'luxury-reveal',
  align = 'center',
  duration,
  delay,
  loop,
  autoPlay = true,
  size = 'display',
  as: Tag = 'h1',
  'aria-label': ariaLabel,
}: CrystalTextBaseProps) {
  const content = children ?? text ?? '';
  const seed = typeof content === 'string' ? content : 'fsms-crystal';
  const { phase, progress, timing, preset: resolvedPreset, lighting } = useCrystalReveal({
    preset,
    duration,
    delay,
    loop,
    autoPlay,
  });

  const opacity = materialOpacity(phase);
  const envStyle = useMemo(
    () => buildEnvironmentReflectionStyle({ lighting, progress }),
    [lighting, progress],
  );

  const sparkles = useMemo(
    () =>
      generateSparkleField({
        seed,
        density: resolvedPreset.sparkleDensity,
        phaseOffsetMs: timing.delay,
      }),
    [seed, resolvedPreset.sparkleDensity, timing.delay],
  );

  const rootStyle: CSSProperties = {
    ...style,
    '--fsms-material-opacity': opacity,
    '--fsms-bloom-strength': resolvedPreset.bloom,
    '--fsms-env-opacity': lighting.environmentShift + 0.3,
    '--fsms-phase-ms': `${timing.dissolve || 800}ms`,
  } as CSSProperties;

  const sizeClass = `fsms-crystal-text--${size}`;

  return (
    <div
      className={`fsms-root fsms-root--align-${align} ${className}`.trim()}
      style={rootStyle}
      aria-label={ariaLabel}
    >
      <Tag className={`fsms-crystal-text ${sizeClass}`} style={{ opacity: opacity > 0 ? 1 : 0.01 }}>
        {content}
        <span className="fsms-crystal-text__bevel" aria-hidden />
        <span className="fsms-crystal-text__env" style={envStyle} aria-hidden />
        <span className="fsms-crystal-text__bloom" aria-hidden />
        <LightSweep
          active={phase === 'sweep' || phase === 'hold'}
          intensity={resolvedPreset.sweepIntensity}
          angleDeg={lighting.sweepAngleDeg}
          durationMs={timing.sweep}
        />
        {(phase === 'sparkle' || phase === 'sweep') && (
          <SparkleSystem sparkles={sparkles} active={phase === 'sparkle' || phase === 'sweep'} />
        )}
      </Tag>
    </div>
  );
}

export type { ReactNode };
