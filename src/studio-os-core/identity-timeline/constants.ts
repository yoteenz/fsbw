/** Milestone 168 — Identity Timeline™ · Permanent professional journey records */

export const IDENTITY_TIMELINE_STORAGE_KEY = 'studioOsIdentityTimeline_v1';
export const IDENTITY_TIMELINE_VERSION = '1.0.0';
export const STUDIO_OS_IDENTITY_TIMELINE_UPDATED = 'studio-os-identity-timeline-updated';

export const IDENTITY_TIMELINE_ACCENT = '#9333EA';

export const IDENTITY_TIMELINE_PHILOSOPHY = [
  'Studio OS should preserve the professional story of every individual — not just the organization.',
  'Identity Timeline™ is a permanent record of each person\'s journey inside Studio OS — never rebuilt, never lost.',
  'Every milestone — training, contributions, mentorship, leadership, and marketplace achievements — becomes part of a living legacy.',
  'Studio Intelligence™ celebrates growth: mentorship impact, knowledge published, and top contributor recognition.',
] as const;

export const IDENTITY_TIMELINE_EVENT_TYPES = [
  'joined-organization',
  'first-login',
  'training-completed',
  'profession-brain-contribution',
  'knowledge-published',
  'project',
  'promotion',
  'award',
  'mentorship',
  'department',
  'marketplace-contribution',
  'expert-session',
  'leadership-role',
  'company-milestone',
] as const;

export const IDENTITY_TIMELINE_EVENT_LABELS: Record<(typeof IDENTITY_TIMELINE_EVENT_TYPES)[number], string> = {
  'joined-organization': 'Joined Organization',
  'first-login': 'First Login',
  'training-completed': 'Training Completed',
  'profession-brain-contribution': 'Profession Brain™ Contribution',
  'knowledge-published': 'Knowledge Published',
  project: 'Project',
  promotion: 'Promotion',
  award: 'Award',
  mentorship: 'Mentorship',
  department: 'Department',
  'marketplace-contribution': 'Marketplace Contribution',
  'expert-session': 'Expert Session',
  'leadership-role': 'Leadership Role',
  'company-milestone': 'Company Milestone',
};

export const IDENTITY_TIMELINE_DOMAINS = [
  'journey',
  'learning',
  'contributions',
  'leadership',
  'marketplace',
  'milestones',
] as const;

export const IDENTITY_TIMELINE_DOMAIN_LABELS: Record<(typeof IDENTITY_TIMELINE_DOMAINS)[number], string> = {
  journey: 'Organizational Journey',
  learning: 'Training & Learning',
  contributions: 'Knowledge & Brains',
  leadership: 'Leadership & Mentorship',
  marketplace: 'Marketplace & Expertise',
  milestones: 'Company Milestones',
};
