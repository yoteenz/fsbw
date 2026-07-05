/** Concierge Approval Flow — editorial board before founder decision. */

export const CONCIERGE_APPROVAL_FLOW_STORAGE_KEY = 'studioOsConciergeApprovalFlow_v1';
export const CONCIERGE_APPROVAL_FLOW_VERSION = '1.0.0';
export const CONCIERGE_APPROVAL_FLOW_ID = 'concierge-approval-flow';

export const APPROVAL_PHILOSOPHY = [
  'Concierges review first · founders review last.',
  'The founder should never receive unfinished work.',
  'Luxury editorial board preparing tomorrow\'s front page — not a software approval workflow.',
] as const;

export const REVIEW_ORDER = [
  { id: 'brand-concierge', title: 'BRAND CONCIERGE', accent: '#7C3AED' },
  { id: 'experience-concierge', title: 'EXPERIENCE CONCIERGE', accent: '#0891B2' },
  { id: 'digital-concierge', title: 'DIGITAL CONCIERGE', accent: '#6366F1' },
  { id: 'technology-concierge', title: 'TECHNOLOGY CONCIERGE', accent: '#2563EB' },
  { id: 'growth-concierge', title: 'GROWTH CONCIERGE', accent: '#059669' },
  { id: 'chief-concierge', title: 'CHIEF CONCIERGE', accent: '#92704A' },
  { id: 'founder', title: 'FOUNDER', accent: '#EB1C24' },
] as const;

export const CONCIERGE_CRITERIA: Record<
  (typeof REVIEW_ORDER)[number]['id'],
  readonly string[]
> = {
  'brand-concierge': ['Brand consistency', 'Voice', 'Identity', 'Creative direction'],
  'experience-concierge': ['Clarity', 'Viewer journey', 'Emotion', 'Customer trust'],
  'digital-concierge': ['Platform optimization', 'Metadata', 'Cross-platform readiness'],
  'technology-concierge': ['Render quality', 'Technical integrity', 'Performance'],
  'growth-concierge': ['Engagement', 'Reach', 'Predicted retention', 'Distribution'],
  'chief-concierge': [
    'Overall organizational alignment',
    'Founder\'s promise',
    'Organizational priorities',
    'Executive recommendations',
    'Final readiness',
  ],
  founder: ['Final judgment', 'Publication authority', 'Organizational stewardship'],
};

export const REVIEW_VERDICT_LABELS = {
  approved: 'APPROVED',
  'approved-with-suggestions': 'APPROVED WITH SUGGESTIONS',
  'needs-revision': 'NEEDS REVISION',
  'critical-issue': 'CRITICAL ISSUE',
} as const;

export const FOUNDER_ACTIONS = [
  { id: 'approve', label: 'APPROVE' },
  { id: 'publish', label: 'PUBLISH' },
  { id: 'schedule', label: 'SCHEDULE' },
  { id: 'request-changes', label: 'REQUEST CHANGES' },
  { id: 'regenerate', label: 'REGENERATE' },
  { id: 'run-experiment', label: 'RUN EXPERIMENT' },
  { id: 'save-draft', label: 'SAVE DRAFT' },
] as const;

export const APPROVAL_CONNECTED_SYSTEMS = [
  'SCREENING ROOM',
  'RENDER QUEUE',
  'PRODUCTION STUDIO',
  'CONCIERGE LAYER',
  'PUBLISHING',
  'STUDIO INTELLIGENCE',
  'CHIEF CONCIERGE',
  'FOUNDER\'S PROMISE',
] as const;
