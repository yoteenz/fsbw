/** Milestone 130 — Interaction Engine™ V1.0 */

export const INTERACTION_ENGINE_STORAGE_KEY = 'studioOsInteractionEngine_v1';
export const INTERACTION_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_INTERACTION_ENGINE_UPDATED = 'studio-os-interaction-engine-updated';

export const INTERACTION_ENGINE_ACCENT = '#0891B2';

export const INTERACTION_ENGINE_PHILOSOPHY = [
  'Users should never relearn how Studio OS behaves — every interaction feels familiar and intentional.',
  'The Interaction Engine™ is the behavioral source of truth for every Studio OS surface.',
  'Behavior is a platform asset — not page-specific code.',
  'Every click should feel intentional. Every interaction reinforces familiarity.',
] as const;

/** Standardized interaction pattern categories */
export const INTERACTION_PATTERN_TYPES = [
  'pointer',
  'gesture',
  'navigation',
  'feedback',
  'data-action',
  'overlay',
  'input',
  'system',
] as const;

/** Canonical interaction states every interactive component should support */
export const INTERACTION_STATES = [
  'idle',
  'hover',
  'focused',
  'pressed',
  'loading',
  'disabled',
  'selected',
  'expanded',
  'collapsed',
  'success',
  'warning',
  'error',
  'pending',
  'archived',
  'hidden',
] as const;

/** Motion standard categories */
export const MOTION_STANDARD_TYPES = [
  'timing',
  'easing',
  'transition',
  'spring',
  'panel',
  'drawer',
  'glass',
  'micro',
  'celebration',
  'notification',
] as const;

/** Accessibility requirement categories */
export const ACCESSIBILITY_REQUIREMENTS = [
  'keyboard',
  'touch',
  'mouse',
  'screen-reader',
  'reduced-motion',
  'high-contrast',
  'focus-indicator',
] as const;

/** Canonical motion values — aligned with Design Token Engine™ */
export const MOTION_DEFAULTS = {
  fastMs: 150,
  standardMs: 250,
  panelMs: 300,
  drawerMs: 320,
  celebrationMs: 600,
  easingStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easingSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  reducedMotion: 'prefers-reduced-motion: reduce',
} as const;
