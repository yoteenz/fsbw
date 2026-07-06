import type { IntelligenceMaturityTier } from './types';

export const FOUNDER_PILOT_MODE_STORAGE_KEY = 'studioOsFounderPilotMode_v1';
export const FOUNDER_PILOT_MODE_VERSION = '1.0.0';

/** Organizations that begin at zero by default. */
export const FOUNDER_PILOT_DEFAULT_ORGANIZATIONS = ['ai-media'] as const;

export const INTELLIGENCE_MATURITY_TIERS: IntelligenceMaturityTier[] = [
  { postsRequired: 5, label: '5 POSTS', unlocks: 'Basic recommendations unlock.' },
  { postsRequired: 25, label: '25 POSTS', unlocks: 'Trend detection unlocks.' },
  { postsRequired: 100, label: '100 POSTS', unlocks: 'Predictive optimization unlocks.' },
  { postsRequired: 500, label: '500 POSTS', unlocks: 'Autonomous publishing suggestions unlock.' },
];

export const FOUNDER_MILESTONE_LABELS: Record<string, string> = {
  'organization-created': 'Organization Created',
  'instagram-connected': 'Instagram Connected',
  'first-page-written': 'First Page Written',
  'first-approval': 'First Approval',
  'first-publish': 'First Publish',
  'first-comment': 'First Comment',
  'first-share': 'First Share',
  'first-viral-post': 'First Viral Post',
  'first-revenue': 'First Revenue',
  'first-100-pages': 'First 100 Pages',
  'first-1000-followers': 'First 1,000 Followers',
  'first-experiment': 'First Experiment',
  'first-ai-recommendation': 'First AI Recommendation',
  'first-automation': 'First Automation',
};
