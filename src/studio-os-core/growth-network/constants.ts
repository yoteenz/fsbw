import type {
  DealPipelineStage,
  GrowthRoadmapStage,
  GrowthPrivacySettings,
  OpportunityType,
  RevenueChannelType,
} from './types';

export const GROWTH_NETWORK_VERSION = '1.0';

export const DEAL_PIPELINE_STAGES: DealPipelineStage[] = [
  'lead',
  'qualified',
  'meeting',
  'proposal',
  'negotiation',
  'contract',
  'campaign',
  'deliverables',
  'invoice',
  'payment',
  'renewal',
  'completed',
];

export const DEAL_PIPELINE_LABELS: Record<DealPipelineStage, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  meeting: 'Meeting',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  contract: 'Contract',
  campaign: 'Campaign',
  deliverables: 'Deliverables',
  invoice: 'Invoice',
  payment: 'Payment',
  renewal: 'Renewal',
  completed: 'Completed',
};

export const GROWTH_ROADMAP_STAGES: GrowthRoadmapStage[] = [
  'launch',
  'traction',
  'growth',
  'scale',
  'enterprise',
  'legacy',
];

export const GROWTH_ROADMAP_LABELS: Record<GrowthRoadmapStage, string> = {
  launch: 'Launch',
  traction: 'Traction',
  growth: 'Growth',
  scale: 'Scale',
  enterprise: 'Enterprise',
  legacy: 'Legacy',
};

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  'brand-partnership': 'Brand Partnership',
  'affiliate-program': 'Affiliate Program',
  sponsorship: 'Sponsorship',
  'podcast-appearance': 'Podcast Appearance',
  'speaking-engagement': 'Speaking Engagement',
  licensing: 'Licensing',
  investor: 'Investor',
  collaboration: 'Collaboration',
  event: 'Event',
  'ugc-opportunity': 'UGC Opportunity',
  'product-launch': 'Product Launch',
  'retail-opportunity': 'Retail Opportunity',
  'wholesale-opportunity': 'Wholesale Opportunity',
  'community-partnership': 'Community Partnership',
  'grant-opportunity': 'Grant Opportunity',
};

export const REVENUE_CHANNEL_LABELS: Record<RevenueChannelType, string> = {
  'brand-deals': 'Brand Deals',
  'affiliate-income': 'Affiliate Income',
  'platform-payouts': 'Platform Payouts',
  'digital-products': 'Digital Products',
  'physical-products': 'Physical Products',
  courses: 'Courses',
  memberships: 'Memberships',
  licensing: 'Licensing',
  consulting: 'Consulting',
  subscriptions: 'Subscriptions',
  other: 'Other Revenue',
};

export const DEFAULT_GROWTH_PRIVACY: GrowthPrivacySettings = {
  profileVisible: false,
  discoverableInRegistry: false,
  publicProfileEnabled: false,
  allowPartnershipRequests: true,
  allowBrandInvitations: true,
  contactMethodsVisible: false,
};

export const CONTRACT_EDUCATIONAL_DISCLAIMER =
  'Educational insights only — not legal advice. Consult qualified counsel before signing agreements.';

export const GROWTH_NETWORK_STORAGE_KEY = 'studioOs_growthNetwork_v1';
