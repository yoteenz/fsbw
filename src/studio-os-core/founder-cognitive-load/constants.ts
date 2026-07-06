/** Milestone 109 — Founder Cognitive Load™ V1.0 */

export const FOUNDER_COGNITIVE_LOAD_STORAGE_KEY = 'studioOsFounderCognitiveLoad_v1';
export const FOUNDER_COGNITIVE_LOAD_VERSION = '1.0.0';
export const STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED = 'studio-os-founder-cognitive-load-updated';

export const COGNITIVE_LOAD_PHILOSOPHY = [
  'Founders do not need more information — they need better prioritization.',
  'Studio OS understands mental workload and continuously protects founder attention.',
  'Attention is the organization\'s most valuable resource — protecting it is a primary responsibility.',
] as const;

export const COGNITIVE_FACTORS = [
  'calendar-density',
  'pending-approvals',
  'decision-fatigue',
  'unread-communications',
  'department-requests',
  'revenue-pressure',
  'launch-activity',
  'customer-issues',
  'meeting-load',
  'creative-workload',
  'strategic-workload',
] as const;

export const COGNITIVE_FACTOR_LABELS: Record<(typeof COGNITIVE_FACTORS)[number], string> = {
  'calendar-density': 'Calendar Density',
  'pending-approvals': 'Pending Approvals',
  'decision-fatigue': 'Decision Fatigue',
  'unread-communications': 'Unread Communications',
  'department-requests': 'Department Requests',
  'revenue-pressure': 'Revenue Pressure',
  'launch-activity': 'Launch Activity',
  'customer-issues': 'Customer Issues',
  'meeting-load': 'Meeting Load',
  'creative-workload': 'Creative Workload',
  'strategic-workload': 'Strategic Workload',
};

export const ATTENTION_MODES = [
  'creating',
  'reviewing',
  'presenting',
  'traveling',
  'in-meetings',
  'strategic-deep-work',
] as const;

export const ATTENTION_MODE_LABELS: Record<(typeof ATTENTION_MODES)[number], string> = {
  creating: 'Creating',
  reviewing: 'Reviewing',
  presenting: 'Presenting',
  traveling: 'Traveling',
  'in-meetings': 'In Meetings',
  'strategic-deep-work': 'Strategic Deep Work',
};

export const FILTERING_ACTIONS = [
  'delay-non-critical',
  'batch-decisions',
  'reduce-interruptions',
  'summarize-information',
  'escalate-urgent-only',
  'protect-focus',
] as const;

export const FILTERING_ACTION_LABELS: Record<(typeof FILTERING_ACTIONS)[number], string> = {
  'delay-non-critical': 'Delay Non-Critical Notifications',
  'batch-decisions': 'Batch Similar Decisions',
  'reduce-interruptions': 'Reduce Interruptions',
  'summarize-information': 'Summarize Information',
  'escalate-urgent-only': 'Escalate Urgent Matters Only',
  'protect-focus': 'Protect Focus',
};

export const LOAD_STATES = ['light', 'moderate', 'elevated', 'critical'] as const;

export const LOAD_STATE_LABELS: Record<(typeof LOAD_STATES)[number], string> = {
  light: 'Light Load',
  moderate: 'Moderate Load',
  elevated: 'Elevated Load',
  critical: 'Critical Load',
};
