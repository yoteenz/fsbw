/** Milestone 116 — Executive Timeline™ permanent organizational history V1.0 */

export const EXECUTIVE_TIMELINE_HISTORY_STORAGE_KEY = 'studioOsExecutiveTimelineHistory_v1';
export const EXECUTIVE_TIMELINE_HISTORY_VERSION = '1.0.0';
export const STUDIO_OS_EXECUTIVE_TIMELINE_HISTORY_UPDATED = 'studio-os-executive-timeline-history-updated';

export const HISTORY_PHILOSOPHY = [
  'Organizations should see how they became successful — history is one of the greatest learning tools.',
  'Every major event contributes to organizational evolution. Studio OS preserves that journey forever.',
  'Founders explore not only where they are, but how they arrived there.',
] as const;

export const HISTORY_EVENT_TYPES = [
  'organization-founded',
  'blueprint-completed',
  'headquarters-activation',
  'profession-brain-update',
  'knowledge-commerce-launch',
  'marketing-campaign',
  'product-release',
  'hiring',
  'promotion',
  'major-customer',
  'revenue-milestone',
  'executive-decision',
  'innovation-lab',
  'award',
  'brand-update',
  'partnership',
  'automation-milestone',
  'knowledge-growth',
  'health-improvement',
  'legacy-preserved',
  'consciousness-milestone',
  'predictive-insight',
] as const;

export const HISTORY_EVENT_LABELS: Record<(typeof HISTORY_EVENT_TYPES)[number], string> = {
  'organization-founded': 'Organization Founded',
  'blueprint-completed': 'Business Discovery Blueprint™',
  'headquarters-activation': 'Headquarters Activation',
  'profession-brain-update': 'Profession Brain™ Update',
  'knowledge-commerce-launch': 'Knowledge Commerce™ Launch',
  'marketing-campaign': 'Marketing Campaign',
  'product-release': 'Product Release',
  hiring: 'Hiring',
  promotion: 'Promotion',
  'major-customer': 'Major Customer',
  'revenue-milestone': 'Revenue Milestone',
  'executive-decision': 'Executive Decision',
  'innovation-lab': 'Innovation Lab Project',
  award: 'Award',
  'brand-update': 'Brand Update',
  partnership: 'Partnership',
  'automation-milestone': 'Automation Milestone',
  'knowledge-growth': 'Knowledge Growth',
  'health-improvement': 'Organization Health Improvement',
  'legacy-preserved': 'Legacy Preserved',
  'consciousness-milestone': 'Organizational Consciousness Milestone',
  'predictive-insight': 'Predictive Insight Recorded',
};

export const HISTORY_DEPARTMENTS = [
  'executive',
  'marketing',
  'product',
  'operations',
  'finance',
  'people',
  'knowledge',
  'technology',
  'customer-success',
  'innovation',
] as const;

export const HISTORY_DEPARTMENT_LABELS: Record<(typeof HISTORY_DEPARTMENTS)[number], string> = {
  executive: 'Executive',
  marketing: 'Marketing',
  product: 'Product',
  operations: 'Operations',
  finance: 'Finance',
  people: 'People',
  knowledge: 'Knowledge',
  technology: 'Technology',
  'customer-success': 'Customer Success',
  innovation: 'Innovation',
};

export const HISTORY_INSIGHT_PATTERNS = [
  'fastest-growth',
  'campaign-impact',
  'brain-expansion',
  'decision-outcome',
  'health-turnaround',
  'knowledge-compounding',
  'anniversary',
] as const;

export const HISTORY_INSIGHT_LABELS: Record<(typeof HISTORY_INSIGHT_PATTERNS)[number], string> = {
  'fastest-growth': 'Fastest Growth Period',
  'campaign-impact': 'Campaign Performance Shift',
  'brain-expansion': 'Profession Brain™ Expansion',
  'decision-outcome': 'Executive Decision Impact',
  'health-turnaround': 'Health Improvement',
  'knowledge-compounding': 'Knowledge Compounding',
  anniversary: 'Historical Anniversary',
};

export const EXECUTIVE_HISTORY_ACCENT = '#B45309';
