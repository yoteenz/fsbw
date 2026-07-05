import { bootstrapCampaignEngineStore } from './store';
import type { CampaignEngineStore } from './types';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

export function buildCampaignEngineSeed(): Partial<CampaignEngineStore> {
  const campaigns = [
    {
      id: 'camp-money-monday-mar',
      workspaceId: 'ndxbook' as const,
      type: 'content-series' as const,
      name: 'MONEY MONDAY · MARCH CYCLE',
      objective: 'Drive returning readers through money volume · validate stat overlay template',
      relatedStrategyId: 'str-ndx-revenue',
      relatedStrategyLabel: 'MONETIZATION THROUGH TRUST',
      relatedInitiativeId: 'init-money-monday',
      relatedInitiativeLabel: 'MONEY MONDAY',
      owner: 'Chief Marketing Officer',
      executiveSponsor: 'Chief Content Officer',
      timeline: 'Mar 3 – Mar 31 · 4 pages',
      status: 'active' as const,
      priority: 'critical' as const,
      budget: '$2,400',
      budgetSpent: '$1,120',
      expectedOutcome: '+18% CTR · +12% returning readers on money content',
      actualOutcome: 'Labs #38 +18% CTR validated · reader signal building',
      confidencePct: 88,
      targetAudience: 'Money-curious adults 25-45',
      successMetrics: ['CTR', 'Returning readers', 'Campaign ROI'],
      channels: ['TikTok', 'Instagram', 'YouTube Shorts', 'Newsletter'],
      healthPct: 84,
    },
    {
      id: 'camp-page-028',
      workspaceId: 'ndxbook' as const,
      type: 'social-media' as const,
      name: 'PAGE 028 · CROSS-PLATFORM PUSH',
      objective: 'Launch page 028 with coordinated creative + distribution',
      relatedStrategyId: 'str-ndx-growth',
      relatedStrategyLabel: 'READER GRAPH EXPANSION',
      relatedInitiativeId: 'init-cross-platform',
      relatedInitiativeLabel: 'CROSS-PLATFORM DISTRIBUTION',
      owner: 'Chief Marketing Officer',
      executiveSponsor: 'Chief Creative Officer',
      timeline: 'Mar 15 – Mar 22',
      status: 'planning' as const,
      priority: 'high' as const,
      budget: '$800',
      budgetSpent: '$0',
      expectedOutcome: '2x reach vs organic baseline',
      actualOutcome: '—',
      confidencePct: 72,
      targetAudience: 'Existing readers + platform discovery',
      successMetrics: ['Reach', 'Engagement', 'New readers'],
      channels: ['TikTok', 'Instagram', 'Pinterest'],
      healthPct: 76,
    },
    {
      id: 'camp-newsletter-q3',
      workspaceId: 'ndxbook' as const,
      type: 'email-marketing' as const,
      name: 'NEWSLETTER LAUNCH · Q3',
      objective: 'Capture returning readers off-platform · build owned audience',
      relatedStrategyId: 'str-ndx-growth',
      relatedStrategyLabel: 'READER GRAPH EXPANSION',
      relatedInitiativeId: 'init-newsletter',
      relatedInitiativeLabel: 'NEWSLETTER LAUNCH',
      owner: 'Chief Growth Officer',
      executiveSponsor: 'Chief of Staff',
      timeline: 'Jul – Sep 2026',
      status: 'draft' as const,
      priority: 'high' as const,
      budget: '$2,400',
      budgetSpent: '$0',
      expectedOutcome: '15% reader retention lift · 4K signups',
      actualOutcome: '—',
      confidencePct: 68,
      targetAudience: 'Returning ndxbook readers',
      successMetrics: ['Signups', 'Open rate', 'Retention lift'],
      channels: ['Email', 'In-app', 'Social CTAs'],
      healthPct: 71,
    },
    {
      id: 'camp-truth-tuesday',
      workspaceId: 'ndxbook' as const,
      type: 'content-series' as const,
      name: 'TRUTH TUESDAY · FACT-FORWARD CADENCE',
      objective: 'Authority signal through research-gated fact-forward content',
      relatedStrategyId: 'str-ndx-content',
      relatedStrategyLabel: 'AUTHORITY THROUGH CONSISTENCY',
      relatedInitiativeId: 'init-truth-tuesday',
      relatedInitiativeLabel: 'TRUTH TUESDAY',
      owner: 'Chief Content Officer',
      executiveSponsor: 'Chief Legal Officer',
      timeline: 'Weekly · ongoing',
      status: 'active' as const,
      priority: 'medium' as const,
      budget: '$400/mo',
      budgetSpent: '$320',
      expectedOutcome: '100% research gate compliance · authority brand lift',
      actualOutcome: '100% research gate · stable completion rates',
      confidencePct: 91,
      targetAudience: 'Trust-seeking knowledge seekers',
      successMetrics: ['Research compliance', 'Completion rate'],
      channels: ['All platforms'],
      healthPct: 89,
    },
    {
      id: 'camp-fs-noir-launch',
      workspaceId: 'frontal-slayer' as const,
      type: 'product-launch' as const,
      name: 'NOIR · LIVE PREVIEW LAUNCH',
      objective: 'Interactive luxury commerce conversion via Build-a-Wig live previews',
      relatedStrategyId: 'str-fs-product',
      relatedStrategyLabel: 'INTERACTIVE LUXURY COMMERCE',
      relatedInitiativeId: 'init-baw',
      relatedInitiativeLabel: 'BUILD-A-WIG',
      owner: 'Chief Product Officer',
      executiveSponsor: 'Chief Brand Officer',
      timeline: 'Ongoing · phased rollout',
      status: 'active' as const,
      priority: 'critical' as const,
      budget: 'Internal · Fal API',
      budgetSpent: '—',
      expectedOutcome: '+22% BAW completion · higher AOV',
      actualOutcome: 'Live previews shipping · completion improving',
      confidencePct: 85,
      targetAudience: 'Premium raw hair buyers',
      successMetrics: ['BAW completion', 'AOV', 'LTV'],
      channels: ['Site', 'Email', 'Social', 'Concierge'],
      healthPct: 82,
    },
  ];

  const deliverables = [
    { id: 'del-1', campaignId: 'camp-money-monday-mar', type: 'page' as const, title: 'Page 028 · Money habits chapter', status: 'in-production' as const, owner: 'Chief Content Officer', newsroomPageId: 'pg-042', dueAt: daysFromNow(3) },
    { id: 'del-2', campaignId: 'camp-money-monday-mar', type: 'video' as const, title: 'Money Monday · TikTok clip', status: 'in-production' as const, owner: 'Chief Creative Officer', dueAt: daysFromNow(5) },
    { id: 'del-3', campaignId: 'camp-money-monday-mar', type: 'graphic' as const, title: 'Stat overlay thumbnail · Labs #38', status: 'ready' as const, owner: 'Thumbnail Generator', dueAt: daysFromNow(1) },
    { id: 'del-4', campaignId: 'camp-page-028', type: 'page' as const, title: 'Page 028 · core asset', status: 'planned' as const, owner: 'Chief Content Officer', dueAt: daysFromNow(10) },
    { id: 'del-5', campaignId: 'camp-truth-tuesday', type: 'article' as const, title: 'Truth Tuesday · sleep debt page', status: 'in-production' as const, owner: 'Research AI', newsroomPageId: 'pg-041', dueAt: daysFromNow(2) },
    { id: 'del-6', campaignId: 'camp-newsletter-q3', type: 'newsletter' as const, title: 'Welcome sequence · 3 emails', status: 'planned' as const, owner: 'Chief Growth Officer', dueAt: daysFromNow(60) },
  ];

  return {
    dashboard: {
      summary:
        'CAMPAIGN ENGINE V1.0 — transforms strategy into coordinated execution. Campaigns bridge initiatives and operational production. Every deliverable belongs to a campaign.',
      activeCampaigns: 0,
      deliverablesInProduction: 0,
      avgHealthPct: 0,
      totalBudgetAllocated: '$6,000',
      experimentsRunning: 0,
    },
    activeWorkspaceId: 'ndxbook',
    campaigns,
    deliverables,
    departmentCoordination: [
      { department: 'Marketing', responsibilities: ['Campaign sequencing', 'Cross-platform packaging'], deadlines: ['Mar 15 launch brief'], dependencies: ['Creative thumbnails'], approvals: ['CoS soft approval'] },
      { department: 'Creative', responsibilities: ['Thumbnails', 'Stat overlays', 'Platform assets'], deadlines: ['T-3 days before publish'], dependencies: ['Content script lock'], approvals: ['Creative DNA check'] },
      { department: 'Content', responsibilities: ['Scripts', 'Research gate'], deadlines: ['Weekly page cadence'], dependencies: ['Research complete'], approvals: ['Writing Bible'] },
      { department: 'Operations', responsibilities: ['Scheduling', 'Publish optimization'], deadlines: ['Publish window'], dependencies: ['All assets ready'], approvals: ['Autonomous when reversible'] },
      { department: 'Finance', responsibilities: ['Budget tracking', 'ROI reporting'], deadlines: ['Monthly review'], dependencies: ['Campaign spend data'], approvals: ['Founder above $2K'] },
      { department: 'Legal', responsibilities: ['FTC disclosures', 'Affiliate compliance'], deadlines: ['Pre-publish on money content'], dependencies: ['Content final'], approvals: ['Legal template match'] },
    ],
    creatorRecommendations: [
      { id: 'cr-1', campaignId: 'camp-money-monday-mar', creatorName: 'Finance Educator · Tier A', fitScore: 92, audienceMatch: 'Money-curious 25-45', historicalPerformance: '+34% reach on finance clips', budgetFit: 'Within $500/collab band', brandFit: 'Authority tone aligned', reputation: 'Verified · 4.8 rating' },
      { id: 'cr-2', campaignId: 'camp-page-028', creatorName: 'Mind Volume Host · Tier B', fitScore: 78, audienceMatch: 'Existing ndxbook readers', historicalPerformance: 'Strong completion on mind content', budgetFit: 'Within band', brandFit: 'Writing DNA aligned', reputation: 'Internal talent · proven' },
    ],
    experiments: [
      { id: 'exp-1', campaignId: 'camp-money-monday-mar', type: 'thumbnail', label: 'Labs #38 stat overlay vs minimal text', status: 'complete', labsExperimentId: 'labs-38', winner: 'Stat overlay +18% CTR' },
      { id: 'exp-2', campaignId: 'camp-money-monday-mar', type: 'copy', label: 'Question hook vs statement hook', status: 'running', labsExperimentId: 'labs-copy-mm-1' },
      { id: 'exp-3', campaignId: 'camp-page-028', type: 'platform', label: 'TikTok-first vs Instagram-first', status: 'planned' },
    ],
    analytics: {
      'camp-money-monday-mar': {
        reach: '48.2K', engagement: '6.8%', watchTime: '42s avg', clicks: '3,280', sales: '—', conversion: '2.1%', revenue: '$840 affiliate', roi: '3.2x', retention: '+4% returning', customerAcquisition: '820 new readers', readerGrowth: '+12% WoW', brandGrowth: 'Authority signal stable', knowledgeContribution: 'Money template v2 archived',
      },
      'camp-truth-tuesday': {
        reach: '22K', engagement: '8.1%', watchTime: '51s avg', clicks: '1,940', sales: '—', conversion: '—', revenue: '—', roi: '—', retention: '+2%', customerAcquisition: '340', readerGrowth: '+3%', brandGrowth: 'Trust signal up', knowledgeContribution: 'Research gate pattern logged',
      },
    },
    healthScores: {
      'camp-money-monday-mar': { clarity: 92, execution: 85, delivery: 80, budget: 78, engagement: 88, velocity: 82, crossFunctionalAlignment: 86, brandConsistency: 90, overallPct: 84, recommendations: ['Accelerate page 028 to capitalize on CTR winner', 'Lock stat overlay as default for money volume'] },
      'camp-page-028': { clarity: 88, execution: 65, delivery: 60, budget: 95, engagement: 0, velocity: 70, crossFunctionalAlignment: 75, brandConsistency: 85, overallPct: 76, recommendations: ['Complete OAuth setup before launch', 'Finalize page 028 script this week'] },
      'camp-truth-tuesday': { clarity: 90, execution: 91, delivery: 88, budget: 92, engagement: 85, velocity: 90, crossFunctionalAlignment: 88, brandConsistency: 94, overallPct: 89, recommendations: ['Maintain research gate discipline'] },
    },
    intelligence: {
      'camp-money-monday-mar': { momentum: 'accelerating', fatigueRisk: 'Low · week 2 of 4', budgetUtilizationPct: 47, contentVelocity: 'On pace · 1 page/week', recommendations: ['Double down on stat overlay · extend to page 029', 'Prepare newsletter CTA for end of cycle'] },
      'camp-page-028': { momentum: 'steady', fatigueRisk: 'N/A · pre-launch', budgetUtilizationPct: 0, contentVelocity: 'Waiting on OAuth', recommendations: ['Unblock social OAuth · delay launch 1 week if needed'] },
    },
    simulations: {
      'camp-newsletter-q3': {
        expectedReach: '12K existing readers', expectedEngagement: '28% open rate', budgetImpact: '$2.4K total', conversionEstimate: '4K signups · 15% retention lift', resourceRequirements: ['Email system', 'CCO content', 'Creative welcome assets'], timeline: '90 days to signal', risks: ['List building pace', 'Cadence mismatch'], confidencePct: 72, improvements: ['Run pilot with 500 readers first', 'A/B welcome sequence in Labs'],
      },
    },
    retrospectives: [
      {
        id: 'retro-1',
        campaignId: 'camp-money-monday-feb',
        lessonsLearned: ['Stat overlays outperform minimal text on money content', 'CoS soft approval pattern works for recurring campaigns'],
        successfulPatterns: ['Money Monday sequencing · Labs integration · Leadership DNA fast approval'],
        failedAssumptions: ['Casual tone test rejected 3x — Writing Bible enforcement required'],
        futureRecommendations: ['Default Labs #38 for all money thumbnails', 'Pre-build 2-week content buffer'],
        playbookUpdates: ['Money Monday campaign template v2'],
        completedAt: daysAgo(14),
      },
    ],
    calendar: [
      { id: 'cal-1', campaignId: 'camp-money-monday-mar', title: 'MONEY MONDAY MARCH', startAt: daysAgo(7), endAt: daysFromNow(21), view: 'monthly', overlapTags: ['Q1', 'money volume'] },
      { id: 'cal-2', campaignId: 'camp-page-028', title: 'PAGE 028 PUSH', startAt: daysFromNow(10), endAt: daysFromNow(17), view: 'weekly', overlapTags: ['product moment', 'spring'] },
      { id: 'cal-3', campaignId: 'camp-newsletter-q3', title: 'NEWSLETTER LAUNCH', startAt: daysFromNow(60), endAt: daysFromNow(120), view: 'quarterly', overlapTags: ['Q3', 'owned audience'] },
    ],
    inheritanceOptions: [
      { id: 'inh-mm', label: 'MONEY MONDAY CAMPAIGN FRAMEWORK', sourceWorkspaceId: 'ndxbook', description: 'Weekly money volume cycle · stat overlay · CoS approval · ROI tracking', includesWorkflows: true },
      { id: 'inh-content-series', label: 'CONTENT SERIES CAMPAIGN TEMPLATE', sourceWorkspaceId: 'ndxbook', description: 'Volume cadence · research gate · cross-platform packaging', includesWorkflows: true },
      { id: 'inh-product-launch', label: 'PRODUCT LAUNCH CAMPAIGN PLAYBOOK', sourceWorkspaceId: 'frontal-slayer', description: 'Interactive commerce launch · concierge · membership hooks', includesWorkflows: true },
    ],
    playbooks: [
      { id: 'pb-1', title: 'MONEY MONDAY CAMPAIGN PLAYBOOK v2', sourceCampaignId: 'camp-money-monday-feb', description: 'Sequencing · stat overlay default · CoS soft approval · ROI deck' },
      { id: 'pb-2', title: 'CROSS-PLATFORM PAGE LAUNCH', sourceCampaignId: 'camp-page-027', description: 'Creative brief → thumbnail → 3-platform packaging → publish window' },
    ],
    builderStep: 5,
    selectedCampaignId: 'camp-money-monday-mar',
  };
}

export function bootstrapCampaignEnginePlatform(): void {
  bootstrapCampaignEngineStore(buildCampaignEngineSeed());
}
