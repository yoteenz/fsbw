import { COS_STRATEGY_QUESTIONS } from './constants';
import { bootstrapStrategyEngineStore } from './store';
import type { StrategyEngineStore } from './types';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

export function buildStrategyEngineSeed(): Partial<StrategyEngineStore> {
  const ndxbookProfile = {
    workspaceId: 'ndxbook' as const,
    workspaceLabel: 'NDXBOOK',
    vision: 'Become the most trusted indexed knowledge brand for modern life.',
    mission: 'Turn complex topics into daily pages people return to.',
    companyObjective: 'Reach 100,000 readers.',
    primaryGoal: 'Build returning reader habit',
    secondaryGoals: ['Launch newsletter', 'Grow reader graph', 'Cross-platform distribution'],
    northStarMetric: 'Returning readers',
    northStarCurrent: '12,400',
    northStarTarget: '100,000',
    primaryKpi: 'Weekly returning reader rate',
    secondaryKpis: ['Pages published/week', 'Completion rate', 'Newsletter signups'],
    timeHorizon: '18 months',
    growthStage: 'traction' as const,
    businessModel: 'Media · sponsorship · premium · affiliate',
    targetAudience: 'Curious adults 25-45 seeking practical knowledge',
    marketPosition: 'Authority through consistency · not hype',
    competitiveAngle: 'Daily indexed pages · volume cadence · institutional knowledge',
    revenueStrategy: 'Sponsorship + affiliate + future premium volumes',
    brandStrategy: 'Authority through consistency',
    contentStrategy: 'Daily pages · volume cadence · Money Monday through Future Friday',
    partnershipStrategy: 'Creator marketplace for reach · subject experts for authority',
    talentStrategy: 'AI hosts + credible subject experts for authority volumes',
    riskTolerance: 'moderate' as const,
    currentConstraints: ['14 pages/week capacity', 'Thumbnail queue bottleneck', 'OAuth pending for social distribution'],
  };

  const frontalSlayerProfile = {
    workspaceId: 'frontal-slayer' as const,
    workspaceLabel: 'FRONTAL SLAYER',
    vision: 'The luxury destination for raw hair and community.',
    mission: 'Make every woman feel like she has a hair bestie and concierge.',
    companyObjective: 'Become the luxury destination for raw hair.',
    primaryGoal: 'Maximize lifetime customer value',
    secondaryGoals: ['Grow membership', 'Expand Build-a-Wig adoption', 'Scale lounge TV community'],
    northStarMetric: 'Lifetime customer value',
    northStarCurrent: '$847',
    northStarTarget: '$1,400',
    primaryKpi: 'LTV · repeat purchase rate',
    secondaryKpis: ['Membership conversion', 'Build-a-Wig completion rate', 'Concierge engagement'],
    timeHorizon: '24 months',
    growthStage: 'scale' as const,
    businessModel: 'Luxury commerce · membership · rewards · affiliate',
    targetAudience: 'Women seeking premium raw hair with concierge-level support',
    marketPosition: 'Community-first luxury commerce',
    competitiveAngle: 'Interactive Build-a-Wig · hair analysis · lounge TV · no gatekeeping',
    revenueStrategy: 'Premium units · membership · rewards · affiliate program',
    brandStrategy: 'Community-first luxury · trust over sales',
    contentStrategy: 'Lounge TV · Slay Report · educational concierge content',
    partnershipStrategy: 'Affiliate program · influencer collaborations with conversion focus',
    talentStrategy: 'Founder voice · PSA concierge · stylists for education',
    riskTolerance: 'moderate' as const,
    currentConstraints: ['Premium positioning limits mass-market tactics', 'Founder voice required for key campaigns'],
  };

  const ndxbookStrategies = [
    { id: 'str-ndx-content', workspaceId: 'ndxbook' as const, type: 'content' as const, title: 'AUTHORITY THROUGH CONSISTENCY', approach: 'Daily indexed pages · volume cadence · institutional knowledge growth', objectiveLink: 'Reach 100,000 readers', status: 'active' as const, ownerExecutive: 'Chief Content Officer', successMetrics: ['Returning readers', 'Completion rate'], timeHorizon: '18 months' },
    { id: 'str-ndx-growth', workspaceId: 'ndxbook' as const, type: 'growth' as const, title: 'READER GRAPH EXPANSION', approach: 'Cross-platform distribution · newsletter · short-form educational clips', objectiveLink: 'Reach 100,000 readers', status: 'active' as const, ownerExecutive: 'Chief Marketing Officer', successMetrics: ['Newsletter signups', 'Platform reach'], timeHorizon: '12 months' },
    { id: 'str-ndx-revenue', workspaceId: 'ndxbook' as const, type: 'revenue' as const, title: 'MONETIZATION THROUGH TRUST', approach: 'Money Monday · affiliate · sponsorship when authority established', objectiveLink: 'Sustainable media revenue', status: 'active' as const, ownerExecutive: 'Chief Financial Officer', successMetrics: ['Campaign ROI', 'Affiliate conversion'], timeHorizon: '18 months' },
  ];

  const fsStrategies = [
    { id: 'str-fs-brand', workspaceId: 'frontal-slayer' as const, type: 'brand' as const, title: 'COMMUNITY-FIRST LUXURY', approach: 'Trust over sales · concierge · no gatekeeping · lounge TV community', objectiveLink: 'Luxury destination for raw hair', status: 'active' as const, ownerExecutive: 'Chief Brand Officer', successMetrics: ['Brand sentiment', 'Community engagement'], timeHorizon: '24 months' },
    { id: 'str-fs-product', workspaceId: 'frontal-slayer' as const, type: 'product' as const, title: 'INTERACTIVE LUXURY COMMERCE', approach: 'Build-a-Wig · hair analysis · personalized unit experience', objectiveLink: 'LTV growth', status: 'active' as const, ownerExecutive: 'Chief Product Officer', successMetrics: ['BAW completion rate', 'LTV'], timeHorizon: '24 months' },
    { id: 'str-fs-revenue', workspaceId: 'frontal-slayer' as const, type: 'revenue' as const, title: 'MEMBERSHIP & RETENTION', approach: 'Rewards · membership tiers · slay tickets · repeat purchase loops', objectiveLink: 'Maximize LTV', status: 'active' as const, ownerExecutive: 'Chief Financial Officer', successMetrics: ['Membership conversion', 'Repeat purchase rate'], timeHorizon: '18 months' },
  ];

  const ndxbookInitiatives = [
    { id: 'init-daily-pages', workspaceId: 'ndxbook' as const, name: 'DAILY PAGES', objective: '14 pages/week throughput', owner: 'Chief Content Officer', relatedStrategyId: 'str-ndx-content', relatedCampaigns: ['Volume cadence'], relatedProjects: ['Mind volume', 'Money volume'], successMetrics: ['Pages/week', 'Completion rate'], timeline: 'Ongoing', priority: 'critical' as const, status: 'active' as const, risks: ['Thumbnail bottleneck'], expectedImpact: '+3 pages/week mind cadence', actualImpact: 'On track · 12 pages last week' },
    { id: 'init-money-monday', workspaceId: 'ndxbook' as const, name: 'MONEY MONDAY', objective: 'Weekly money volume campaign cycle', owner: 'Chief Marketing Officer', relatedStrategyId: 'str-ndx-revenue', relatedCampaigns: ['Money Monday March'], relatedProjects: ['Page 028 campaign'], successMetrics: ['Campaign ROI', 'Reach'], timeline: 'Weekly', priority: 'high' as const, status: 'active' as const, risks: ['Tone compliance'], expectedImpact: '+18% CTR with stat overlays', actualImpact: 'Labs #38 validated' },
    { id: 'init-newsletter', workspaceId: 'ndxbook' as const, name: 'NEWSLETTER LAUNCH', objective: 'Capture returning readers off-platform', owner: 'Chief Growth Officer', relatedStrategyId: 'str-ndx-growth', relatedCampaigns: ['Reader graph'], relatedProjects: ['Email system'], successMetrics: ['Signups', 'Open rate'], timeline: 'Q3 2026', priority: 'high' as const, status: 'planned' as const, risks: ['List building pace'], expectedImpact: '15% reader retention lift', actualImpact: '—' },
    { id: 'init-truth-tuesday', workspaceId: 'ndxbook' as const, name: 'TRUTH TUESDAY', objective: 'Fact-forward volume cadence', owner: 'Chief Content Officer', relatedStrategyId: 'str-ndx-content', relatedCampaigns: [], relatedProjects: [], successMetrics: ['Research gate compliance'], timeline: 'Weekly', priority: 'medium' as const, status: 'active' as const, risks: [], expectedImpact: 'Authority signal', actualImpact: '100% research gate' },
    { id: 'init-cross-platform', workspaceId: 'ndxbook' as const, name: 'CROSS-PLATFORM DISTRIBUTION', objective: 'TikTok · Instagram · YouTube packaging', owner: 'Chief Marketing Officer', relatedStrategyId: 'str-ndx-growth', relatedCampaigns: [], relatedProjects: ['Social OAuth setup'], successMetrics: ['Platform reach'], timeline: 'Q2-Q3 2026', priority: 'high' as const, status: 'active' as const, risks: ['OAuth not configured'], expectedImpact: '2x reach', actualImpact: 'Pending OAuth' },
  ];

  const fsInitiatives = [
    { id: 'init-baw', workspaceId: 'frontal-slayer' as const, name: 'BUILD-A-WIG', objective: 'Interactive luxury unit customization', owner: 'Chief Product Officer', relatedStrategyId: 'str-fs-product', relatedCampaigns: ['NOIR launch'], relatedProjects: ['Live preview WebPs'], successMetrics: ['BAW completion rate'], timeline: 'Ongoing', priority: 'critical' as const, status: 'active' as const, risks: ['Preview generation latency'], expectedImpact: 'Higher AOV + satisfaction', actualImpact: 'Live previews shipping' },
    { id: 'init-membership', workspaceId: 'frontal-slayer' as const, name: 'MEMBERSHIP', objective: 'Premium tier conversion', owner: 'Chief Financial Officer', relatedStrategyId: 'str-fs-revenue', relatedCampaigns: [], relatedProjects: ['Stripe membership'], successMetrics: ['Conversion rate', 'LTV'], timeline: 'Ongoing', priority: 'high' as const, status: 'active' as const, risks: [], expectedImpact: '+22% LTV', actualImpact: 'Growing' },
    { id: 'init-lounge-tv', workspaceId: 'frontal-slayer' as const, name: 'LOUNGE TV', objective: 'Community content hub', owner: 'Chief Brand Officer', relatedStrategyId: 'str-fs-brand', relatedCampaigns: ['Slay Report'], relatedProjects: [], successMetrics: ['Watch time', 'Community engagement'], timeline: 'Ongoing', priority: 'medium' as const, status: 'active' as const, risks: [], expectedImpact: 'Brand loyalty', actualImpact: 'Friday 7PM cadence' },
    { id: 'init-concierge', workspaceId: 'frontal-slayer' as const, name: 'CONCIERGE', objective: 'Hair bestie · educator · no gatekeeping', owner: 'Chief Brand Officer', relatedStrategyId: 'str-fs-brand', relatedCampaigns: [], relatedProjects: ['PSA founder voice'], successMetrics: ['Concierge sessions', 'NPS'], timeline: 'Ongoing', priority: 'high' as const, status: 'active' as const, risks: [], expectedImpact: 'Trust + conversion', actualImpact: 'Strong engagement' },
  ];

  const bets = [
    { id: 'bet-ndx-shortform', workspaceId: 'ndxbook' as const, hypothesis: 'Short-form educational content can build an audience faster than traditional media', status: 'testing' as const, confidencePct: 72, evidenceFor: ['TikTok reach on page clips +34%', 'Completion rate stable'], evidenceAgainst: ['Long-form still drives returning readers'], startedAt: daysAgo(60), lastReviewedAt: daysAgo(3) },
    { id: 'bet-fs-interactive', workspaceId: 'frontal-slayer' as const, hypothesis: 'Interactive luxury commerce can convert better than standard ecommerce', status: 'validated' as const, confidencePct: 88, evidenceFor: ['BAW completion +22% vs catalog', 'Higher AOV on customized units'], evidenceAgainst: [], startedAt: daysAgo(180), lastReviewedAt: daysAgo(7) },
    { id: 'bet-studio-inheritance', workspaceId: 'studio-os' as const, hypothesis: 'Companies can inherit organizational genetics instead of starting from zero', status: 'testing' as const, confidencePct: 81, evidenceFor: ['M42 inheritance wizard shipped', 'Multi-source blend demo'], evidenceAgainst: ['Needs live company activation data'], startedAt: daysAgo(14), lastReviewedAt: daysAgo(1) },
  ];

  const health = {
    clarity: 91,
    alignment: 84,
    executionProgress: 78,
    kpiMovement: 72,
    riskLevel: 68,
    resourceFit: 80,
    timing: 85,
    confidence: 83,
    marketSignal: 76,
    learningVelocity: 88,
    overallPct: 82,
    weakAreas: ['KPI movement · thumbnail bottleneck affecting content throughput', 'Cross-platform distribution blocked on OAuth'],
    recommendations: ['Unblock social OAuth to accelerate reader graph initiative', 'Route thumbnail queue through default template automation', 'Run newsletter launch simulation before Q3 commit'],
  };

  return {
    dashboard: {
      summary: 'STRATEGY ENGINE V1.0 — defines the game each company is playing. Studio Intelligence recommends · Chief of Staff prioritizes · Newsroom produces · Strategy Engine defines why work matters.',
      activeStrategies: 0,
      activeInitiatives: 0,
      strategicBets: 0,
      alignmentRatePct: 0,
      strategyHealthPct: 82,
    },
    activeWorkspaceId: 'ndxbook',
    profiles: [ndxbookProfile, frontalSlayerProfile],
    strategies: [...ndxbookStrategies, ...fsStrategies],
    initiatives: [...ndxbookInitiatives, ...fsInitiatives],
    bets,
    health,
    decisions: [
      { id: 'dec-1', workspaceId: 'ndxbook', decision: 'Prioritize Money Monday over ad-hoc campaigns', context: 'Q2 revenue pacing below target', reasoning: 'Money volume has proven ROI · aligns with authority strategy', expectedOutcome: '+15% reach on money content', actualOutcome: 'Labs #38 +18% CTR validated', relatedStrategyId: 'str-ndx-revenue', relatedInitiativeId: 'init-money-monday', relatedMetrics: ['Campaign ROI', 'CTR'], lessonsLearned: ['Stat overlays default for money volume'], decidedAt: daysAgo(21) },
      { id: 'dec-2', workspaceId: 'ndxbook', decision: 'Pause non-volume page experiments', context: 'Capacity constraint · 14 pages/week target', reasoning: 'Does not support active content strategy', expectedOutcome: 'Recover 2 pages/week capacity', actualOutcome: 'Capacity recovered', relatedStrategyId: 'str-ndx-content', relatedInitiativeId: 'init-daily-pages', relatedMetrics: ['Pages/week'], lessonsLearned: ['Strategy alignment gate prevents drift'], decidedAt: daysAgo(14) },
    ],
    reviews: [
      { id: 'rev-1', type: 'weekly-pulse', title: 'WEEKLY STRATEGY PULSE', schedule: 'Mondays · 9 AM', agenda: ['North star movement', 'Initiative health', 'Alignment flags', 'CoS priority stack'], preparedBy: 'studio-intelligence', moderatedBy: 'chief-of-staff', founderAttendance: 'optional', nextAt: daysFromNow(1) },
      { id: 'rev-2', type: 'monthly-review', title: 'MONTHLY STRATEGY REVIEW', schedule: 'First Monday · 2 PM', agenda: ['Objective progress', 'Strategy health score', 'Bet updates', 'Resource reallocation'], preparedBy: 'studio-intelligence', moderatedBy: 'chief-of-staff', founderAttendance: 'scheduled-only', nextAt: daysFromNow(14) },
      { id: 'rev-3', type: 'quarterly-reset', title: 'QUARTERLY STRATEGIC RESET', schedule: 'Quarter start', agenda: ['OKR review', 'Strategy revision', 'Initiative portfolio', 'Simulation results'], preparedBy: 'studio-intelligence', moderatedBy: 'chief-of-staff', founderAttendance: 'always', nextAt: daysFromNow(45) },
      { id: 'rev-4', type: 'annual-planning', title: 'ANNUAL PLANNING', schedule: 'December · 2 days', agenda: ['Vision alignment', 'Annual objective', 'Strategy portfolio', 'Budget allocation'], preparedBy: 'studio-intelligence', moderatedBy: 'chief-of-staff', founderAttendance: 'always', nextAt: daysFromNow(180) },
    ],
    alignmentChecks: [
      { id: 'align-1', workItem: 'Page 042 · compound interest', workType: 'ndxbook-page', aligned: true, strategyId: 'str-ndx-content', initiativeId: 'init-daily-pages', campaignId: 'money-monday', reviewRequired: false, reason: 'Connects to money volume · daily pages initiative · content strategy' },
      { id: 'align-2', workItem: 'Random trending topic page', workType: 'ndxbook-page', aligned: false, strategyId: '', initiativeId: '', campaignId: '', reviewRequired: true, reason: 'No volume · chapter · campaign · or initiative connection — flagged for CoS review' },
      { id: 'align-3', workItem: 'NOIR color preview campaign', workType: 'frontal-slayer-campaign', aligned: true, strategyId: 'str-fs-product', initiativeId: 'init-baw', campaignId: 'noir-launch', reviewRequired: false, reason: 'Supports interactive luxury commerce · BAW initiative · product strategy' },
    ],
    intelligenceSignals: [
      { id: 'sig-1', workspaceId: 'ndxbook', signal: 'Objective progress slowing — returning readers flat WoW', severity: 'warning', recommendation: 'Accelerate newsletter launch · unblock cross-platform distribution', confidencePct: 87 },
      { id: 'sig-2', workspaceId: 'ndxbook', signal: 'North star metric improved +4% MoM', severity: 'info', recommendation: 'Double down on Money Monday · stat overlay default', confidencePct: 92 },
      { id: 'sig-3', workspaceId: 'ndxbook', signal: 'Initiative underperforming · cross-platform distribution', severity: 'critical', recommendation: 'Configure OAuth · or pause initiative until unblocked', confidencePct: 94 },
      { id: 'sig-4', workspaceId: 'ndxbook', signal: 'New opportunity · creator partnership aligns with growth strategy', severity: 'info', recommendation: 'Surface via Growth Network · filter by audience growth objective', confidencePct: 78 },
    ],
    cosPrioritization: [...COS_STRATEGY_QUESTIONS],
    simulations: [
      { id: 'sim-1', strategyId: 'str-ndx-growth', label: 'NEWSLETTER LAUNCH SIMULATION', bestCase: '25% reader retention lift · 8K signups in 90 days', expectedCase: '15% retention lift · 4K signups', worstCase: '5% lift · list fatigue if cadence wrong', budgetImpact: '$2.4K tools + creator costs', timeline: '90 days to meaningful signal', risks: ['List building pace', 'Content cadence mismatch'], resourceRequirements: ['Email system', 'CCO content allocation', 'Creative thumbnails'], successProbabilityPct: 72 },
    ],
    inheritanceOptions: [
      { id: 'inh-ndx', label: 'NDXBOOK MEDIA GROWTH STRATEGY', sourceWorkspaceId: 'ndxbook', description: 'Authority through consistency · daily pages · volume cadence · reader graph', includesInitiatives: true },
      { id: 'inh-fs', label: 'FRONTAL SLAYER LUXURY COMMERCE STRATEGY', sourceWorkspaceId: 'frontal-slayer', description: 'Community-first luxury · BAW · membership · concierge · LTV focus', includesInitiatives: true },
      { id: 'inh-vxd', label: 'VXD COMPANY-BUILDING STRATEGY', sourceWorkspaceId: 'vxd', description: 'Vision-led · presentation-first · leadership DNA aligned', includesInitiatives: false },
    ],
    board: {
      currentObjective: ndxbookProfile.companyObjective,
      northStarMetric: ndxbookProfile.northStarMetric,
      northStarProgress: `${ndxbookProfile.northStarCurrent} → ${ndxbookProfile.northStarTarget}`,
      activeStrategies: ndxbookStrategies.filter((s) => s.status === 'active').map((s) => s.title),
      activeInitiatives: ndxbookInitiatives.filter((i) => i.status === 'active').map((i) => i.name),
      keyRisks: ['Thumbnail queue bottleneck', 'Social OAuth blocking distribution', '14 pages/week capacity ceiling'],
      keyOpportunities: ['Newsletter launch · reader retention', 'Money Monday stat overlay scaling', 'Short-form bet validating'],
      strategicBets: bets.filter((b) => b.workspaceId === 'ndxbook').map((b) => b.hypothesis.slice(0, 60) + '…'),
      recommendedNextMoves: ['Unblock OAuth for cross-platform initiative', 'Launch newsletter simulation review', 'Route thumbnails through Labs #38 default'],
      recentDecisions: ['Prioritize Money Monday over ad-hoc campaigns', 'Pause non-volume page experiments'],
      strategyHealthPct: 82,
    },
    builderStep: 6,
    selectedStrategyId: 'str-ndx-content',
    selectedInitiativeId: 'init-daily-pages',
  };
}

export function bootstrapStrategyEnginePlatform(): void {
  bootstrapStrategyEngineStore(buildStrategyEngineSeed());
}
