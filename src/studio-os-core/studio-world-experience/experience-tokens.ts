/**
 * Experience Tokens™ — global reusable constants for motion, presence, and interaction.
 * Visual design tokens describe appearance; experience tokens describe behavior.
 */

export const EXPERIENCE_TOKENS = {
  revealSpeedMs: 280,
  collapseDelayMs: 120,
  collapseDurationMs: 220,
  orbRadiusPx: 48,
  glassBlurPx: 12,
  projectionDistancePx: 24,
  informationDensity: 'low' as const,
  ambientNoiseLevel: 0,
  interactionWeight: 'light' as const,
  motionCurvature: 'ease-out-cubic' as const,
  presenceThreshold: 1 as const,
  maxAmbientElements: 3,
  sceneTrayMinTouchPx: 32,
  railCompactWidthPx: 48,
  railExpandedWidthPx: 168,
  teachingLineFadeMs: 400,
  layerTransitionMs: 350,
  focusRingOpacity: 0.75,
} as const;

export type ExperienceTokenId = keyof typeof EXPERIENCE_TOKENS;

/** CSS custom properties injected by Global Experience Shell */
export function experienceTokensAsCssVars(): Record<string, string> {
  return {
    '--sw-exp-reveal-speed': `${EXPERIENCE_TOKENS.revealSpeedMs}ms`,
    '--sw-exp-collapse-delay': `${EXPERIENCE_TOKENS.collapseDelayMs}ms`,
    '--sw-exp-collapse-duration': `${EXPERIENCE_TOKENS.collapseDurationMs}ms`,
    '--sw-exp-orb-radius': `${EXPERIENCE_TOKENS.orbRadiusPx}px`,
    '--sw-exp-glass-blur': `${EXPERIENCE_TOKENS.glassBlurPx}px`,
    '--sw-exp-projection-distance': `${EXPERIENCE_TOKENS.projectionDistancePx}px`,
    '--sw-exp-layer-transition': `${EXPERIENCE_TOKENS.layerTransitionMs}ms`,
    '--sw-exp-rail-compact': `${EXPERIENCE_TOKENS.railCompactWidthPx}px`,
    '--sw-exp-rail-expanded': `${EXPERIENCE_TOKENS.railExpandedWidthPx}px`,
    '--sw-exp-presence-threshold': String(EXPERIENCE_TOKENS.presenceThreshold),
  };
}
