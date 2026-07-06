/** Milestone 146 — AI Red Team™ · Adversarial stress testing layer */

export const AI_RED_TEAM_STORAGE_KEY = 'studioOsAiRedTeam_v1';
export const AI_RED_TEAM_VERSION = '1.0.0';
export const STUDIO_OS_AI_RED_TEAM_UPDATED = 'studio-os-ai-red-team-updated';

export const AI_RED_TEAM_ACCENT = '#DC2626';

export const AI_RED_TEAM_PHILOSOPHY = [
  'The AI Red Team™ assumes everything is wrong until proven otherwise.',
  'Its purpose is not to criticize — it makes every organization stronger before users discover weaknesses.',
  'Continuously challenge, stress test, and intentionally attempt to break Studio OS.',
  'Question everything — so users never have to.',
] as const;

export const RED_TEAM_EXPOSURE_TARGETS = [
  'profession-brain-contradictions',
  'broken-workflows',
  'prompt-conflicts',
  'hallucination-risks',
  'permission-loopholes',
  'security-vulnerabilities',
  'automation-failures',
  'knowledge-inconsistencies',
  'duplicate-documentation',
  'broken-onboarding',
  'infinite-loops',
  'logic-errors',
  'weak-recommendations',
  'poor-ux',
  'incomplete-edge-cases',
] as const;

export const RED_TEAM_CHALLENGES = [
  'customer-skips-step',
  'incomplete-upload',
  'simultaneous-automations',
  'conflicting-brain-advice',
  'integration-unavailable',
] as const;

export const RED_TEAM_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const;

export const RED_TEAM_FINDING_STATUSES = ['open', 'acknowledged', 'mitigated', 'dismissed'] as const;

export const RED_TEAM_CHALLENGE_QUERIES = [
  'What if the customer skips this step?',
  'What if the uploaded data is incomplete?',
  'What if two automations trigger simultaneously?',
  'What if the Profession Brain gives conflicting advice?',
  'What if an integration becomes unavailable?',
] as const;
