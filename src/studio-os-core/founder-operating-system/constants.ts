/** Milestone 118 — Founder Operating System™ V1.0 · Studio OS Version 1 culmination */

export const FOUNDER_OPERATING_SYSTEM_STORAGE_KEY = 'studioOsFounderOperatingSystem_v1';
export const FOUNDER_OPERATING_SYSTEM_VERSION = '1.0.0';
export const STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED = 'studio-os-founder-operating-system-updated';

/** Studio OS V1 final promise — extends Milestone 92 tagline. */
export const STUDIO_OS_V1_FINAL_PROMISE = 'PRESERVE EXPERTISE. BUILD LEGACY. EMPOWER VISIONARIES.';

export const FOUNDER_OS_PHILOSOPHY = [
  'Healthy organizations require healthy leaders — Founder Operating System™ operates the founder while Studio OS operates the organization.',
  'Founders grow first. Organizations follow.',
  'By strengthening the founder, Studio OS strengthens the entire organization.',
] as const;

export const FOUNDER_INTELLIGENCE_DIMENSIONS = [
  'focus-patterns',
  'decision-fatigue',
  'creative-cycles',
  'energy-levels',
  'meeting-load',
  'strategic-time',
  'deep-work-sessions',
  'learning-goals',
  'leadership-development',
  'communication-habits',
  'stress-indicators',
  'growth-areas',
] as const;

export const FOUNDER_INTELLIGENCE_LABELS: Record<(typeof FOUNDER_INTELLIGENCE_DIMENSIONS)[number], string> = {
  'focus-patterns': 'Focus Patterns',
  'decision-fatigue': 'Decision Fatigue',
  'creative-cycles': 'Creative Cycles',
  'energy-levels': 'Energy Levels',
  'meeting-load': 'Meeting Load',
  'strategic-time': 'Strategic Time',
  'deep-work-sessions': 'Deep Work Sessions',
  'learning-goals': 'Learning Goals',
  'leadership-development': 'Leadership Development',
  'communication-habits': 'Communication Habits',
  'stress-indicators': 'Stress Indicators',
  'growth-areas': 'Growth Areas',
};

export const COACHING_CATEGORIES = [
  'leadership-observation',
  'meeting-recommendation',
  'focus-improvement',
  'delegation-opportunity',
  'communication-improvement',
  'learning-recommendation',
  'strategic-reflection',
  'executive-habit',
  'decision-quality',
  'founder-development',
] as const;

export const COACHING_CATEGORY_LABELS: Record<(typeof COACHING_CATEGORIES)[number], string> = {
  'leadership-observation': 'Leadership Observation',
  'meeting-recommendation': 'Meeting Recommendation',
  'focus-improvement': 'Focus Improvement',
  'delegation-opportunity': 'Delegation Opportunity',
  'communication-improvement': 'Communication Improvement',
  'learning-recommendation': 'Learning Recommendation',
  'strategic-reflection': 'Strategic Reflection',
  'executive-habit': 'Executive Habit',
  'decision-quality': 'Decision Quality',
  'founder-development': 'Founder Development',
};

export const FOCUS_PROTECTION_TARGETS = [
  'deep-work',
  'creative-sessions',
  'strategic-planning',
  'personal-learning',
  'recovery-time',
] as const;

export const FOCUS_PROTECTION_LABELS: Record<(typeof FOCUS_PROTECTION_TARGETS)[number], string> = {
  'deep-work': 'Deep Work',
  'creative-sessions': 'Creative Sessions',
  'strategic-planning': 'Strategic Planning',
  'personal-learning': 'Personal Learning',
  'recovery-time': 'Recovery Time',
};

export const FOUNDER_OS_ACCENT = '#7C3AED';
