import type { MarketplaceAssetCategoryId } from './types';

export const ECOSYSTEM_MARKETPLACE_STORAGE_KEY = 'studioOsEcosystemMarketplace_v1';
export const ECOSYSTEM_MARKETPLACE_VERSION = '1.0.0';
export const ECOSYSTEM_MARKETPLACE_ID = 'ecosystem-marketplace';

export const MARKETPLACE_PHILOSOPHY = [
  'Everything an organization creates has value',
  'Not an app marketplace · an organizational marketplace',
  'Purchase outcomes · not templates · organizational capability',
  'Organizational wisdom compounds faster than any individual company alone',
] as const;

export const MARKETPLACE_CATEGORIES: { id: MarketplaceAssetCategoryId; label: string }[] = [
  { id: 'organizational-dna', label: 'ORGANIZATIONAL DNA' },
  { id: 'executive-teams', label: 'EXECUTIVE TEAMS' },
  { id: 'departments', label: 'DEPARTMENTS' },
  { id: 'playbooks', label: 'PLAYBOOKS' },
  { id: 'templates', label: 'TEMPLATES' },
  { id: 'automation-systems', label: 'AUTOMATION SYSTEMS' },
  { id: 'knowledge-assets', label: 'KNOWLEDGE ASSETS' },
  { id: 'creative-systems', label: 'CREATIVE SYSTEMS' },
  { id: 'brand-systems', label: 'BRAND SYSTEMS' },
  { id: 'marketing-systems', label: 'MARKETING SYSTEMS' },
  { id: 'sales-systems', label: 'SALES SYSTEMS' },
  { id: 'operations', label: 'OPERATIONS' },
  { id: 'finance', label: 'FINANCE' },
  { id: 'legal', label: 'LEGAL' },
  { id: 'customer-support', label: 'CUSTOMER SUPPORT' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'creator-programs', label: 'CREATOR PROGRAMS' },
  { id: 'courses', label: 'COURSES' },
  { id: 'prompt-systems', label: 'PROMPT SYSTEMS' },
];

export const ECOSYSTEM_MARKETPLACE_CONNECTED_SYSTEMS = [
  'Organizational Inheritance',
  'Creator Marketplace',
  'Relationship Engine',
  'Reader Graph',
  'Strategy Engine',
  'Campaign Engine',
  'Distribution Engine',
  'Newsroom',
  'Chief of Staff',
  'Knowledge Graph',
  'Studio Intelligence',
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Operational DNA',
] as const;

export const LICENSING_LABELS: Record<string, string> = {
  free: 'FREE',
  paid: 'PAID',
  subscription: 'SUBSCRIPTION',
  enterprise: 'ENTERPRISE',
  'internal-only': 'INTERNAL ONLY',
  'private-org': 'PRIVATE ORG',
  'invite-only': 'INVITE ONLY',
  'community-edition': 'COMMUNITY EDITION',
};
