import type { GrowthLifecycleStageId } from './types';

export const GROWTH_ARCHITECT_STORAGE_KEY = 'studioOsGrowthArchitect_v1';
export const GROWTH_ARCHITECT_VERSION = '1.0.0';
export const GROWTH_ARCHITECT_ID = 'growth-architect';

export const GROWTH_PHILOSOPHY = [
  'Growth never depends on random tactics — intentional operating system',
  'Every initiative from strategy · reinforces brand · strengthens relationships',
  'Healthy sustainable growth · not growth at any cost',
  'Compound trust · knowledge · relationships · revenue · org intelligence',
] as const;

export const GROWTH_ARCHITECT_CONNECTED_SYSTEMS = [
  'Business Architect',
  'Brand Architect',
  'Experience Architect',
  'Digital Architect',
  'Strategy Engine',
  'Campaign Engine',
  'Distribution Engine',
  'Relationship Engine',
  'Reader Graph',
  'Creator Marketplace',
  'Chief of Staff',
  'Studio Intelligence',
  'Knowledge Graph',
  'Organizational Inheritance',
  'Company Genome',
] as const;

export const LIFECYCLE_STAGE_DEFS: { id: GrowthLifecycleStageId; label: string }[] = [
  { id: 'idea', label: 'IDEA' },
  { id: 'validation', label: 'VALIDATION' },
  { id: 'launch', label: 'LAUNCH' },
  { id: 'traction', label: 'TRACTION' },
  { id: 'optimization', label: 'OPTIMIZATION' },
  { id: 'scale', label: 'SCALE' },
  { id: 'expansion', label: 'EXPANSION' },
  { id: 'leadership', label: 'LEADERSHIP' },
  { id: 'legacy', label: 'LEGACY' },
];

export const BLUEPRINT_PILLARS = [
  'Launch strategy',
  'Customer acquisition',
  'Customer activation',
  'Customer retention',
  'Community growth',
  'Creator growth',
  'Affiliate growth',
  'Partnership growth',
  'Brand awareness',
  'Product expansion',
  'Market expansion',
  'International expansion',
  'Enterprise growth',
  'Organic growth',
  'Paid growth',
  'Referral growth',
  'Knowledge growth',
  'Revenue diversification',
] as const;
