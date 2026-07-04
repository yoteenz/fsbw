import type { GrowthProfile } from './types';
import { DEFAULT_GROWTH_PRIVACY } from './constants';

type WorkspaceSeedInput = {
  workspaceId: string;
  companyName: string;
  companyType: GrowthProfile['companyType'];
  niche: string;
  description: string;
  founderProfile?: string;
};

export function buildDefaultGrowthProfile(input: WorkspaceSeedInput): GrowthProfile {
  const now = new Date().toISOString();
  return {
    workspaceId: input.workspaceId,
    companyOverview: input.description,
    founderProfile: input.founderProfile ?? 'Founder · VXD Inc.',
    niche: input.niche,
    audience: 'Pending audience definition — update as analytics mature',
    products: [],
    services: [],
    socialPlatforms: [],
    engagementSummary: 'Baseline — connect platforms to populate',
    monthlyGrowth: '0%',
    partnerships: [],
    affiliatePrograms: [],
    revenueChannels: [],
    currentGoals: ['Define growth profile', 'Connect revenue channels', 'Review opportunity matches'],
    growthScore: 42,
    roadmapStage: input.workspaceId === 'ai-media' ? 'traction' : 'launch',
    companyType: input.companyType,
    updatedAt: now,
    privacy: { ...DEFAULT_GROWTH_PRIVACY },
    memoryBibleGrowth: {
      businessGoals: ['Sustainable revenue growth', 'Strategic partnerships', 'Audience expansion'],
      growthStrategy: 'Pilot-first validation inside studio os before production promotion',
      preferredPartnershipTypes: ['brand-partnership', 'affiliate-program', 'sponsorship'],
      pricingPhilosophy: 'Value-based — align with audience quality and engagement depth',
      brandRestrictions: ['No misaligned brand categories', 'Founder approval required for exclusivity'],
      longTermObjectives: ['Scale intelligently', 'Diversify revenue', 'Build institutional partnerships'],
      growthHistory: [`Growth profile auto-provisioned · ${now.slice(0, 10)}`],
    },
  };
}

export function buildAiMediaGrowthProfile(): GrowthProfile {
  const base = buildDefaultGrowthProfile({
    workspaceId: 'ai-media',
    companyName: 'AI Media',
    companyType: 'media-company',
    niche: 'AI-powered educational media · short-form content',
    description:
      'AI-powered educational media company producing highly engaging short-form content across multiple social platforms. Permanent pilot workspace for studio os feature validation.',
    founderProfile: 'Founder · VXD Inc. · studio os platform architect',
  });

  return {
    ...base,
    audience: '18–34 · education-curious · multi-platform short-form viewers',
    products: ['Short-form video series', 'Educational micro-lessons', 'Platform-native content packs'],
    services: ['Content strategy', 'Distribution optimization', 'UGC campaign direction'],
    socialPlatforms: ['YouTube Shorts', 'Instagram Reels', 'TikTok', 'LinkedIn'],
    engagementSummary: '4.2% avg engagement · 12% MoM audience growth (pilot metrics)',
    monthlyGrowth: '+12%',
    partnerships: ['EdTech pilot brand (qualified)', 'Creator tools affiliate'],
    affiliatePrograms: ['Creator SaaS stack', 'Education platform referrals'],
    revenueChannels: ['brand-deals', 'affiliate-income', 'platform-payouts', 'digital-products'],
    currentGoals: [
      'Validate Growth Network on pilot workspace',
      'Close first brand partnership through deal pipeline',
      'Diversify affiliate revenue streams',
      'Increase sponsorship pricing based on engagement data',
    ],
    growthScore: 68,
    roadmapStage: 'traction',
    memoryBibleGrowth: {
      ...base.memoryBibleGrowth,
      businessGoals: [
        'Become permanent pilot for studio os growth capabilities',
        'Build repeatable partnership playbook',
        'Scale content without sacrificing quality',
      ],
      growthStrategy:
        'Use AI Media to validate every Growth Network feature before Frontal Slayer promotion — real production testing, not demo-only.',
      preferredPartnershipTypes: [
        'brand-partnership',
        'sponsorship',
        'affiliate-program',
        'ugc-opportunity',
        'podcast-appearance',
      ],
      growthHistory: [
        '2026-07 — Growth Network v1.0 profile provisioned',
        '2026-07 — Pilot workspace designated reference for growth features',
      ],
    },
  };
}
