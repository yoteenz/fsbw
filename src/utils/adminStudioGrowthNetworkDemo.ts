/** Growth Network v1.0 — demo seeds & UI config. */

import type {
  CompanyRegistryEntry,
  ContractInsight,
  GrowthAnalyticsSnapshot,
  GrowthOpportunity,
  PartnershipRecord,
  RevenueStreamRecord,
  ServiceProviderListing,
} from '../studio-os-core/growth-network/types';
import { CONTRACT_EDUCATIONAL_DISCLAIMER } from '../studio-os-core/growth-network/constants';

export const ADMIN_STUDIO_GROWTH_NETWORK_SUBTITLE =
  'INTELLIGENT BUSINESS GROWTH ECOSYSTEM — DISCOVER OPPORTUNITIES · MANAGE PARTNERSHIPS · SCALE REVENUE';

export const GROWTH_INHERITANCE_CHAIN = [
  'MEMORY BIBLE',
  'GROWTH PROFILE',
  'OPPORTUNITY ENGINE',
  'DEAL PIPELINE',
  'REVENUE CENTER',
  'KNOWLEDGE GRAPH',
] as const;

export type GrowthNetworkTabId =
  | 'overview'
  | 'profile'
  | 'registry'
  | 'opportunities'
  | 'pipeline'
  | 'partnerships'
  | 'contracts'
  | 'revenue'
  | 'analytics'
  | 'recommendations'
  | 'services'
  | 'brands'
  | 'privacy'
  | 'executives';

export const GROWTH_NETWORK_TABS: Array<{ id: GrowthNetworkTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'profile', label: 'GROWTH PROFILE' },
  { id: 'registry', label: 'REGISTRY' },
  { id: 'opportunities', label: 'OPPORTUNITIES' },
  { id: 'pipeline', label: 'DEAL PIPELINE' },
  { id: 'partnerships', label: 'PARTNERSHIPS' },
  { id: 'contracts', label: 'CONTRACT INTEL' },
  { id: 'revenue', label: 'REVENUE CENTER' },
  { id: 'analytics', label: 'GROWTH ANALYTICS' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'services', label: 'SERVICE MARKETPLACE' },
  { id: 'brands', label: 'BRAND MARKETPLACE' },
  { id: 'privacy', label: 'PRIVACY' },
  { id: 'executives', label: 'GROWTH EXECUTIVES' },
];

export const OPPORTUNITY_CATALOG: Omit<GrowthOpportunity, 'workspaceId' | 'matchScore' | 'matchReason'>[] = [
  {
    id: 'opp-edtech-brand',
    type: 'brand-partnership',
    title: 'EdTech Brand Series Sponsorship',
    brand: 'LearnFlow',
    description: '6-episode sponsored educational series · 60s integrations · cross-platform',
    estimatedValue: '$18,000–$24,000',
    deadline: '2026-08-15',
    stage: 'qualified',
  },
  {
    id: 'opp-creator-saas-affiliate',
    type: 'affiliate-program',
    title: 'Creator SaaS Stack Affiliate',
    brand: 'EditPro',
    description: '30% recurring commission · video editor tool for creators',
    estimatedValue: '$500–$2,000/mo',
    stage: 'lead',
  },
  {
    id: 'opp-podcast-guest',
    type: 'podcast-appearance',
    title: 'Future of Creator Economy Podcast',
    brand: 'Build In Public FM',
    description: '45-min guest slot · audience 40K · studio os growth story angle',
    estimatedValue: 'Visibility + backlinks',
    deadline: '2026-07-20',
    stage: 'meeting',
  },
  {
    id: 'opp-ugc-campaign',
    type: 'ugc-opportunity',
    title: 'UGC Campaign · Productivity Apps',
    brand: 'FocusKit',
    description: '3 short-form UGC videos · usage rights 12 months',
    estimatedValue: '$3,500',
    stage: 'proposal',
  },
  {
    id: 'opp-grant-edu',
    type: 'grant-opportunity',
    title: 'Digital Education Innovation Grant',
    brand: 'Creative Futures Fund',
    description: 'Non-dilutive grant for educational media pilots',
    estimatedValue: '$10,000',
    deadline: '2026-09-01',
    stage: 'lead',
  },
];

export const DEMO_COMPANY_REGISTRY: CompanyRegistryEntry[] = [
  {
    id: 'reg-ai-media',
    company: 'AI Media',
    workspaceId: 'ai-media',
    companyType: 'media-company',
    industry: 'Educational Media',
    location: 'Remote · US',
    audienceDemographics: '18–34 · education-curious',
    platforms: ['YouTube', 'Instagram', 'TikTok'],
    engagement: '4.2% avg',
    growthMetrics: '+12% MoM audience',
    contactPreferences: 'Email · studio os inbox only',
    brandGuidelines: 'Educational tone · no hard sell · trust-first',
    companyDna: 'Pilot workspace · studio os growth validation',
    verified: true,
    discoverable: false,
    growthRate: '+12%',
    availability: 'Open to brand partnerships Q3',
  },
  {
    id: 'reg-creator-alpha',
    company: 'Creator Alpha',
    companyType: 'creator',
    industry: 'Lifestyle',
    location: 'Los Angeles, CA',
    audienceDemographics: '22–35 · fashion & wellness',
    platforms: ['Instagram', 'TikTok'],
    engagement: '5.1% avg',
    growthMetrics: '+8% MoM',
    contactPreferences: 'DM · agent',
    brandGuidelines: 'Authentic · diverse · inclusive',
    companyDna: 'Personal brand · UGC specialist',
    verified: false,
    discoverable: true,
    growthRate: '+8%',
    availability: 'Sponsorship slots Q3–Q4',
  },
];

export const DEMO_PARTNERSHIPS: PartnershipRecord[] = [
  {
    id: 'part-edtech-pilot',
    workspaceId: 'ai-media',
    brand: 'LearnFlow',
    contact: 'partnerships@learnflow.io',
    campaign: 'Summer Education Series',
    deliverables: ['6× 60s integrations', '2× dedicated Shorts', 'Newsletter mention'],
    timeline: '2026-08-01 → 2026-09-30',
    budget: '$20,000',
    paymentTerms: '50% on signature · 50% on delivery',
    notes: 'Awaiting contract review — Contract Analyst flagged exclusivity clause',
    renewalReminder: '2026-09-15',
    communicationHistory: ['2026-07-01 intro call', '2026-07-10 proposal sent'],
    status: 'negotiation',
    performanceMetrics: 'Pending — pre-campaign',
  },
];

export const DEMO_CONTRACT: ContractInsight = {
  id: 'contract-learnflow-draft',
  workspaceId: 'ai-media',
  fileName: 'LearnFlow_Sponsorship_Draft_v1.pdf',
  uploadedAt: '2026-07-02T14:00:00.000Z',
  paymentTerms: ['Net 30 from delivery date', '50/50 milestone split'],
  usageRights: ['12-month digital usage', 'Organic social repost permitted'],
  renewalClauses: ['Auto-renew unless 30-day notice'],
  terminationClauses: ['Either party · 14-day cure period'],
  exclusivity: 'Category exclusivity: competing EdTech brands for 90 days',
  contentOwnership: 'Creator retains IP · brand receives licensed usage',
  deliverables: ['6 integrations', '2 dedicated Shorts'],
  deadlines: ['First deliverable due 2026-08-15'],
  potentialRisks: ['Broad exclusivity window may limit other EdTech deals'],
  flaggedLanguage: ['Perpetual usage suggested in Section 4.2 — marked for review'],
  educationalDisclaimer: CONTRACT_EDUCATIONAL_DISCLAIMER,
};

export const DEMO_REVENUE_STREAMS: RevenueStreamRecord[] = [
  { id: 'rev-brand', channel: 'brand-deals', label: 'Brand Deals', monthlyAmount: 4200, annualAmount: 50400, growthRate: 15, workspaceId: 'ai-media' },
  { id: 'rev-affiliate', channel: 'affiliate-income', label: 'Affiliate Income', monthlyAmount: 1800, annualAmount: 21600, growthRate: 22, workspaceId: 'ai-media' },
  { id: 'rev-platform', channel: 'platform-payouts', label: 'Platform Payouts', monthlyAmount: 950, annualAmount: 11400, growthRate: 8, workspaceId: 'ai-media' },
  { id: 'rev-digital', channel: 'digital-products', label: 'Digital Products', monthlyAmount: 600, annualAmount: 7200, growthRate: 35, workspaceId: 'ai-media' },
];

export const DEMO_SERVICE_PROVIDERS: ServiceProviderListing[] = [
  { id: 'svc-editor-1', category: 'video-editors', name: 'Cut Studio Co.', specialty: 'Short-form · Reels · TikTok', rating: '4.9', verified: true },
  { id: 'svc-design-1', category: 'graphic-designers', name: 'ThumbCraft', specialty: 'YouTube & podcast thumbnails', rating: '4.8', verified: true },
  { id: 'svc-va-1', category: 'virtual-assistants', name: 'Ops Ally', specialty: 'Creator ops · inbox · scheduling', rating: '4.7', verified: false },
  { id: 'svc-copy-1', category: 'copywriters', name: 'Hook Lab', specialty: 'Short-form scripts · hooks', rating: '4.8', verified: true },
];

export const DEMO_GROWTH_ANALYTICS: GrowthAnalyticsSnapshot = {
  engagement: '4.2% avg · above niche benchmark',
  audienceGrowth: '+12% MoM · accelerating',
  postingConsistency: '4.5 posts/week · target 5',
  conversion: '2.8% link CTR on sponsored content',
  campaignPerformance: 'Last campaign 112% of view target',
  platformHealth: 'All platforms connected · no strikes',
  partnershipPerformance: '1 active · 1 in negotiation',
  customerLifetimeValue: 'N/A — media model · focus on RPM & deal value',
  improvementAreas: ['Increase posting to 5/week', 'Add email list capture', 'Expand affiliate stack'],
};

export function buildDemoGrowthStorePatch() {
  return {
    registry: DEMO_COMPANY_REGISTRY,
    partnerships: DEMO_PARTNERSHIPS,
    contracts: [DEMO_CONTRACT],
    revenueStreams: DEMO_REVENUE_STREAMS,
    serviceProviders: DEMO_SERVICE_PROVIDERS,
  };
}
