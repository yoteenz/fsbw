/** Milestone 156 — Experience QA™ · Emotional quality intelligence */

export const EXPERIENCE_QA_STORAGE_KEY = 'studioOsExperienceQa_v1';
export const EXPERIENCE_QA_VERSION = '1.0.0';
export const STUDIO_OS_EXPERIENCE_QA_UPDATED = 'studio-os-experience-qa-updated';

export const EXPERIENCE_QA_ACCENT = '#BE185D';

export const EXPERIENCE_QA_PHILOSOPHY = [
  'Experience QA™ evaluates how people feel while using Studio OS — not just whether they successfully completed a task.',
  'Software can function perfectly and still provide a poor experience. Experience QA exists to prevent that.',
  'Studio OS optimizes for confidence, not clicks — effortless, trustworthy, calm, and intelligently designed.',
  'Every interaction should feel premium, emotionally calm, and unmistakably Studio OS.',
] as const;

export const EVALUATION_CATEGORIES = [
  'navigation',
  'information-architecture',
  'cognitive-load',
  'interaction-friction',
  'task-completion',
  'user-confidence',
  'visual-flow',
  'emotional-experience',
  'learning-curve',
  'decision-fatigue',
  'perceived-performance',
  'accessibility',
  'executive-clarity',
] as const;

export const EXPERIENCE_QUESTIONS = [
  'Does this screen feel overwhelming?',
  'Is there unnecessary friction?',
  'Can users predict what happens next?',
  'Does this interaction build confidence?',
  'Is this emotionally calm?',
  'Does this feel premium?',
  'Does this respect the user\'s time?',
  'Does this feel like Studio OS?',
] as const;

export const SIMULATION_PERSONAS = [
  'first-time-user',
  'returning-user',
  'power-user',
  'executive',
  'employee',
  'customer',
  'expert',
  'mobile-user',
  'desktop-user',
  'accessibility-user',
] as const;

export const EXPERIENCE_ISSUE_TYPES = [
  'overwhelming-density',
  'unnecessary-friction',
  'unpredictable-flow',
  'confidence-eroding',
  'emotional-anxiety',
  'not-premium',
  'time-disrespect',
  'not-studio-os-feel',
  'confusion-point',
  'decision-fatigue',
  'learning-barrier',
  'accessibility-gap',
] as const;

export const EXPERIENCE_QA_SEVERITIES = ['critical', 'warning', 'advisory'] as const;

export const EVALUATION_CATEGORY_LABELS: Record<(typeof EVALUATION_CATEGORIES)[number], string> = {
  navigation: 'Navigation',
  'information-architecture': 'Information Architecture',
  'cognitive-load': 'Cognitive Load',
  'interaction-friction': 'Interaction Friction',
  'task-completion': 'Task Completion',
  'user-confidence': 'User Confidence',
  'visual-flow': 'Visual Flow',
  'emotional-experience': 'Emotional Experience',
  'learning-curve': 'Learning Curve',
  'decision-fatigue': 'Decision Fatigue',
  'perceived-performance': 'Perceived Performance',
  accessibility: 'Accessibility',
  'executive-clarity': 'Executive Clarity',
};

export const SIMULATION_PERSONA_LABELS: Record<(typeof SIMULATION_PERSONAS)[number], string> = {
  'first-time-user': 'First-time User',
  'returning-user': 'Returning User',
  'power-user': 'Power User',
  executive: 'Executive',
  employee: 'Employee',
  customer: 'Customer',
  expert: 'Expert',
  'mobile-user': 'Mobile User',
  'desktop-user': 'Desktop User',
  'accessibility-user': 'Accessibility User',
};

export const EXPERIENCE_ISSUE_LABELS: Record<(typeof EXPERIENCE_ISSUE_TYPES)[number], string> = {
  'overwhelming-density': 'Overwhelming Screen Density',
  'unnecessary-friction': 'Unnecessary Friction',
  'unpredictable-flow': 'Unpredictable Flow',
  'confidence-eroding': 'Confidence-Eroding Interaction',
  'emotional-anxiety': 'Emotional Anxiety',
  'not-premium': 'Does Not Feel Premium',
  'time-disrespect': 'Disrespects User Time',
  'not-studio-os-feel': 'Does Not Feel Like Studio OS',
  'confusion-point': 'Point of Confusion',
  'decision-fatigue': 'Decision Fatigue',
  'learning-barrier': 'Learning Barrier',
  'accessibility-gap': 'Accessibility Gap',
};
