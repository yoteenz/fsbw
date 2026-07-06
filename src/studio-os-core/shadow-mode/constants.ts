/** Milestone 102 — Shadow Mode™ V1.0 */

export const SHADOW_MODE_STORAGE_KEY = 'studioOsShadowMode_v1';
export const SHADOW_MODE_VERSION = '1.0.0';
export const STUDIO_OS_SHADOW_MODE_UPDATED = 'studio-os-shadow-mode-updated';

export const SHADOW_MODE_PHILOSOPHY = [
  'Trust should be earned — Digital Staff should learn before they automate.',
  'Observation comes before execution — nothing happens invisibly.',
  'Every Concierge behaves like an exceptional new employee who learns the organization first.',
  'Studio OS earns trust through observation before automation.',
] as const;

export const SHADOW_LEARNING_PHASES = ['observe', 'recommend', 'assist', 'automate'] as const;

export const SHADOW_CONFIDENCE_DIMENSIONS = [
  'knowledge-confidence',
  'workflow-confidence',
  'decision-confidence',
  'automation-readiness',
] as const;

/** Default founder thresholds for phase progression (overall confidence %). */
export const DEFAULT_PHASE_THRESHOLDS = {
  observeMax: 40,
  recommendMax: 60,
  assistMax: 80,
  automateMin: 81,
} as const;

/** Default automation readiness threshold — never automate below this. */
export const DEFAULT_AUTOMATION_THRESHOLD = 85;

export const PHASE_DESCRIPTIONS = {
  observe: {
    label: 'Phase 1 · Observe',
    summary: 'Watch workflows · study decisions · learn patterns · no automation.',
  },
  recommend: {
    label: 'Phase 2 · Recommend',
    summary: 'Suggest improvements · highlight opportunities · founder approval required.',
  },
  assist: {
    label: 'Phase 3 · Assist',
    summary: 'Perform portions of approved workflows · request confirmation before completion.',
  },
  automate: {
    label: 'Phase 4 · Automate',
    summary: 'Execute recurring workflows independently within approved boundaries.',
  },
} as const;
