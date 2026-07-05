import { CGO_EXECUTIVE_COMPASS } from './constants';
import { bootstrapChiefGrowthOfficerStore } from './store';
import type { ChiefGrowthOfficerStore } from './types';

export function buildChiefGrowthOfficerSeed(): Partial<ChiefGrowthOfficerStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'CHIEF GROWTH OFFICER V1.0 — lifelong guardian of sustainable growth · stronger not simply bigger.',
      growthHealthPct: 87,
      relationshipHealthPct: 89,
      pendingReviews: 5,
      protectionAlerts: 2,
      councilCollaborations: 5,
      growthTrajectory: 'up',
    },
    executiveCompass: CGO_EXECUTIVE_COMPASS,
    growthGovernance: [
      { id: 'gg-1', initiative: '100K readers relationship-driven GTM', category: 'Campaign launches', status: 'pending', growthScore: 84 },
      { id: 'gg-2', initiative: 'Creator marketplace pilot launch', category: 'Creator initiatives', status: 'approved', growthScore: 91 },
      { id: 'gg-3', initiative: 'Membership tier pricing review', category: 'Pricing', status: 'revision', growthScore: 78 },
      { id: 'gg-4', initiative: 'Reader spotlight community program', category: 'Community initiatives', status: 'approved', growthScore: 93 },
      { id: 'gg-5', initiative: 'Paid acquisition channel test', category: 'Advertising', status: 'blocked', growthScore: 62 },
      { id: 'gg-6', initiative: 'Newsletter distribution expansion', category: 'Distribution strategy', status: 'approved', growthScore: 88 },
    ],
    growthAlignment: [
      {
        id: 'ga-1',
        initiative: '100K readers GTM sequencing',
        growthHealth: 84,
        brandImpact: 'Strong · stat-forward identity preserved · no generic templates',
        relationshipImpact: 'High · trust-first acquisition · Reader Graph signals aligned',
        customerImpact: 'Positive · right readers · not vanity numbers',
        financialOpportunity: 'Medium-high · subscription path · creator revenue share',
        risk: 'Medium · onboarding friction must resolve before scale',
        recommendation: 'Approve with onboarding prerequisite · relationship metrics over vanity',
        confidence: 88,
      },
      {
        id: 'ga-2',
        initiative: 'Paid social acquisition test',
        growthHealth: 58,
        brandImpact: 'Risk · hype-driven creative conflicts with editorial identity',
        relationshipImpact: 'Negative potential · wrong audience · trust erosion',
        customerImpact: 'Low quality acquisition · high churn predicted',
        financialOpportunity: 'Short-term spike · long-term LTV negative',
        risk: 'High · vanity metrics · brand dilution',
        recommendation: 'Block until organic relationship foundation stronger',
        confidence: 92,
      },
      {
        id: 'ga-3',
        initiative: 'Creator marketplace pilot',
        growthHealth: 91,
        brandImpact: 'Strong · Writing DNA quality gates · brand-aligned creators',
        relationshipImpact: 'High · ecosystem expansion · mutual value',
        customerImpact: 'Expanded value · community depth · advocacy pathway',
        financialOpportunity: 'New revenue stream · creator revenue share model',
        risk: 'Low · quality gates via Brand Architect and CBO validation',
        recommendation: 'Approved · pilot with 10 curated creators',
        confidence: 90,
      },
    ],
    growthIntelligence: [
      { id: 'gi-1', dimension: 'Customer acquisition', score: 82, trend: 'up' },
      { id: 'gi-2', dimension: 'Customer retention', score: 86, trend: 'stable' },
      { id: 'gi-3', dimension: 'Customer lifetime value', score: 84, trend: 'up' },
      { id: 'gi-4', dimension: 'Community health', score: 88, trend: 'up' },
      { id: 'gi-5', dimension: 'Creator performance', score: 79, trend: 'up' },
      { id: 'gi-6', dimension: 'Campaign performance', score: 85, trend: 'stable' },
      { id: 'gi-7', dimension: 'Channel effectiveness', score: 81, trend: 'up' },
      { id: 'gi-8', dimension: 'Brand awareness', score: 76, trend: 'up' },
    ],
    growthEvolution: [
      { id: 'ge-1', category: 'Community initiative', recommendation: 'Reader spotlight gallery · belonging · advocacy pathway' },
      { id: 'ge-2', category: 'Creator partnership', recommendation: 'Expand marketplace to 25 creators after pilot quality validation' },
      { id: 'ge-3', category: 'Subscription opportunity', recommendation: 'Membership tier with editorial depth rewards · not paywall' },
      { id: 'ge-4', category: 'New market', recommendation: 'International expansion research · English-first editorial markets' },
      { id: 'ge-5', category: 'Ecosystem expansion', recommendation: 'Affiliate program for aligned stat-forward creators only' },
    ],
    growthCouncil: [
      { id: 'gc-1', executive: 'Chief Brand Officer', collaboration: 'GTM brand validation · stat-forward consistency before launch', status: 'active' },
      { id: 'gc-2', executive: 'Chief Experience Officer', collaboration: 'Touchpoint experience validation · onboarding prerequisite', status: 'active' },
      { id: 'gc-3', executive: 'Chief Digital Officer', collaboration: 'Platform readiness for GTM scale · editorial mode ecosystem', status: 'active' },
      { id: 'gc-4', executive: 'Chief of Staff', collaboration: 'Growth council before founder escalation · GTM forum alignment', status: 'active' },
      { id: 'gc-5', executive: 'Chief Technology Officer', collaboration: 'Infrastructure readiness for 100K scale', status: 'scheduled' },
    ],
    growthLaboratory: [
      { id: 'gl-1', element: 'Growth experiments', description: 'A/B editorial hooks · relationship-first acquisition tests', location: 'Growth Studio · Architect Studio west wing' },
      { id: 'gl-2', element: 'Market intelligence', description: 'Competitor movement · stat-forward media landscape · trend signals', location: 'Intelligence wall' },
      { id: 'gl-3', element: 'Campaign simulations', description: '100K GTM walk-through · channel mix · relationship impact modeling', location: 'Simulation lab' },
      { id: 'gl-4', element: 'Distribution maps', description: 'Newsletter · social · creator · organic pathways · Reader Graph integration', location: 'Distribution center' },
      { id: 'gl-5', element: 'Creator ecosystem', description: 'Marketplace pilot · quality gates · revenue share model', location: 'Creator network hub' },
      { id: 'gl-6', element: 'Partnership pipeline', description: 'Strategic alliances · affiliate candidates · joint venture opportunities', location: 'Partnership board' },
      { id: 'gl-7', element: 'Revenue opportunities', description: 'Subscription · creator share · affiliate · future product lines', location: 'Revenue forecast wall' },
    ],
    growthMemory: [
      { id: 'gm-1', category: 'SUCCESS', memory: 'First 12K engaged readers · organic relationship-driven · no paid hacks', date: '2026-06' },
      { id: 'gm-2', category: 'LESSON', memory: 'Generic media template rejected · brand voice preserved · trust maintained', date: '2025-12' },
      { id: 'gm-3', category: 'FAILED LAUNCH', memory: 'Paid acquisition test blocked · vanity metrics · wrong audience profile', date: '2026-04' },
      { id: 'gm-4', category: 'PRICING', memory: 'Membership tier designed around editorial depth · not paywall anxiety', date: '2026-05' },
      { id: 'gm-5', category: 'CREATOR', memory: 'Marketplace pilot approved · Writing DNA quality gates · 10 creators', date: '2026-07' },
    ],
    growthProtection: [
      { id: 'gp-1', alertType: 'Unsustainable growth', severity: 'high', description: 'Paid acquisition channel test risks vanity metrics and brand dilution', correction: 'Block paid test · strengthen organic relationship foundation first' },
      { id: 'gp-2', alertType: 'Operational capacity', severity: 'medium', description: '100K GTM blocked by onboarding friction · CEO alignment required', correction: 'Resolve onboarding before GTM acceleration · trust before scale' },
    ],
    dailyBriefing: [
      { id: 'db-1', category: 'GROWTH HEALTH', summary: '87% growth health · 89% relationship · trajectory up', priority: 'high' },
      { id: 'db-2', category: 'CUSTOMER GROWTH', summary: '12K engaged readers · organic compounding · retention stable', priority: 'high' },
      { id: 'db-3', category: 'MARKET OPPORTUNITIES', summary: 'Creator marketplace · membership tier · community spotlight', priority: 'medium' },
      { id: 'db-4', category: 'CAMPAIGN PERFORMANCE', summary: 'Newsletter distribution strong · paid test blocked · GTM pending onboarding', priority: 'high' },
      { id: 'db-5', category: 'CREATOR ECOSYSTEM', summary: 'Pilot launching · 10 curated creators · quality gates active', priority: 'medium' },
    ],
    recommendations: [
      { id: 'rec-1', summary: 'Launch 100K readers GTM only after onboarding friction resolved', confidence: 91, customerImpact: 'Right readers acquired · trust preserved · long-term LTV positive', brandImpact: 'Stat-forward identity maintained · no hype-driven creative', financialImplications: 'Sustainable revenue path · subscription conversion optimized', recommendedAction: 'Coordinate with CEO and CDO · block GTM until onboarding score > 85', hasTradeoffs: true },
      { id: 'rec-2', summary: 'Proceed with creator marketplace pilot — 10 curated creators', confidence: 90, customerImpact: 'Expanded value · community depth · advocacy pathway', brandImpact: 'Writing DNA gates · brand-aligned ecosystem only', financialImplications: 'New revenue stream · creator revenue share model', recommendedAction: 'Approve pilot Q3 · CBO brand validation complete', hasTradeoffs: false },
      { id: 'rec-3', summary: 'Launch reader spotlight community program for advocacy', confidence: 88, customerImpact: 'Belonging · emotional connection · organic advocacy', brandImpact: 'Reinforces stat-forward community identity', financialImplications: 'Indirect · retention and referral lift · low cost', recommendedAction: 'Approve community initiative · coordinate with CEO', hasTradeoffs: false },
    ],
    recommendedNextSteps: [
      'Growth council review of 100K GTM sequencing with CBO and CEO',
      'Creator marketplace pilot kickoff with Brand Architect quality gates',
      'Block paid acquisition until organic relationship metrics strengthen',
      'Reader Graph signals → proactive retention campaigns',
    ],
    futureOpportunities: [
      'Unified growth health score synced to Company Genome',
      'Automatic growth review on every major initiative launch',
      'Growth laboratory live simulations in Architect Studio',
      'Executive compass audit on every pricing and partnership decision',
    ],
  };
}

export function bootstrapChiefGrowthOfficerPlatform(): void {
  bootstrapChiefGrowthOfficerStore(buildChiefGrowthOfficerSeed());
}
