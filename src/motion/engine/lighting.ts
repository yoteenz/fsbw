import type { FsmsLightingConfig, FsmsPreset } from '../tokens/types';

export const DEFAULT_LIGHTING: FsmsLightingConfig = {
  sweepAngleDeg: 112,
  highlightOpacity: 0.72,
  bloomStrength: 0.14,
  environmentShift: 0.08,
};

export function buildLightingFromPreset(preset: FsmsPreset): FsmsLightingConfig {
  return {
    sweepAngleDeg: preset.id === 'sunlight-sweep' ? 128 : 112,
    highlightOpacity: 0.55 + preset.sweepIntensity * 0.35,
    bloomStrength: preset.bloom,
    environmentShift: 0.06 + preset.sweepIntensity * 0.06,
  };
}

export function sweepKeyframes(angleDeg: number): string {
  return `${angleDeg}deg`;
}
