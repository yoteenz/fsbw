/** Milestone 119 — Innovation Lab™ V1.0 */

export const INNOVATION_LAB_STORAGE_KEY = 'studioOsInnovationLab_v1';
export const INNOVATION_LAB_VERSION = '1.0.0';
export const STUDIO_OS_INNOVATION_LAB_UPDATED = 'studio-os-innovation-lab-updated';

export const INNOVATION_LAB_PHILOSOPHY = [
  'Innovation should never depend on random inspiration — develop it as a permanent organizational capability.',
  'Studio OS continuously generates opportunities based on everything it knows about the organization.',
  'The Innovation Lab™ exists to continuously create ideas — not merely collect them.',
] as const;

export const INNOVATION_SOURCES = [
  'profession-brain',
  'organization-genome',
  'business-discovery-blueprint',
  'customer-feedback',
  'executive-council',
  'organization-pulse',
  'knowledge-commerce',
  'market-trends',
  'competitor-analysis',
  'world-knowledge-engine',
  'historical-performance',
  'founder-vision',
] as const;

export const INNOVATION_SOURCE_LABELS: Record<(typeof INNOVATION_SOURCES)[number], string> = {
  'profession-brain': 'Profession Brain™',
  'organization-genome': 'Organization Genome™',
  'business-discovery-blueprint': 'Business Discovery Blueprint™',
  'customer-feedback': 'Customer Feedback',
  'executive-council': 'Executive Council™',
  'organization-pulse': 'Organization Pulse™',
  'knowledge-commerce': 'Knowledge Commerce™',
  'market-trends': 'Market Trends',
  'competitor-analysis': 'Competitor Analysis',
  'world-knowledge-engine': 'World Knowledge Engine™',
  'historical-performance': 'Historical Performance',
  'founder-vision': 'Founder Vision',
};

export const IDEA_CATEGORIES = [
  'products',
  'services',
  'memberships',
  'subscriptions',
  'digital-products',
  'courses',
  'knowledge-products',
  'patents',
  'automations',
  'workflows',
  'marketing-campaigns',
  'business-models',
  'pricing-strategies',
  'strategic-partnerships',
  'operational-improvements',
  'department-packs',
  'profession-brains',
  'expansion-opportunities',
  'community-programs',
  'revenue-streams',
] as const;

export const IDEA_CATEGORY_LABELS: Record<(typeof IDEA_CATEGORIES)[number], string> = {
  products: 'Products',
  services: 'Services',
  memberships: 'Memberships',
  subscriptions: 'Subscriptions',
  'digital-products': 'Digital Products',
  courses: 'Courses',
  'knowledge-products': 'Knowledge Products',
  patents: 'Patents',
  automations: 'Automations',
  workflows: 'Workflows',
  'marketing-campaigns': 'Marketing Campaigns',
  'business-models': 'Business Models',
  'pricing-strategies': 'Pricing Strategies',
  'strategic-partnerships': 'Strategic Partnerships',
  'operational-improvements': 'Operational Improvements',
  'department-packs': 'Department Packs',
  'profession-brains': 'Profession Brains™',
  'expansion-opportunities': 'Expansion Opportunities',
  'community-programs': 'Community Programs',
  'revenue-streams': 'Revenue Streams',
};

export const PIPELINE_STAGES = [
  'discovered',
  'researching',
  'validating',
  'prototype',
  'testing',
  'approved',
  'launching',
  'completed',
  'archived',
] as const;

export const PIPELINE_STAGE_LABELS: Record<(typeof PIPELINE_STAGES)[number], string> = {
  discovered: 'Discovered',
  researching: 'Researching',
  validating: 'Validating',
  prototype: 'Prototype',
  testing: 'Testing',
  approved: 'Approved',
  launching: 'Launching',
  completed: 'Completed',
  archived: 'Archived',
};

export const COLLABORATIVE_DEPARTMENTS = [
  'marketing',
  'finance',
  'operations',
  'research',
  'legal',
  'customer-experience',
  'chief-concierge',
] as const;

export const COLLABORATIVE_DEPARTMENT_LABELS: Record<(typeof COLLABORATIVE_DEPARTMENTS)[number], string> = {
  marketing: 'Marketing',
  finance: 'Finance',
  operations: 'Operations',
  research: 'Research',
  legal: 'Legal',
  'customer-experience': 'Customer Experience',
  'chief-concierge': 'Chief Concierge',
};

export const INNOVATION_LAB_ACCENT = '#EA580C';
