import { bootstrapGrowthArchitectStore } from './store';
import type { GrowthArchitectStore } from './types';

export function buildGrowthArchitectSeed(): Partial<GrowthArchitectStore> {
  return {
    companyName: 'NDXBOOK',
    dashboard: {
      summary: 'GROWTH ARCHITECT V1.0 — transform digital ecosystems into thriving businesses · intentional growth OS · compound value over decades.',
      growthHealthPct: 81,
      acquisitionPct: 76,
      retentionPct: 84,
      revenueGrowthPct: 72,
      relationshipGrowthPct: 88,
      knowledgeGrowthPct: 91,
      lifecycleStage: 'traction',
    },
    activeWorkspaceId: 'ndxbook',
    growthPhilosophy: [
      'Growth never depends on random tactics',
      'Every initiative from strategy · reinforces brand · strengthens relationships',
      'Healthy sustainable growth · relationship-driven · mission-aligned',
      'Compound trust · knowledge · relationships · revenue · org intelligence',
    ],
    blueprintPillars: [
      { id: 'bp-1', pillar: 'LAUNCH STRATEGY', strategy: '100K readers initiative · authority through consistency · Money Monday · Truth Tuesday cadence', status: 'active' },
      { id: 'bp-2', pillar: 'CUSTOMER ACQUISITION', strategy: 'Stat-forward pages · distribution engine · organic SEO · Labs-validated templates', status: 'active' },
      { id: 'bp-3', pillar: 'CUSTOMER ACTIVATION', strategy: 'First page read → newsletter → membership consideration · no pressure', status: 'active' },
      { id: 'bp-4', pillar: 'CUSTOMER RETENTION', strategy: 'Relationship engine · returning reader focus · compounding trust', status: 'active' },
      { id: 'bp-5', pillar: 'COMMUNITY GROWTH', strategy: 'Lounge TV · advocate pipeline · reader communities', status: 'active' },
      { id: 'bp-6', pillar: 'CREATOR GROWTH', strategy: 'Creator marketplace · Jordan T pipeline · alignment over followers', status: 'planned' },
      { id: 'bp-7', pillar: 'ORGANIC GROWTH', strategy: 'Knowledge asset engine · evergreen distribution · page strategy', status: 'active' },
      { id: 'bp-8', pillar: 'REFERRAL GROWTH', strategy: 'Share stat pages · advocate recognition · word-of-mouth authority', status: 'planned' },
      { id: 'bp-9', pillar: 'KNOWLEDGE GROWTH', strategy: 'Institutional memory · knowledge compounds · cross-brand linking', status: 'mature' },
      { id: 'bp-10', pillar: 'REVENUE DIVERSIFICATION', strategy: 'Membership · commerce · creator deals · future B2B', status: 'planned' },
    ],
    lifecycleStages: [
      { id: 'idea', label: 'IDEA', description: 'Authority media vision · stat-forward concept', current: false },
      { id: 'validation', label: 'VALIDATION', description: 'Page strategy · reader response · Labs experiments', current: false },
      { id: 'launch', label: 'LAUNCH', description: 'Newsroom launch · Studio OS platform', current: false },
      { id: 'traction', label: 'TRACTION', description: 'Growing reader base · membership · distribution cadence', current: true },
      { id: 'optimization', label: 'OPTIMIZATION', description: 'Conversion · retention · relationship engine maturation', current: false },
      { id: 'scale', label: 'SCALE', description: '100K readers · cross-brand · creator ecosystem', current: false },
      { id: 'expansion', label: 'EXPANSION', description: 'Frontal Slayer integration · portfolio growth', current: false },
      { id: 'leadership', label: 'LEADERSHIP', description: 'Category authority · institutional trust', current: false },
      { id: 'legacy', label: 'LEGACY', description: 'Decades of compounding · organizational intelligence', current: false },
    ],
    initiatives: [
      { id: 'init-1', title: '100K READERS · AUTHORITY GOAL', type: 'Strategic initiative', strategyLink: 'Strategy Engine · 100K readers', status: 'active', priority: 'critical' },
      { id: 'init-2', title: 'MONEY MONDAY · TRUTH TUESDAY CADENCE', type: 'Campaign launch', strategyLink: 'Campaign Engine · weekly cadence', status: 'active', priority: 'high' },
      { id: 'init-3', title: 'CREATOR PROGRAM FORMALIZATION', type: 'Creator program', strategyLink: 'Creator Marketplace · Jordan T', status: 'planned', priority: 'high' },
      { id: 'init-4', title: 'MEMBERSHIP TIER EXPANSION', type: 'Product launch', strategyLink: 'Business Model Engine · membership', status: 'planned', priority: 'medium' },
      { id: 'init-5', title: 'ADVOCATE PIPELINE · REFERRAL', type: 'Community launch', strategyLink: 'Relationship Engine · advocate', status: 'planned', priority: 'medium' },
      { id: 'init-6', title: 'CROSS-BRAND FS INTEGRATION', type: 'Market expansion', strategyLink: 'Organizational Inheritance · portfolio', status: 'planned', priority: 'medium' },
    ],
    gtmPlans: [
      {
        id: 'gtm-1',
        initiative: '100K READERS CAMPAIGN',
        positioning: 'Authority through consistency · stat-forward · not hype',
        targetAudience: 'Financial clarity seekers · returning readers · 25-45',
        channelStrategy: 'Distribution engine · email · social stat cards · SEO pages',
        messaging: 'Writing Bible voice · one idea per page · compound trust',
        launchSequence: ['Strategy alignment', 'Campaign engine setup', 'Distribution calendar', 'Labs validation', 'Scale'],
        successMetrics: ['Returning readers', 'Newsletter signups', 'Page engagement', 'Membership conversion'],
        riskLevel: 'low',
      },
      {
        id: 'gtm-2',
        initiative: 'CREATOR MARKETPLACE LAUNCH',
        positioning: 'Alignment over follower counts · intelligent matching',
        targetAudience: 'Creators · brands · ndxbook advocates',
        channelStrategy: 'Creator marketplace · relationship engine · reader graph pipeline',
        messaging: 'Authority partnership · stat-forward collaboration',
        launchSequence: ['Creator profiles', 'Matching engine', 'Deal templates', 'Pilot creators', 'Scale'],
        successMetrics: ['Creator deals', 'Brand lift', 'Audience crossover', 'Revenue share'],
        riskLevel: 'medium',
      },
    ],
    intelligenceAlerts: [
      { id: 'gi-1', category: 'GROWTH VELOCITY', signal: 'Page engagement +12% · Money Monday resonance', recommendation: 'Expand stat-forward template · Labs cadence', priority: 'high' },
      { id: 'gi-2', category: 'RETENTION', signal: 'Returning reader rate 68% · above benchmark', recommendation: 'Relationship engine · anniversary moments', priority: 'medium' },
      { id: 'gi-3', category: 'ACQUISITION', signal: 'SEO pages indexing · organic traffic growing', recommendation: 'Distribution engine · evergreen optimization', priority: 'high' },
      { id: 'gi-4', category: 'COMMUNITY', signal: 'Advocate pipeline growing · Jordan T active', recommendation: 'Formalize creator program · marketplace activation', priority: 'high' },
      { id: 'gi-5', category: 'KNOWLEDGE', signal: 'Knowledge assets 847+ · institutional leader', recommendation: 'Cross-brand KG linking · ecosystem marketplace', priority: 'medium' },
    ],
    simulations: [
      { id: 'sim-1', label: '100K READERS · 12-MONTH PATH', marketResponsePct: 82, adoptionPct: 78, conversionPct: 74, revenueImpact: '+18% membership · +12% commerce', resourceReq: 'Campaign + distribution · CoS orchestration', operationalStrainPct: 35, confidencePct: 86, recommendations: ['Strong fit · strategy-aligned · relationship-driven'] },
      { id: 'sim-2', label: 'CREATOR PROGRAM LAUNCH', marketResponsePct: 75, adoptionPct: 68, conversionPct: 62, revenueImpact: '+8% revenue diversification', resourceReq: 'Creator marketplace · legal templates', operationalStrainPct: 48, confidencePct: 78, recommendations: ['Phase after 100K momentum · pilot 3 creators first'] },
      { id: 'sim-3', label: 'PAID ACQUISITION SCALE', marketResponsePct: 65, adoptionPct: 70, conversionPct: 58, revenueImpact: '+22% traffic · CAC risk', resourceReq: 'Finance forecasting · attribution', operationalStrainPct: 55, confidencePct: 62, recommendations: ['Defer until attribution mature · organic first'] },
    ],
    orchestration: [
      { id: 'orch-1', system: 'Strategy Engine', role: 'Initiative prioritization · alignment checks', status: 'connected' },
      { id: 'orch-2', system: 'Campaign Engine', role: 'Campaign execution · deliverables · analytics', status: 'connected' },
      { id: 'orch-3', system: 'Distribution Engine', role: 'Channel optimization · evergreen · calendar', status: 'connected' },
      { id: 'orch-4', system: 'Relationship Engine', role: 'Nurture · next best action · retention', status: 'connected' },
      { id: 'orch-5', system: 'Reader Graph', role: 'Journey · behavior · advocacy pipeline', status: 'connected' },
      { id: 'orch-6', system: 'Creator Marketplace', role: 'Creator deals · career graph', status: 'planned' },
      { id: 'orch-7', system: 'Chief of Staff', role: 'Founder approval · delegation · orchestration', status: 'connected' },
      { id: 'orch-8', system: 'Newsroom', role: 'Content cadence · editorial QA', status: 'connected' },
    ],
    experiments: [
      { id: 'exp-1', type: 'Campaign', hypothesis: 'Stat overlay v1 · money volume pages', status: 'completed', learningRecorded: true },
      { id: 'exp-2', type: 'Channel', hypothesis: 'Truth Tuesday · sleep debt resonance', status: 'running', learningRecorded: true },
      { id: 'exp-3', type: 'Creator', hypothesis: 'Jordan T · advocate → creator pipeline', status: 'running', learningRecorded: false },
      { id: 'exp-4', type: 'Referral', hypothesis: 'Share stat page · advocate recognition', status: 'planned', learningRecorded: false },
      { id: 'exp-5', type: 'Pricing', hypothesis: 'Membership tier value messaging', status: 'planned', learningRecorded: false },
    ],
    marketIntelligence: [
      { id: 'mi-1', category: 'INDUSTRY', signal: 'Finance influencer saturation · hype fatigue', implication: 'Authority whitespace · stat-forward differentiation', urgency: 'act' },
      { id: 'mi-2', category: 'CREATOR ECONOMY', signal: 'Alignment over followers trend', implication: 'Creator marketplace positioning validated', urgency: 'watch' },
      { id: 'mi-3', category: 'CONSUMER', signal: 'Attention scarcity · trust premium', implication: 'Consistency cadence · respect time', urgency: 'act' },
      { id: 'mi-4', category: 'TECHNOLOGY', signal: 'AI content flood · quality differentiation', implication: 'Knowledge asset engine · institutional memory moat', urgency: 'watch' },
    ],
    expansionOpportunities: [
      { id: 'exp-op-1', type: 'NEW MARKET', opportunity: 'Frontal Slayer · luxury commerce crossover', sustainability: 'Brand DNA blend · inherited genetics', confidencePct: 72 },
      { id: 'exp-op-2', type: 'NEW SEGMENT', opportunity: 'B2B authority partnerships · enterprise readers', sustainability: 'Long-term trust · not transactional', confidencePct: 65 },
      { id: 'exp-op-3', type: 'NEW REVENUE', opportunity: 'Creator marketplace B2B deals', sustainability: 'Alignment · relationship-driven', confidencePct: 78 },
      { id: 'exp-op-4', type: 'PORTFOLIO', opportunity: 'Cross-brand knowledge inheritance', sustainability: 'Organizational intelligence compounds', confidencePct: 84 },
    ],
    launchCalendar: [
      { id: 'cal-1', date: '2026-Q3', label: '100K READERS MILESTONE PUSH', type: 'Strategic campaign' },
      { id: 'cal-2', date: '2026-Q4', label: 'CREATOR PROGRAM PILOT', type: 'Creator launch' },
      { id: 'cal-3', date: '2027-Q1', label: 'MEMBERSHIP TIER EXPANSION', type: 'Product launch' },
      { id: 'cal-4', date: '2027-Q2', label: 'FS CROSS-BRAND INTEGRATION', type: 'Market expansion' },
    ],
    futureOpportunities: [
      'International expansion · English-first authority markets',
      'Enterprise growth · B2B authority licensing',
      'Knowledge marketplace · ecosystem asset exchange',
      'Decade compounding · legacy organizational intelligence',
    ],
  };
}

export function bootstrapGrowthArchitectPlatform(): void {
  bootstrapGrowthArchitectStore(buildGrowthArchitectSeed());
}
