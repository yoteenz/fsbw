import type { CSSProperties } from 'react';
import type { FsmsLightingConfig } from '../tokens/types';

export type EnvironmentReflectionOptions = {
  lighting: FsmsLightingConfig;
  /** 0–1 animation progress */
  progress?: number;
};

/** Soft environmental sheen — not a mirror. Moves subtly with sweep progress. */
export function buildEnvironmentReflectionStyle(
  options: EnvironmentReflectionOptions,
): CSSProperties {
  const { lighting, progress = 0 } = options;
  const shift = lighting.environmentShift * 100;
  const offset = -20 + progress * 40;

  return {
    backgroundImage: `
      linear-gradient(
        ${105 + lighting.sweepAngleDeg * 0.05}deg,
        transparent ${40 + offset}%,
        rgba(255, 255, 255, ${0.04 + lighting.bloomStrength * 0.15}) ${48 + offset}%,
        rgba(200, 230, 255, ${0.03 + lighting.bloomStrength * 0.1}) ${52 + offset}%,
        transparent ${60 + offset}%
      ),
      radial-gradient(
        ellipse at ${50 + shift}% ${35 - shift * 0.5}%,
        rgba(255, 255, 255, 0.08) 0%,
        transparent 55%
      )
    `,
    opacity: 0.35 + progress * 0.4,
  };
}
