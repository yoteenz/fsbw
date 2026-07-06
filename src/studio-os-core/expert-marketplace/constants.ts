/** Milestone 92 — Expert Marketplace™ V1.0 */

export const EXPERT_MARKETPLACE_STORAGE_KEY = 'studioOs_expertMarketplace_v1';
export const EXPERT_MARKETPLACE_VERSION = '1.0.0';

export const EXPERT_MARKETPLACE_PHILOSOPHY = [
  'Organizations transform expertise into products — not AI bots.',
  'Private operational knowledge is never exposed without explicit approval.',
  'The organization always owns and controls what is published.',
];

export const REGULATED_INDUSTRIES = [
  'law-firm',
  'medical',
  'dental',
  'financial-services',
  'insurance',
] as const;

export const TRUST_DISCLAIMER_LEVELS = {
  educational: 'Educational guidance — not professional advice.',
  preparation: 'Professional preparation — licensed review may be recommended.',
  consultation: 'Professional consultation — subject to organization policies.',
  licensed: 'Licensed professional services — regulated industry standards apply.',
} as const;

export const REVENUE_CHANNEL_TYPES = [
  'knowledge',
  'templates',
  'courses',
  'consultations',
  'digital-products',
  'memberships',
  'subscriptions',
  'professional-services',
] as const;

export const DISCOVERY_DIMENSIONS = [
  'industry',
  'profession',
  'location',
  'problem',
  'specialty',
  'experience',
  'services',
  'ratings',
  'certifications',
  'topics',
  'organization',
] as const;
