import type { CreatorCareerStageId } from './types';

export const CREATOR_MARKETPLACE_STORAGE_KEY = 'studioOsCreatorMarketplace_v1';
export const CREATOR_MARKETPLACE_VERSION = '1.0.0';
export const CREATOR_MARKETPLACE_ID = 'creator-marketplace';

export const CREATOR_PHILOSOPHY = [
  'Every creator is a business',
  'Optimize for career growth · business growth · long-term partnerships',
  'Education · trust · brand alignment · relationship quality · financial sustainability',
  'Not one-time sponsorships · institutional relationships lasting years',
] as const;

export const CREATOR_CAREER_STAGES: { stage: CreatorCareerStageId; label: string; description: string }[] = [
  { stage: 'reader', label: 'READER', description: 'Audience building begins' },
  { stage: 'community-member', label: 'COMMUNITY MEMBER', description: 'Engaged community participant' },
  { stage: 'affiliate', label: 'AFFILIATE', description: 'Referral revenue · trust building' },
  { stage: 'creator', label: 'CREATOR', description: 'Content creator · marketplace entry' },
  { stage: 'verified-creator', label: 'VERIFIED CREATOR', description: 'Platform verified · quality gate' },
  { stage: 'preferred-creator', label: 'PREFERRED CREATOR', description: 'Brand preferred · repeat partnerships' },
  { stage: 'brand-ambassador', label: 'BRAND AMBASSADOR', description: 'Representative · long-term alignment' },
  { stage: 'partner', label: 'PARTNER', description: 'Strategic collaboration' },
  { stage: 'advisor', label: 'ADVISOR', description: 'Guides brand direction' },
  { stage: 'agency', label: 'AGENCY', description: 'Team · scaled operations' },
  { stage: 'company-owner', label: 'COMPANY OWNER', description: 'Entrepreneur · full business' },
];

export const CREATOR_MARKETPLACE_CONNECTED_SYSTEMS = [
  'Relationship Engine',
  'Reader Graph',
  'Distribution Engine',
  'Campaign Engine',
  'Strategy Engine',
  'Chief of Staff',
  'Studio Intelligence',
  'Talent Network',
  'Knowledge Graph',
  'Company DNA',
  'Leadership DNA',
  'Commerce',
  'CRM',
  'Future Ecosystem Marketplace',
] as const;

export const EDUCATION_CATEGORIES = [
  'Negotiation',
  'Contracts',
  'Pricing',
  'Brand building',
  'Community',
  'Finance',
  'Taxes',
  'Marketing',
  'Entrepreneurship',
  'Studio OS',
] as const;
