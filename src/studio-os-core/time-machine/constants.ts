/** Milestone 148 — Time Machine™ · Organizational Replay Engine */

export const TIME_MACHINE_STORAGE_KEY = 'studioOsTimeMachine_v1';
export const TIME_MACHINE_VERSION = '1.0.0';
export const STUDIO_OS_TIME_MACHINE_UPDATED = 'studio-os-time-machine-updated';

export const TIME_MACHINE_ACCENT = '#7C3AED';

export const TIME_MACHINE_PHILOSOPHY = [
  'The Time Machine™ replays any organizational event exactly as it occurred — to understand WHY, not just what.',
  'Organizations should never ask "What happened?" — Studio OS lets them experience it again.',
  'Complete reconstruction: user actions, AI reasoning, automations, permissions, and environmental context.',
  'Studio Intelligence™ explains what happened, why, alternatives, and recommended improvements.',
] as const;

export const REPLAY_EVENT_TYPES = [
  'customer-purchase',
  'appointment-booking',
  'permit-approval',
  'quarterly-fuel-tax-filing',
  'knowledge-publication',
  'marketplace-transaction',
  'expert-consultation',
  'automation-failure',
  'revenue-spike',
  'security-event',
] as const;

export const RECONSTRUCTION_LAYERS = [
  'user-actions',
  'ai-reasoning',
  'profession-brain-decisions',
  'automation-triggers',
  'knowledge-graph-state',
  'active-integrations',
  'organization-settings',
  'permissions',
  'notifications',
  'timeline-events',
  'environmental-context',
] as const;

export const TIMELINE_CONTROLS = [
  'play',
  'pause',
  'step-forward',
  'step-backward',
  'jump-to-event',
  'filter-timeline',
  'compare-two-moments',
] as const;

export const PLAYBACK_STATES = ['idle', 'playing', 'paused', 'stepping'] as const;

export const REPLAY_EVENT_TYPE_LABELS: Record<(typeof REPLAY_EVENT_TYPES)[number], string> = {
  'customer-purchase': 'Customer Purchase',
  'appointment-booking': 'Appointment Booking',
  'permit-approval': 'Permit Approval',
  'quarterly-fuel-tax-filing': 'Quarterly Fuel Tax Filing',
  'knowledge-publication': 'Knowledge Publication',
  'marketplace-transaction': 'Marketplace Transaction',
  'expert-consultation': 'Expert Consultation',
  'automation-failure': 'Automation Failure',
  'revenue-spike': 'Revenue Spike',
  'security-event': 'Security Event',
};

export const RECONSTRUCTION_LAYER_LABELS: Record<(typeof RECONSTRUCTION_LAYERS)[number], string> = {
  'user-actions': 'User Actions',
  'ai-reasoning': 'AI Reasoning',
  'profession-brain-decisions': 'Profession Brain™ Decisions',
  'automation-triggers': 'Automation Triggers',
  'knowledge-graph-state': 'Knowledge Graph State',
  'active-integrations': 'Active Integrations',
  'organization-settings': 'Organization Settings',
  permissions: 'Permissions',
  notifications: 'Notifications',
  'timeline-events': 'Timeline Events',
  'environmental-context': 'Environmental Context',
};
