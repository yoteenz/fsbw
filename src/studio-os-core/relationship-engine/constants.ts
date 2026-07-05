import type { LifecycleStageId } from './types';

export const RELATIONSHIP_ENGINE_STORAGE_KEY = 'studioOsRelationshipEngine_v1';
export const RELATIONSHIP_ENGINE_VERSION = '1.0.0';
export const RELATIONSHIP_ENGINE_ID = 'relationship-engine';

export const RELATIONSHIP_PLATFORM_CHAIN = [
  { level: 'reader-graph', label: 'READER GRAPH', description: 'Passive intelligence · who people are becoming' },
  { level: 'relationship-engine', label: 'RELATIONSHIP ENGINE', description: 'Active nurturing · relationships as organizational assets' },
  { level: 'institutional-learning', label: 'INSTITUTIONAL LEARNING', description: 'Every interaction improves organizational intelligence' },
] as const;

export const RELATIONSHIP_LIFECYCLE_STAGES: { stage: LifecycleStageId; label: string; description: string }[] = [
  { stage: 'discover', label: 'DISCOVER', description: 'First encounter' },
  { stage: 'reader', label: 'READER', description: 'Consuming knowledge' },
  { stage: 'engaged-reader', label: 'ENGAGED READER', description: 'Active return · habit forming' },
  { stage: 'community-member', label: 'COMMUNITY MEMBER', description: 'Participating in community' },
  { stage: 'subscriber', label: 'SUBSCRIBER', description: 'Owned relationship · newsletter · alerts' },
  { stage: 'customer', label: 'CUSTOMER', description: 'First commercial relationship' },
  { stage: 'repeat-customer', label: 'REPEAT CUSTOMER', description: 'Returning purchaser · trust established' },
  { stage: 'member', label: 'MEMBER', description: 'Membership · deeper access' },
  { stage: 'affiliate', label: 'AFFILIATE', description: 'Referral partner · revenue share' },
  { stage: 'creator', label: 'CREATOR', description: 'Creating content · marketplace' },
  { stage: 'ambassador', label: 'AMBASSADOR', description: 'Representing brand · advocacy' },
  { stage: 'partner', label: 'PARTNER', description: 'Collaborative relationship' },
  { stage: 'advisor', label: 'ADVISOR', description: 'Guiding organization · legacy wisdom' },
  { stage: 'legacy', label: 'LEGACY RELATIONSHIP', description: 'Long-term institutional bond' },
];

export const RELATIONSHIP_CONNECTED_SYSTEMS = [
  'Reader Graph',
  'Distribution Engine',
  'Campaign Engine',
  'Strategy Engine',
  'Newsroom',
  'Chief of Staff',
  'Studio Intelligence',
  'Creator Marketplace',
  'Community Systems',
  'Knowledge Graph',
  'CRM',
  'Commerce',
  'Membership',
  'Affiliate Program',
  'Talent Network',
] as const;

export const NEXT_BEST_ACTION_TYPES = [
  'Invite to membership',
  'Invite to affiliate program',
  'Invite to creator marketplace',
  'Invite to ambassador program',
  'Recommend product',
  'Recommend event',
  'Recommend community',
  'Recommend educational series',
  'Recommend partnership',
  'Recommend mentorship',
  'Recommend exclusive access',
  'Recommend loyalty reward',
] as const;

export const COMMUNITY_ENGINE_EXAMPLES = [
  'Luxury enthusiasts',
  'Entrepreneurs',
  'Design lovers',
  'AI builders',
  'Beauty professionals',
  'Educators',
  'Students',
  'Founders',
] as const;
