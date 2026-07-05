import { CDO_EXECUTIVE_COMPASS } from './constants';
import { bootstrapChiefDigitalOfficerStore } from './store';
import type { ChiefDigitalOfficerStore } from './types';

export function buildChiefDigitalOfficerSeed(): Partial<ChiefDigitalOfficerStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'CHIEF DIGITAL OFFICER V1.0 — lifelong guardian of the digital ecosystem · technology invisible · experience remembered.',
      digitalHealthPct: 88,
      architectureScorePct: 91,
      pendingReviews: 6,
      protectionAlerts: 2,
      councilCollaborations: 5,
      platformHealthTrend: 'up',
    },
    executiveCompass: CDO_EXECUTIVE_COMPASS,
    digitalGovernance: [
      { id: 'dg-1', initiative: 'Editorial platform homepage refresh', category: 'Websites', status: 'approved', architectureScore: 92 },
      { id: 'dg-2', initiative: 'Onboarding flow simplification', category: 'Customer portals', status: 'pending', architectureScore: 78 },
      { id: 'dg-3', initiative: 'Admin Studio OS module expansion', category: 'Admin dashboards', status: 'approved', architectureScore: 89 },
      { id: 'dg-4', initiative: 'Reader Graph API integration', category: 'APIs', status: 'approved', architectureScore: 94 },
      { id: 'dg-5', initiative: 'Checkout payment flow optimization', category: 'Software products', status: 'revision', architectureScore: 81 },
      { id: 'dg-6', initiative: 'Studio Intelligence knowledge assistant', category: 'AI systems', status: 'pending', architectureScore: 86 },
    ],
    digitalAlignment: [
      {
        id: 'da-1',
        initiative: 'Editorial mode ecosystem',
        digitalHealthScore: 90,
        architectureScore: 92,
        technicalRisks: 'Low · modular React · Vite · proven stack',
        futureScalability: 'Strong · component library · design system maturing',
        recommendation: 'Approved · immersive editorial · not hype-driven',
        confidence: 91,
        customerImpact: 'Readers experience content · not software complexity',
      },
      {
        id: 'da-2',
        initiative: 'Onboarding architecture pivot',
        digitalHealthScore: 76,
        architectureScore: 78,
        technicalRisks: 'Medium · session state · auth flow coupling',
        futureScalability: 'Requires decoupling before 100K scale',
        recommendation: 'Simplify before GTM · reduce steps · invisible auth',
        confidence: 89,
        customerImpact: 'Technology disappears · trust-first first session',
      },
      {
        id: 'da-3',
        initiative: 'Work orchestration automation layer',
        digitalHealthScore: 85,
        architectureScore: 88,
        technicalRisks: 'Low · event-driven · Supabase backend',
        futureScalability: 'High · API-first · integration-ready',
        recommendation: 'Approve with monitoring · automation quality gates',
        confidence: 87,
        customerImpact: 'Faster internal ops · better reader response times',
      },
    ],
    digitalIntelligence: [
      { id: 'di-1', dimension: 'Platform health', score: 88, trend: 'up' },
      { id: 'di-2', dimension: 'Performance', score: 91, trend: 'stable' },
      { id: 'di-3', dimension: 'Reliability', score: 89, trend: 'up' },
      { id: 'di-4', dimension: 'Technical debt', score: 72, trend: 'down' },
      { id: 'di-5', dimension: 'Automation quality', score: 84, trend: 'up' },
      { id: 'di-6', dimension: 'Accessibility', score: 86, trend: 'stable' },
      { id: 'di-7', dimension: 'Security posture', score: 90, trend: 'stable' },
      { id: 'di-8', dimension: 'Developer productivity', score: 87, trend: 'up' },
    ],
    digitalEvolution: [
      { id: 'de-1', category: 'Platform improvement', recommendation: 'Design system v2 · component library consolidation' },
      { id: 'de-2', category: 'Workflow automation', recommendation: 'Content pipeline orchestration · reduce manual handoffs' },
      { id: 'de-3', category: 'Technical modernization', recommendation: 'Onboarding decoupling · session architecture refactor' },
      { id: 'de-4', category: 'Developer tooling', recommendation: 'Studio OS module scaffolding · faster executive platform builds' },
      { id: 'de-5', category: 'Future capability', recommendation: 'Predictive reader engagement via Reader Graph signals' },
    ],
    solutionArchitecture: [
      { id: 'sa-1', system: 'Editorial platform', focus: 'React SPA · Supabase · Vercel API routes', status: 'reviewed', scalability: '100K readers · CDN-ready' },
      { id: 'sa-2', system: 'Reader Graph', focus: 'Event ingestion · relationship lineage · API strategy', status: 'reviewed', scalability: 'Horizontal · batch + realtime' },
      { id: 'sa-3', system: 'Onboarding flow', focus: 'Auth coupling · session state · permissions', status: 'in-progress', scalability: 'Blocked until decoupled' },
      { id: 'sa-4', system: 'Studio OS modules', focus: 'localStorage bootstrap · lazy routes · KG wiring', status: 'reviewed', scalability: 'Modular · one deploy per milestone' },
    ],
    aiEcosystem: [
      { id: 'ai-1', capability: 'Knowledge assistants', businessObjective: 'Studio Intelligence · institutional memory retrieval', status: 'recommended' },
      { id: 'ai-2', capability: 'Workflow orchestration', businessObjective: 'Work Orchestration · reduce manual coordination', status: 'evaluating' },
      { id: 'ai-3', capability: 'Predictive systems', businessObjective: 'Reader Graph · engagement forecasting', status: 'future' },
      { id: 'ai-4', capability: 'AI agents', businessObjective: 'Executive council · soft approval automation', status: 'evaluating' },
    ],
    technologyCouncil: [
      { id: 'tc-1', executive: 'Chief Experience Officer', collaboration: 'Onboarding digital feasibility · checkout simplification', status: 'active' },
      { id: 'tc-2', executive: 'Chief Brand Officer', collaboration: 'Design system brand consistency · editorial platform standards', status: 'active' },
      { id: 'tc-3', executive: 'Chief Growth Officer', collaboration: 'GTM platform readiness · 100K scale architecture review', status: 'active' },
      { id: 'tc-4', executive: 'Chief of Staff', collaboration: 'Technology council before founder escalation', status: 'active' },
      { id: 'tc-5', executive: 'Chief Technology Officer', collaboration: 'Future CTO architecture handoff planning', status: 'scheduled' },
    ],
    digitalStudio: [
      { id: 'ds-1', element: 'Living system architecture', description: 'Interactive platform map · service dependencies · data flows', location: 'Digital Studio · Architect Studio south wing' },
      { id: 'ds-2', element: 'Component library', description: 'Futura PT design system · admin studio patterns · mobile-first', location: 'Design systems wall' },
      { id: 'ds-3', element: 'Platform health console', description: 'Performance · reliability · security · debt metrics live', location: 'Health monitoring station' },
      { id: 'ds-4', element: 'Automation maps', description: 'Work orchestration · content pipeline · integration flows', location: 'Automation lab' },
      { id: 'ds-5', element: 'API ecosystem', description: 'Reader Graph · Relationship Engine · Supabase · Vercel routes', location: 'Integration center' },
      { id: 'ds-6', element: 'Technical roadmap', description: 'Onboarding refactor · design system v2 · AI capabilities', location: 'Roadmap wall' },
    ],
    digitalMemory: [
      { id: 'dm-1', category: 'ARCHITECTURE', memory: 'Editorial mode chosen over hype-driven landing · immersive content first', date: '2026-03' },
      { id: 'dm-2', category: 'SUCCESS', memory: 'Reader Graph API · relationship lineage operational · 12K signals', date: '2026-05' },
      { id: 'dm-3', category: 'LESSON', memory: 'Onboarding auth coupling · caused drop-off · decouple before scale', date: '2026-06' },
      { id: 'dm-4', category: 'DESIGN SYSTEM', memory: 'Admin Studio module pattern · consistent executive platform builds', date: '2026-07' },
      { id: 'dm-5', category: 'FAILURE', memory: 'Over-engineered checkout · 5 steps · simplified to 3 pending', date: '2026-06' },
    ],
    digitalProtection: [
      { id: 'dp-1', alertType: 'Technical debt', severity: 'medium', description: 'Onboarding session state tightly coupled to auth flow', correction: 'Architecture refactor · decouple before GTM scale' },
      { id: 'dp-2', alertType: 'Performance degradation', severity: 'low', description: 'Admin Studio bootstrap chain growing · yield optimization needed', correction: 'Lazy seed pattern · already implemented · monitor' },
    ],
    dailyBriefing: [
      { id: 'db-1', category: 'PLATFORM HEALTH', summary: '88% digital health · 91% architecture · trending up', priority: 'high' },
      { id: 'db-2', category: 'TECHNICAL OPPORTUNITIES', summary: 'Design system v2 · onboarding refactor · automation expansion', priority: 'high' },
      { id: 'db-3', category: 'SECURITY', summary: 'Posture strong · RLS verified · no critical alerts', priority: 'medium' },
      { id: 'db-4', category: 'INTEGRATION STATUS', summary: 'Reader Graph · Relationship Engine · KG all operational', priority: 'medium' },
      { id: 'db-5', category: 'AUTOMATION', summary: 'Work orchestration pilot · content pipeline handoffs reducing', priority: 'medium' },
    ],
    recommendations: [
      { id: 'rec-1', summary: 'Prioritize onboarding architecture decoupling before GTM scale', confidence: 91, customerImpact: 'Technology disappears · friction removed · trust preserved', implementationComplexity: 'Medium · 2-sprint refactor · auth session separation', recommendedAction: 'Block 100K launch until architecture score > 85', hasTradeoffs: true },
      { id: 'rec-2', summary: 'Launch design system v2 component library consolidation', confidence: 88, customerImpact: 'Consistent experience · faster feature delivery · less drift', implementationComplexity: 'Low-medium · incremental migration · no big-bang', recommendedAction: 'Approve Q3 design system initiative', hasTradeoffs: false },
      { id: 'rec-3', summary: 'Deploy Studio Intelligence knowledge assistant for executives', confidence: 85, customerImpact: 'Indirect · faster decisions · better reader outcomes', implementationComplexity: 'Medium · AI integration · KG + Memory Bible feeds', recommendedAction: 'Pilot with Chief of Staff soft approval flow', hasTradeoffs: true },
    ],
    recommendedNextSteps: [
      'Complete onboarding architecture review with Experience Officer',
      'Design system v2 kickoff with Brand Architect alignment',
      'Technology council debate on AI agent soft approval scope',
      'Technical debt audit synced to Company Genome maturity',
    ],
    futureOpportunities: [
      'Unified digital health score synced to Company Genome',
      'Automatic architecture review on every major digital initiative',
      'Digital studio live prototypes in Architect Studio',
      'Executive compass audit on every technology approval',
    ],
  };
}

export function bootstrapChiefDigitalOfficerPlatform(): void {
  bootstrapChiefDigitalOfficerStore(buildChiefDigitalOfficerSeed());
}
