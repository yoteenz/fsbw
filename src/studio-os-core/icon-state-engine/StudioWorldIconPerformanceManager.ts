import type { StudioWorldIconProceduralState } from './types';
import type { IconAnimationPreset } from './types';

export type PerformanceProfile = {
  gpuAccelerated: boolean;
  willChange: string | null;
  repaintSafe: boolean;
  useTransform: boolean;
  useFilter: boolean;
  useOpacity: boolean;
};

const ANIMATED_STATES: StudioWorldIconProceduralState[] = [
  'generating',
  'loading',
  'focused',
  'warning',
  'live',
  'ai',
  'syncing',
  'success',
  'premium',
];

export function resolvePerformanceProfile(
  state: StudioWorldIconProceduralState,
  animation: IconAnimationPreset
): PerformanceProfile {
  const isAnimated = animation !== 'none' || ANIMATED_STATES.includes(state);
  return {
    gpuAccelerated: true,
    willChange: isAnimated ? 'transform, opacity, filter' : null,
    repaintSafe: !isAnimated,
    useTransform: state === 'pressed' || state === 'hover',
    useFilter: true,
    useOpacity: state === 'disabled' || state === 'loading' || state === 'locked',
  };
}

export function shouldThrottleAnimations(activeIconCount: number): boolean {
  return activeIconCount > 48;
}
