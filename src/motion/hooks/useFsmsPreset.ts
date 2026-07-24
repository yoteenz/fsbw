import { useMemo } from 'react';
import { resolveFsmsPreset, scalePresetTiming } from '../tokens/presets';
import type { FsmsPreset, FsmsPresetId } from '../tokens/types';
import { resolvePresetId } from '../utils/resolvePresetId';

export type UseFsmsPresetOptions = {
  preset?: FsmsPresetId | string;
  duration?: number;
  delay?: number;
};

export type ResolvedFsmsPreset = {
  preset: FsmsPreset;
  timing: ReturnType<typeof scalePresetTiming>;
  presetId: FsmsPresetId;
};

export function useFsmsPreset(options: UseFsmsPresetOptions = {}): ResolvedFsmsPreset {
  const { preset = 'luxury-reveal', duration, delay } = options;

  return useMemo(() => {
    const presetId = resolvePresetId(preset);
    const resolved = resolveFsmsPreset(presetId);
    const timing = scalePresetTiming(resolved, duration, delay);
    return { preset: resolved, timing, presetId };
  }, [preset, duration, delay]);
}
