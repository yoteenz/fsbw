import type { StudioWorldIconProceduralState } from './types';

export type AccessibilityRenderHints = {
  role: string | undefined;
  ariaLabel: string | undefined;
  ariaBusy: boolean;
  ariaDisabled: boolean;
  ariaHidden: boolean;
  focusVisible: boolean;
  touchTargetMinPx: number;
  reducedMotion: boolean;
  highContrast: boolean;
};

export function resolveAccessibilityHints(
  state: StudioWorldIconProceduralState,
  options: {
    label?: string;
    decorative?: boolean;
    reducedMotion?: boolean;
    highContrast?: boolean;
    sizePx?: number;
  } = {}
): AccessibilityRenderHints {
  const { label, decorative = false, reducedMotion = false, highContrast = false, sizePx = 24 } = options;
  const busyStates: StudioWorldIconProceduralState[] = ['loading', 'generating', 'syncing'];
  const disabledStates: StudioWorldIconProceduralState[] = ['disabled', 'locked', 'offline', 'archived'];

  return {
    role: decorative ? undefined : 'img',
    ariaLabel: decorative ? undefined : label,
    ariaBusy: busyStates.includes(state),
    ariaDisabled: disabledStates.includes(state),
    ariaHidden: decorative,
    focusVisible: state === 'focused',
    touchTargetMinPx: Math.max(sizePx, 44),
    reducedMotion,
    highContrast: highContrast || state === 'focused',
  };
}

export function detectReducedMotionPreference(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectHighContrastPreference(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}
