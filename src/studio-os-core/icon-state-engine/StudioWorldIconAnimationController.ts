import type { StudioWorldIconProceduralState } from './types';
import type { IconAnimationPreset } from './types';

export type AnimationConfig = {
  preset: IconAnimationPreset;
  durationMs: number;
  easing: string;
  interruptible: boolean;
  cssClass: string;
};

const STATE_ANIMATIONS: Record<StudioWorldIconProceduralState, AnimationConfig> = {
  default: { preset: 'none', durationMs: 0, easing: 'ease', interruptible: true, cssClass: '' },
  hover: { preset: 'illuminate', durationMs: 150, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--hover' },
  active: { preset: 'illuminate', durationMs: 180, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--active' },
  focused: { preset: 'pulse', durationMs: 1600, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--focused' },
  pressed: { preset: 'soft-scale', durationMs: 100, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--pressed' },
  selected: { preset: 'illuminate', durationMs: 200, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--selected' },
  disabled: { preset: 'none', durationMs: 0, easing: 'ease', interruptible: true, cssClass: '' },
  locked: { preset: 'none', durationMs: 0, easing: 'ease', interruptible: true, cssClass: 'swi-anim--locked' },
  generating: { preset: 'energy-flow', durationMs: 1200, easing: 'linear', interruptible: true, cssClass: 'swi-anim--generating' },
  loading: { preset: 'breathe', durationMs: 1800, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--loading' },
  success: { preset: 'sparkle', durationMs: 600, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--success' },
  warning: { preset: 'pulse', durationMs: 1400, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--warning' },
  error: { preset: 'illuminate', durationMs: 800, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--error' },
  approved: { preset: 'sparkle', durationMs: 500, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--approved' },
  rejected: { preset: 'fade', durationMs: 400, easing: 'ease-out', interruptible: true, cssClass: 'swi-anim--rejected' },
  archived: { preset: 'fade', durationMs: 0, easing: 'ease', interruptible: true, cssClass: '' },
  premium: { preset: 'sparkle', durationMs: 2000, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--premium' },
  new: { preset: 'pulse', durationMs: 1200, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--new' },
  favorite: { preset: 'pulse', durationMs: 1000, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--favorite' },
  pinned: { preset: 'none', durationMs: 0, easing: 'ease', interruptible: true, cssClass: 'swi-anim--pinned' },
  ai: { preset: 'material-shift', durationMs: 2400, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--ai' },
  live: { preset: 'pulse', durationMs: 900, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--live' },
  syncing: { preset: 'edge-trace', durationMs: 1500, easing: 'linear', interruptible: true, cssClass: 'swi-anim--syncing' },
  offline: { preset: 'none', durationMs: 0, easing: 'ease', interruptible: true, cssClass: '' },
  beta: { preset: 'pulse', durationMs: 1800, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--beta' },
  experimental: { preset: 'edge-trace', durationMs: 2000, easing: 'linear', interruptible: true, cssClass: 'swi-anim--experimental' },
  future: { preset: 'material-shift', durationMs: 3000, easing: 'ease-in-out', interruptible: true, cssClass: 'swi-anim--future' },
};

export function resolveAnimation(
  state: StudioWorldIconProceduralState,
  animated: boolean,
  reducedMotion: boolean
): AnimationConfig {
  const config = STATE_ANIMATIONS[state] ?? STATE_ANIMATIONS.default;
  if (!animated || reducedMotion) {
    return { ...config, preset: 'none', durationMs: 0, cssClass: '' };
  }
  return config;
}

export function isAnimationInterruptible(_preset: IconAnimationPreset): boolean {
  return true;
}

export const HOVER_MAX_DURATION_MS = 150;
