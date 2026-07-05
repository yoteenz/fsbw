export const LEADERSHIP_DNA_STORAGE_KEY = 'studioOsLeadershipDna_v1';
export const LEADERSHIP_DNA_VERSION = '1.0.0';
export const LEADERSHIP_DNA_ID = 'leadership-dna';

export const LEADERSHIP_DNA_CONNECTED_LAYERS = [
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Memory Bible',
  'Knowledge Graph',
  'Chief of Staff',
  'Studio Intelligence',
] as const;

export const LEADERSHIP_PROFILE_SECTION_IDS = [
  'leadership-philosophy',
  'decision-framework',
  'communication-style',
  'creative-philosophy',
  'management-philosophy',
  'risk-profile',
  'delegation-profile',
  'approval-philosophy',
  'feedback-philosophy',
  'growth-philosophy',
  'long-term-vision',
] as const;

export const LEADERSHIP_PROFILE_TITLES: Record<(typeof LEADERSHIP_PROFILE_SECTION_IDS)[number], string> = {
  'leadership-philosophy': 'LEADERSHIP PHILOSOPHY',
  'decision-framework': 'DECISION FRAMEWORK',
  'communication-style': 'COMMUNICATION STYLE',
  'creative-philosophy': 'CREATIVE PHILOSOPHY',
  'management-philosophy': 'MANAGEMENT PHILOSOPHY',
  'risk-profile': 'RISK PROFILE',
  'delegation-profile': 'DELEGATION PROFILE',
  'approval-philosophy': 'APPROVAL PHILOSOPHY',
  'feedback-philosophy': 'FEEDBACK PHILOSOPHY',
  'growth-philosophy': 'GROWTH PHILOSOPHY',
  'long-term-vision': 'LONG-TERM VISION',
};

export const ENDURING_LEADERSHIP_PRINCIPLES = [
  'Build systems before scaling',
  'Institutional knowledge over tribal knowledge',
  'Clarity over complexity',
  'Quality over speed when appropriate',
  'Remove barriers without lowering standards',
  'Founders should lead organizations, not tasks',
  'Protect founder attention',
  'Automation should increase judgment, not replace it',
] as const;
