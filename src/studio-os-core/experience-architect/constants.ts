import type { ExperienceBlueprintStageId } from './types';

export const EXPERIENCE_ARCHITECT_STORAGE_KEY = 'studioOsExperienceArchitect_v1';
export const EXPERIENCE_ARCHITECT_VERSION = '1.0.0';
export const EXPERIENCE_ARCHITECT_ID = 'experience-architect';

export const EXPERIENCE_PHILOSOPHY = [
  'People rarely remember interfaces — they remember experiences',
  'Optimize for memorability · not usability alone',
  'Every interaction intentional · every touchpoint reinforces identity',
  'Emotional design · confidence · trust · delight · belonging · advocacy',
] as const;

export const EXPERIENCE_ARCHITECT_CONNECTED_SYSTEMS = [
  'Company Maturity Engine',
  'Brand Architect',
  'Business Architect',
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Knowledge Graph',
  'Relationship Engine',
  'Reader Graph',
  'Chief of Staff',
  'Studio Intelligence',
  'Future Digital Architect',
] as const;

export const BLUEPRINT_STAGE_DEFS: { id: ExperienceBlueprintStageId; label: string }[] = [
  { id: 'first-impression', label: 'FIRST IMPRESSION' },
  { id: 'brand-discovery', label: 'BRAND DISCOVERY' },
  { id: 'customer-onboarding', label: 'CUSTOMER ONBOARDING' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'purchase-journey', label: 'PURCHASE JOURNEY' },
  { id: 'checkout', label: 'CHECKOUT EXPERIENCE' },
  { id: 'confirmation', label: 'CONFIRMATION EXPERIENCE' },
  { id: 'shipping', label: 'SHIPPING EXPERIENCE' },
  { id: 'product', label: 'PRODUCT EXPERIENCE' },
  { id: 'support', label: 'SUPPORT EXPERIENCE' },
  { id: 'membership', label: 'MEMBERSHIP EXPERIENCE' },
  { id: 'renewal', label: 'RENEWAL EXPERIENCE' },
  { id: 'community', label: 'COMMUNITY EXPERIENCE' },
  { id: 'referral', label: 'REFERRAL EXPERIENCE' },
  { id: 'anniversary', label: 'ANNIVERSARY EXPERIENCE' },
  { id: 'win-back', label: 'WIN-BACK EXPERIENCE' },
  { id: 'advocacy', label: 'ADVOCACY EXPERIENCE' },
  { id: 'long-term-relationship', label: 'LONG-TERM RELATIONSHIP' },
];

export const EMOTIONAL_PROGRESSION = [
  'CURIOSITY',
  'CONFIDENCE',
  'ANTICIPATION',
  'EXCITEMENT',
  'DELIGHT',
  'TRUST',
  'BELONGING',
  'LOYALTY',
  'ADVOCACY',
  'LEGACY',
] as const;
