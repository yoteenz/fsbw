/** Milestone 110 — Presence Engine™ V1.0 */

export const PRESENCE_ENGINE_STORAGE_KEY = 'studioOsPresenceEngine_v1';
export const PRESENCE_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_PRESENCE_ENGINE_UPDATED = 'studio-os-presence-engine-updated';

export const PRESENCE_ENGINE_PHILOSOPHY = [
  'People should never feel like they are interacting with software — an intelligent executive partner is always present.',
  'Create calm, confidence, and continuity — never noisy, always reassuring.',
  'Presence inspires confidence, not distraction — always there when needed, never demanding attention.',
] as const;

export const EXECUTIVE_PRESENCE_TYPES = [
  'daily-welcome',
  'acknowledge-accomplishment',
  'celebrate-milestone',
  'recognize-difficult-period',
  'anniversary',
  'customer-milestone',
  'employee-achievement',
  'encouragement',
] as const;

export const EXECUTIVE_PRESENCE_LABELS: Record<(typeof EXECUTIVE_PRESENCE_TYPES)[number], string> = {
  'daily-welcome': 'Daily Welcome',
  'acknowledge-accomplishment': 'Acknowledge Accomplishment',
  'celebrate-milestone': 'Celebrate Milestone',
  'recognize-difficult-period': 'Recognize Difficult Period',
  anniversary: 'Anniversary Recognition',
  'customer-milestone': 'Customer Milestone',
  'employee-achievement': 'Employee Achievement',
  encouragement: 'Encouragement',
};

export const COMMUNICATION_CONTEXTS = [
  'busy-day',
  'creative-session',
  'executive-planning',
  'learning-mode',
  'emergency',
] as const;

export const COMMUNICATION_CONTEXT_LABELS: Record<(typeof COMMUNICATION_CONTEXTS)[number], string> = {
  'busy-day': 'Busy Day',
  'creative-session': 'Creative Session',
  'executive-planning': 'Executive Planning',
  'learning-mode': 'Learning Mode',
  emergency: 'Emergency',
};

export const COMMUNICATION_STYLE_DESCRIPTIONS: Record<(typeof COMMUNICATION_CONTEXTS)[number], string> = {
  'busy-day': 'Concise — essentials only, no elaboration unless requested',
  'creative-session': 'Collaborative — supportive, exploratory, never interrupting flow',
  'executive-planning': 'Strategic — structured, forward-looking, decision-oriented',
  'learning-mode': 'Educational — patient, explanatory, builds understanding',
  emergency: 'Direct — clear, immediate, action-first communication',
};

export const ATMOSPHERE_STATES = ['calm', 'celebratory', 'energized', 'focused'] as const;

export const ATMOSPHERE_STATE_LABELS: Record<(typeof ATMOSPHERE_STATES)[number], string> = {
  calm: 'Calm',
  celebratory: 'Celebratory',
  energized: 'Energized',
  focused: 'Focused',
};

export const ATMOSPHERE_STATE_DESCRIPTIONS: Record<(typeof ATMOSPHERE_STATES)[number], string> = {
  calm: 'Healthy organization — Headquarters reflects steady, reassuring momentum',
  celebratory: 'Major milestone — subtle celebratory atmosphere, professional not theatrical',
  energized: 'Launch day — energized Headquarters environment matching organizational momentum',
  focused: 'Critical issue — focused, calm urgency without alarm or noise',
};
