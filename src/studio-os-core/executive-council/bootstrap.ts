import { bootstrapExecutiveCouncilStore } from './store';
import type { ExecutiveCouncilStore } from './types';

export function buildExecutiveCouncilSeed(): Partial<ExecutiveCouncilStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'EXECUTIVE COUNCIL V2.0 — highest collaborative leadership body · organizational wisdom over isolated recommendations.',
      councilHealthPct: 91,
      activeSessions: 1,
      pendingDecisions: 3,
      healthyDisagreements: 4,
      simulationsScheduled: 2,
      organizationalWisdomPct: 88,
    },
    councilChamber: [
      { id: 'cc-1', element: 'Interactive strategy table', description: 'Central holographic projection surface · living organizational simulations', location: 'Executive Council Chamber · Architect Studio · east wing' },
      { id: 'cc-2', element: 'Organizational simulations', description: 'Financial projections · campaign models · customer journeys · market intelligence', location: 'Above strategy table' },
      { id: 'cc-3', element: 'Technology architecture', description: 'Platform topology · engineering health · migration pathways', location: 'North projection wall' },
      { id: 'cc-4', element: 'Organizational health', description: 'Genome signals · relationship health · brand integrity · growth trajectory', location: 'South projection wall' },
      { id: 'cc-5', element: 'Executive seating', description: 'Modern · minimal · premium · warm · purposeful · timeless boardroom', location: 'Surrounding strategy table' },
    ],
    councilResponsibilities: [
      { id: 'cr-1', topic: '100K readers relationship-driven GTM', category: 'Company strategy', status: 'in-session', elevatedAt: '2026-07-05' },
      { id: 'cr-2', topic: 'Membership tier pricing evolution', category: 'Pricing', status: 'pending', elevatedAt: '2026-07-04' },
      { id: 'cr-3', topic: 'Creator marketplace pilot expansion', category: 'Creator economy', status: 'pending', elevatedAt: '2026-07-03' },
      { id: 'cr-4', topic: 'Onboarding friction resolution before scale', category: 'Product launches', status: 'in-session', elevatedAt: '2026-07-05' },
      { id: 'cr-5', topic: 'International expansion research phase', category: 'International expansion', status: 'pending', elevatedAt: '2026-07-01' },
      { id: 'cr-6', topic: 'Paid acquisition channel test', category: 'Marketing', status: 'decided', elevatedAt: '2026-06-28' },
    ],
    executiveDebate: [
      { id: 'ed-1', executive: 'Chief Brand Officer', discipline: 'Identity', perspective: 'GTM creative must preserve stat-forward editorial identity · no generic media templates', evidence: 'Previous generic template rejected · trust maintained · brand memory', concerns: 'Hype-driven acquisition creative risks brand dilution', opportunities: 'Relationship-first messaging compounds brand equity', risks: 'Vanity metrics pressure on creative standards', alternative: 'Editorial hook A/B tests before scale', confidence: 92, stance: 'caution' },
      { id: 'ed-2', executive: 'Chief Experience Officer', discipline: 'Trust', perspective: 'Onboarding friction must resolve before GTM acceleration · trust before scale', evidence: 'Onboarding score 72 · CEO alignment · journey intelligence', concerns: '100K readers with broken first experience destroys lifetime trust', opportunities: 'Fix onboarding → advocacy pathway · retention compounding', risks: 'Scale amplifies experience failures exponentially', alternative: 'Pilot GTM with 5K cohort after onboarding > 85', confidence: 94, stance: 'caution' },
      { id: 'ed-3', executive: 'Chief Digital Officer', discipline: 'Product vision', perspective: 'Editorial mode ecosystem ready for relationship-driven scale · platform consistent', evidence: 'Digital health 88% · design system stable · editorial platform approved', concerns: 'Infrastructure load at 100K without observability gaps', opportunities: 'Unified editorial experience across touchpoints', risks: 'Technical debt in auth flow blocks seamless onboarding', alternative: 'Phased rollout with digital readiness gates', confidence: 87, stance: 'support' },
      { id: 'ed-4', executive: 'Chief Technology Officer', discipline: 'Engineering integrity', perspective: 'Supabase/Vercel stack scales to 100K with observability initiative complete', evidence: 'Engineering health 90% · stability 93% · platform architecture review', concerns: 'Onboarding auth debt must resolve before traffic spike', opportunities: 'Observability initiative enables confident scale', risks: 'Premature scale without monitoring creates incident cascade', alternative: 'Complete auth refactor · then GTM green light', confidence: 91, stance: 'caution' },
      { id: 'ed-5', executive: 'Chief Growth Officer', discipline: 'Sustainable growth', perspective: 'Approve GTM with relationship metrics over vanity · block paid acquisition', evidence: 'Organic 12K engaged readers · paid test blocked · relationship health 89%', concerns: 'Vanity acquisition targets conflict with sustainable growth compass', opportunities: 'Creator marketplace · community spotlight · membership tier', risks: 'Wrong audience acquisition · churn · brand erosion', alternative: 'Relationship-driven GTM only after onboarding prerequisite', confidence: 91, stance: 'caution' },
    ],
    healthyDisagreements: [
      { id: 'hd-1', executives: 'CGO vs CBO', topic: 'GTM timing', disagreement: 'CGO wants relationship metrics gate · CBO wants brand validation before any creative scale', outcome: 'Both aligned on quality-over-quantity · disagreement sharpened launch criteria' },
      { id: 'hd-2', executives: 'CEO vs CTO', topic: 'Scale readiness', disagreement: 'CEO prioritizes trust-first onboarding fix · CTO requires auth refactor before load test', outcome: 'Unified prerequisite list · neither compromises engineering or experience integrity' },
      { id: 'hd-3', executives: 'CDO vs CGO', topic: 'Platform vs growth pace', disagreement: 'CDO confirms platform ready · CGO blocks until relationship foundation stronger', outcome: 'Phased rollout agreed · digital readiness necessary but not sufficient' },
      { id: 'hd-4', executives: 'CBO vs CGO', topic: 'Paid acquisition', disagreement: 'CGO blocks paid test · CBO validates organic creative only path preserves identity', outcome: 'Council blocked paid acquisition · agreement when evidence supports agreement' },
    ],
    cosFacilitation: [
      { id: 'cf-1', responsibility: 'Prepare agenda', status: 'complete', detail: '100K GTM sequencing · onboarding prerequisite · executive perspectives compiled' },
      { id: 'cf-2', responsibility: 'Summarize viewpoints', status: 'active', detail: 'Five executives contributed · 3 caution · 1 support · 1 neutral stance' },
      { id: 'cf-3', responsibility: 'Surface disagreements', status: 'active', detail: 'Scale timing · paid vs organic · onboarding gate · surfaced respectfully' },
      { id: 'cf-4', responsibility: 'Clarify tradeoffs', status: 'active', detail: 'Speed vs trust · scale vs experience · revenue vs relationship quality' },
      { id: 'cf-5', responsibility: 'Recommend next steps', status: 'active', detail: 'Resolve onboarding · then phased GTM · founder decision pending' },
      { id: 'cf-6', responsibility: 'Track follow-up actions', status: 'active', detail: 'CEO onboarding initiative · CTO auth refactor · CGO relationship metrics dashboard' },
    ],
    decisionSynthesis: [
      {
        id: 'ds-1',
        topic: '100K readers relationship-driven GTM',
        executiveSummary: 'Council recommends phased GTM only after onboarding score exceeds 85 · relationship metrics over vanity numbers.',
        majorAgreements: [
          'Stat-forward editorial identity must be preserved',
          'Onboarding friction is blocking prerequisite for scale',
          'Paid acquisition blocked · organic relationship-first path',
          'Creator marketplace and community programs approved for parallel track',
        ],
        majorDisagreements: [
          'Exact GTM timing — CGO/CEO want gate · CDO sees platform ready now',
          'Cohort size for pilot — 5K vs 25K initial wave',
        ],
        tradeoffs: [
          'Delay GTM 4-6 weeks · preserve trust and brand integrity',
          'Smaller initial cohort · slower numbers · higher LTV and retention',
        ],
        organizationalRisks: [
          'Premature scale amplifies onboarding failures',
          'Vanity metric pressure from external stakeholders',
        ],
        organizationalOpportunities: [
          'Relationship-driven GTM becomes organizational case study',
          'Council decision model compounds institutional wisdom',
        ],
        alternativePaths: [
          'Full 100K launch now — rejected by 4 of 5 executives',
          '5K pilot after onboarding fix — recommended interim path',
          'Defer GTM until Q4 — conservative fallback',
        ],
        recommendedDecision: 'Approve 5K relationship-driven pilot after onboarding score > 85 · block paid acquisition · parallel creator marketplace pilot',
        confidence: 89,
        reasoning: 'Evidence converges on trust-before-scale · healthy disagreement improved criteria · not manufactured debate',
      },
    ],
    executiveTransparency: [
      { id: 'et-1', executive: 'Chief Growth Officer', reasoning: 'Relationship health 89% · organic compounding · paid test historically failed', evidence: 'Growth memory · failed paid launch · Reader Graph retention signals', historicalComparison: 'First 12K organic succeeded · paid test blocked June 2026', confidence: 91 },
      { id: 'et-2', executive: 'Chief Experience Officer', reasoning: 'Onboarding is first impression · broken journey destroys lifetime trust', evidence: 'Journey intelligence · onboarding score 72 · friction heat map', historicalComparison: 'Trust-first philosophy validated in M62 experience governance', confidence: 94 },
      { id: 'et-3', executive: 'Chief Brand Officer', reasoning: 'Generic media templates rejected · stat-forward identity non-negotiable', evidence: 'Brand memory · creative review studio precedent · CBO alignment checks', historicalComparison: 'December 2025 template rejection preserved brand voice', confidence: 92 },
    ],
    meetingModes: [
      { id: 'mm-1', mode: 'Daily briefing', description: 'Cross-functional signals · CoS moderated · founder optional', typicalParticipants: ['Chief of Staff', 'Relevant executives by signal'] },
      { id: 'mm-2', mode: 'Strategy meeting', description: 'Company direction · major investments · annual planning', typicalParticipants: ['All C-suite', 'Chief of Staff', 'Founder'] },
      { id: 'mm-3', mode: 'Growth review', description: 'GTM · campaigns · partnerships · sustainable growth validation', typicalParticipants: ['CGO', 'CBO', 'CEO', 'CDO', 'CoS'] },
      { id: 'mm-4', mode: 'Technology review', description: 'Architecture · migrations · platform readiness', typicalParticipants: ['CTO', 'CDO', 'CEO', 'CoS'] },
      { id: 'mm-5', mode: 'Creative review', description: 'Brand evolution · editorial identity · campaign creative', typicalParticipants: ['CBO', 'CEO', 'CGO', 'CoS'] },
      { id: 'mm-6', mode: 'Crisis response', description: 'Urgent organizational risks · accelerated synthesis', typicalParticipants: ['Relevant executives', 'CoS', 'Founder'] },
      { id: 'mm-7', mode: 'Future simulation', description: 'Simulate council deliberation before major decisions', typicalParticipants: ['Adapted by scenario · CoS facilitates'] },
    ],
    councilSimulations: [
      { id: 'cs-1', scenario: '100K GTM sequencing', status: 'in-progress', viewpoints: 5, bestCase: 'Relationship-driven acquisition · 85%+ retention · brand integrity preserved', worstCase: 'Vanity scale · onboarding failures · brand dilution · churn spike', confidence: 89 },
      { id: 'cs-2', scenario: 'Membership tier pricing evolution', status: 'scheduled', viewpoints: 4, bestCase: 'Editorial depth rewards · subscription without paywall anxiety', worstCase: 'Pricing misalignment · trust erosion · community backlash', confidence: 0 },
      { id: 'cs-3', scenario: 'International expansion research', status: 'scheduled', viewpoints: 3, bestCase: 'English-first editorial markets · relationship-first entry', worstCase: 'Premature expansion · operational overload · brand inconsistency', confidence: 0 },
    ],
    organizationalLearning: [
      { id: 'ol-1', destination: 'Knowledge Graph', contribution: 'Council decision on paid acquisition · precedent for growth governance', date: '2026-06-28' },
      { id: 'ol-2', destination: 'Company Genome', contribution: 'Trust-before-scale principle encoded in growth DNA', date: '2026-07-05' },
      { id: 'ol-3', destination: 'Leadership DNA', contribution: 'Healthy disagreement model · executive oath applied to GTM debate', date: '2026-07-05' },
      { id: 'ol-4', destination: 'Organizational Intelligence', contribution: 'Cross-functional conflict patterns · onboarding as scale gate', date: '2026-07-05' },
      { id: 'ol-5', destination: 'Institutional Memory', contribution: '100K GTM council session · synthesis and dissent preserved', date: '2026-07-05' },
    ],
    founderParticipation: [
      { id: 'fp-1', action: 'Observe', description: 'Watch executive debate · inspect individual reasoning · full transparency' },
      { id: 'fp-2', action: 'Participate', description: 'Join discussion · share founder perspective · challenge recommendations' },
      { id: 'fp-3', action: 'Request additional analysis', description: 'Pause for deeper simulation · evidence gathering · expert input' },
      { id: 'fp-4', action: 'Approve / Decline / Defer', description: 'Founder remains final decision maker · council strengthens thinking not replaces judgment' },
    ],
    councilIntelligence: [
      { id: 'ci-1', category: 'Cross-functional conflict', recommendation: 'Onboarding friction blocking GTM — elevate to council before scale crisis', priority: 'high' },
      { id: 'ci-2', category: 'Organizational risk', recommendation: 'Paid acquisition pressure from stakeholders — council precedent available', priority: 'medium' },
      { id: 'ci-3', category: 'Strategic initiative', recommendation: 'Creator marketplace pilot ready for council creative review session', priority: 'medium' },
      { id: 'ci-4', category: 'Blind spot', recommendation: 'International expansion research lacks CEO journey validation — schedule simulation', priority: 'low' },
      { id: 'ci-5', category: 'New opportunity', recommendation: 'Reader spotlight community program — unanimous executive support · fast-track', priority: 'high' },
    ],
    recommendedNextSteps: [
      'Complete 100K GTM council synthesis · founder decision on phased pilot',
      'Schedule membership pricing simulation before Q3 launch',
      'CoS track onboarding initiative follow-ups from council session',
      'Contribute council decision to Knowledge Graph and Company Genome',
    ],
    futureOpportunities: [
      'Live executive council chamber in Architect Studio with holographic projections',
      'Automatic council elevation for cross-functional conflicts',
      'Historical debate comparison for recurring organizational decisions',
      'Council intelligence proactive session scheduling before crises',
    ],
  };
}

export function bootstrapExecutiveCouncilPlatform(): void {
  bootstrapExecutiveCouncilStore(buildExecutiveCouncilSeed());
}
