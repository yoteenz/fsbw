/** Milestone 108 — Anticipation Engine™ V1.0 */

export const ANTICIPATION_ENGINE_STORAGE_KEY = 'studioOsAnticipationEngine_v1';
export const ANTICIPATION_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_ANTICIPATION_ENGINE_UPDATED = 'studio-os-anticipation-engine-updated';

export const ANTICIPATION_ENGINE_PHILOSOPHY = [
  'The highest form of intelligence is anticipation — Studio OS removes work before work is requested.',
  'Instead of asking what to do, Studio OS quietly prepares — everything waits for founder approval.',
  'Study historical organizational behavior and prepare accordingly — constantly preparing for tomorrow.',
] as const;

export const ANTICIPATION_CATEGORIES = [
  'upcoming-launches',
  'deadlines',
  'busy-seasons',
  'annual-events',
  'marketing-opportunities',
  'hiring-needs',
  'knowledge-gaps',
  'training-opportunities',
  'customer-follow-ups',
  'revenue-opportunities',
  'operational-bottlenecks',
  'founder-workload',
] as const;

export const ANTICIPATION_CATEGORY_LABELS: Record<(typeof ANTICIPATION_CATEGORIES)[number], string> = {
  'upcoming-launches': 'Upcoming Launches',
  deadlines: 'Deadlines',
  'busy-seasons': 'Busy Seasons',
  'annual-events': 'Annual Events',
  'marketing-opportunities': 'Marketing Opportunities',
  'hiring-needs': 'Hiring Needs',
  'knowledge-gaps': 'Knowledge Gaps',
  'training-opportunities': 'Training Opportunities',
  'customer-follow-ups': 'Customer Follow-ups',
  'revenue-opportunities': 'Revenue Opportunities',
  'operational-bottlenecks': 'Operational Bottlenecks',
  'founder-workload': 'Founder Workload',
};

export const PREPARATION_TYPES = [
  'draft-emails',
  'launch-assets',
  'reports',
  'meetings',
  'onboarding',
  'content-queue',
  'presentations',
  'SOPs',
  'research',
] as const;

export const PREPARATION_TYPE_LABELS: Record<(typeof PREPARATION_TYPES)[number], string> = {
  'draft-emails': 'Draft Emails',
  'launch-assets': 'Launch Assets',
  reports: 'Reports',
  meetings: 'Meeting Agendas',
  onboarding: 'Onboarding Materials',
  'content-queue': 'Content Queue',
  presentations: 'Presentations',
  SOPs: 'Draft SOPs',
  research: 'Compiled Research',
};
