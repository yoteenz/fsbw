/** Milestone 161 — Release Readiness™ · Production is a privilege, not a destination */

export const RELEASE_READINESS_STORAGE_KEY = 'studioOsReleaseReadiness_v1';
export const RELEASE_READINESS_VERSION = '1.0.0';
export const STUDIO_OS_RELEASE_READINESS_UPDATED = 'studio-os-release-readiness-updated';

export const RELEASE_READINESS_ACCENT = '#059669';

export const RELEASE_READINESS_PHILOSOPHY = [
  'Release Readiness™ is the final approval gate before any feature, workflow, Profession Brain™, automation, or system update reaches production.',
  'No feature should ship simply because it functions — it should ship because every major discipline has approved it.',
  'Production should become a privilege—not a destination. Every release should earn the right to reach users.',
  'Studio OS should make organizations confident before deployment—not hopeful afterward.',
] as const;

export const RELEASE_DISCIPLINES = [
  'design-compliance',
  'prompt-qa',
  'experience-qa',
  'visual-diff',
  'accessibility',
  'performance',
  'regression',
  'security',
  'trust',
  'simulation',
  'guardian',
  'documentation',
] as const;

export const RELEASE_GATES = [
  'not-ready',
  'needs-review',
  'ready-for-qa',
  'ready-for-executive-review',
  'production-ready',
] as const;

export const READINESS_RISK_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const APPROVAL_STATUSES = ['approved', 'conditional', 'blocked'] as const;

export const RELEASE_DISCIPLINE_LABELS: Record<(typeof RELEASE_DISCIPLINES)[number], string> = {
  'design-compliance': 'Design Compliance™',
  'prompt-qa': 'Prompt QA™',
  'experience-qa': 'Experience QA™',
  'visual-diff': 'Visual Diff™',
  accessibility: 'Accessibility™',
  performance: 'Performance™',
  regression: 'Regression™',
  security: 'Security™',
  trust: 'Trust™',
  simulation: 'Simulation™',
  guardian: 'Guardian™',
  documentation: 'Documentation™',
};

export const RELEASE_GATE_LABELS: Record<(typeof RELEASE_GATES)[number], string> = {
  'not-ready': 'Not Ready',
  'needs-review': 'Needs Review',
  'ready-for-qa': 'Ready for QA',
  'ready-for-executive-review': 'Ready for Executive Review',
  'production-ready': 'Production Ready',
};
