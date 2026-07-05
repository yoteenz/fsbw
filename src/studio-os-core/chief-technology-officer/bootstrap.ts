import { CTO_EXECUTIVE_COMPASS } from './constants';
import { bootstrapChiefTechnologyOfficerStore } from './store';
import type { ChiefTechnologyOfficerStore } from './types';

export function buildChiefTechnologyOfficerSeed(): Partial<ChiefTechnologyOfficerStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'CHIEF TECHNOLOGY OFFICER V1.0 — lifelong guardian of engineering · infrastructure · resilience · built to last.',
      engineeringHealthPct: 90,
      platformStabilityPct: 93,
      pendingReviews: 5,
      protectionAlerts: 2,
      councilCollaborations: 4,
      reliabilityTrend: 'up',
    },
    executiveCompass: CTO_EXECUTIVE_COMPASS,
    technologyGovernance: [
      { id: 'tg-1', initiative: 'Supabase RLS policy audit', category: 'Security', status: 'approved', architectureScore: 94 },
      { id: 'tg-2', initiative: 'Onboarding auth decoupling refactor', category: 'Backend services', status: 'pending', architectureScore: 76 },
      { id: 'tg-3', initiative: 'Vercel API route consolidation', category: 'APIs', status: 'approved', architectureScore: 88 },
      { id: 'tg-4', initiative: 'Reader Graph event ingestion pipeline', category: 'Data architecture', status: 'approved', architectureScore: 91 },
      { id: 'tg-5', initiative: 'Studio OS bootstrap lazy-load optimization', category: 'Deployment strategy', status: 'revision', architectureScore: 85 },
      { id: 'tg-6', initiative: 'Studio Intelligence ML infrastructure pilot', category: 'ML infrastructure', status: 'pending', architectureScore: 82 },
    ],
    engineeringAlignment: [
      {
        id: 'ea-1',
        initiative: 'Editorial platform stack (React · Vite · Supabase · Vercel)',
        engineeringHealth: 92,
        technicalRisk: 'Low · proven stack · team expertise aligned',
        systemResilience: 'Strong · stateless frontend · managed backend',
        futureReadiness: 'High · modular · decade-scale architecture',
        recommendation: 'Approved · maintain · incremental evolution only',
        confidence: 93,
        organizationalImpact: 'Foundation for 100K readers · zero replatform risk',
      },
      {
        id: 'ea-2',
        initiative: 'Onboarding session architecture refactor',
        engineeringHealth: 74,
        technicalRisk: 'Medium · auth coupling · state management debt',
        systemResilience: 'At risk under scale · single point of friction',
        futureReadiness: 'Blocked until decoupled · 10-year test fails today',
        recommendation: 'Priority refactor · separate auth from onboarding state',
        confidence: 91,
        organizationalImpact: 'Unblocks GTM scale · protects long-term foundation',
      },
      {
        id: 'ea-3',
        initiative: 'Work orchestration event architecture',
        engineeringHealth: 87,
        technicalRisk: 'Low · event-driven · Supabase realtime capable',
        systemResilience: 'Strong · async · retry-friendly patterns',
        futureReadiness: 'High · extensible to distributed workflows',
        recommendation: 'Approve with observability gates · monitoring first',
        confidence: 88,
        organizationalImpact: 'Engineering velocity · operational excellence compound',
      },
    ],
    engineeringIntelligence: [
      { id: 'ei-1', dimension: 'Availability', score: 99, trend: 'stable' },
      { id: 'ei-2', dimension: 'Latency', score: 91, trend: 'up' },
      { id: 'ei-3', dimension: 'Technical debt', score: 74, trend: 'down' },
      { id: 'ei-4', dimension: 'Engineering velocity', score: 88, trend: 'up' },
      { id: 'ei-5', dimension: 'Code quality', score: 86, trend: 'stable' },
      { id: 'ei-6', dimension: 'Deployment frequency', score: 85, trend: 'up' },
      { id: 'ei-7', dimension: 'Security posture', score: 92, trend: 'stable' },
      { id: 'ei-8', dimension: 'Developer productivity', score: 87, trend: 'up' },
    ],
    engineeringEvolution: [
      { id: 'ee-1', category: 'Platform modernization', recommendation: 'Observability layer · structured logging · incident intelligence' },
      { id: 'ee-2', category: 'Developer tooling', recommendation: 'Studio OS module scaffolding · faster executive platform builds' },
      { id: 'ee-3', category: 'Automation', recommendation: 'CI pipeline gates · RLS verification · deployment smoke tests' },
      { id: 'ee-4', category: 'Security improvements', recommendation: 'Quarterly RLS audit · service role key rotation policy' },
      { id: 'ee-5', category: 'Testing improvements', recommendation: 'Critical path E2E · auth · checkout · onboarding flows' },
    ],
    platformArchitecture: [
      { id: 'pa-1', domain: 'Backend architecture', focus: 'Supabase Postgres · RLS · Vercel serverless API', status: 'governed', longevity: 'Decade-scale · managed services reduce ops burden' },
      { id: 'pa-2', domain: 'Database strategy', focus: 'Relational core · app_config KV · analytics events · reader graph tables', status: 'governed', longevity: 'Schema migrations · backward compatible evolution' },
      { id: 'pa-3', domain: 'Cloud architecture', focus: 'Vercel edge · Supabase region · CDN static assets', status: 'governed', longevity: 'Multi-region ready · no vendor lock-in on frontend' },
      { id: 'pa-4', domain: 'AI infrastructure', focus: 'Studio Intelligence · KG feeds · optional ML pipeline', status: 'review', longevity: 'Pluggable · business-objective gated' },
      { id: 'pa-5', domain: 'Developer platform', focus: 'npm ci · agent-commit.sh · one deploy per task · motherboard protocol', status: 'governed', longevity: 'Institutional engineering standards' },
    ],
    engineeringCouncil: [
      { id: 'ec-1', executive: 'Chief Digital Officer', collaboration: 'Digital vs engineering boundary · onboarding refactor ownership', status: 'active' },
      { id: 'ec-2', executive: 'Chief Experience Officer', collaboration: 'Platform reliability for customer journeys · checkout performance', status: 'active' },
      { id: 'ec-3', executive: 'Chief Operating Officer', collaboration: 'Operational complexity · deployment cadence · incident response', status: 'scheduled' },
      { id: 'ec-4', executive: 'Chief of Staff', collaboration: 'Engineering council before founder escalation', status: 'active' },
    ],
    technologyOpsCenter: [
      { id: 'toc-1', element: 'Live infrastructure', description: 'Supabase · Vercel · CDN · realtime status feeds', location: 'Technology Operations Center · Architect Studio mission control' },
      { id: 'toc-2', element: 'System topology', description: 'Frontend SPA · API routes · database · storage · auth flow map', location: 'Topology wall' },
      { id: 'toc-3', element: 'Deployment pipelines', description: 'agent-commit.sh · Vercel production · one deploy per milestone', location: 'Pipeline console' },
      { id: 'toc-4', element: 'Platform health', description: 'Uptime · latency · error rates · deployment success', location: 'Health dashboard' },
      { id: 'toc-5', element: 'Incident intelligence', description: 'History · root cause · lessons · prevention patterns', location: 'Incident archive' },
      { id: 'toc-6', element: 'Technical debt register', description: 'Onboarding coupling · bootstrap chain · debt prioritization', location: 'Debt tracker' },
      { id: 'toc-7', element: 'Engineering roadmap', description: 'Observability · auth refactor · ML pilot · testing gates', location: 'Roadmap wall' },
    ],
    engineeringMemory: [
      { id: 'em-1', category: 'ARCHITECTURE', memory: 'Supabase + Vercel chosen for decade-scale · managed · team velocity', date: '2025-11' },
      { id: 'em-2', category: 'LESSON', memory: 'One deploy per task · prevents Vercel churn · institutional standard', date: '2026-06' },
      { id: 'em-3', category: 'INCIDENT', memory: 'Onboarding auth coupling caused drop-off · architecture debt identified', date: '2026-06' },
      { id: 'em-4', category: 'BREAKTHROUGH', memory: 'Reader Graph pipeline operational · 12K relationship signals ingested', date: '2026-05' },
      { id: 'em-5', category: 'PLATFORM', memory: 'Studio OS lazy bootstrap · yieldToMain · admin UI paints first', date: '2026-07' },
    ],
    technologyProtection: [
      { id: 'tp-1', alertType: 'Technical debt', severity: 'medium', description: 'Onboarding auth-session coupling · fails 10-year architecture test', correction: 'Priority refactor · CDO alignment · block GTM until resolved' },
      { id: 'tp-2', alertType: 'Operational risk', severity: 'low', description: 'Growing bootstrap chain · monitor cold-start on admin routes', correction: 'Continue lazy-load pattern · benchmark quarterly' },
    ],
    dailyBriefing: [
      { id: 'db-1', category: 'ENGINEERING HEALTH', summary: '90% health · 93% stability · reliability trending up', priority: 'high' },
      { id: 'db-2', category: 'PLATFORM STABILITY', summary: '99% availability · latency improving · zero critical incidents', priority: 'high' },
      { id: 'db-3', category: 'DEPLOYMENT ACTIVITY', summary: 'One deploy per milestone · clean git history · Vercel healthy', priority: 'medium' },
      { id: 'db-4', category: 'SECURITY', summary: 'RLS verified · no critical vulnerabilities · audit scheduled', priority: 'medium' },
      { id: 'db-5', category: 'TECHNICAL OPPORTUNITIES', summary: 'Observability layer · auth refactor · CI test gates', priority: 'high' },
    ],
    recommendations: [
      { id: 'rec-1', summary: 'Prioritize onboarding auth decoupling — fails 10-year architecture test', confidence: 93, organizationalImpact: 'Unblocks scale · protects engineering foundation for decades', implementationComplexity: 'Medium · 2-sprint refactor · auth boundary separation', risk: 'Low if done before GTM · high if deferred under load', recommendedAction: 'Engineering council approval · coordinate with CDO and CEO', hasTradeoffs: true },
      { id: 'rec-2', summary: 'Implement observability layer — structured logging and incident intelligence', confidence: 87, organizationalImpact: 'Faster incident response · engineering wisdom compounds', implementationComplexity: 'Low-medium · incremental · no architecture change', risk: 'Low · additive only · no breaking changes', recommendedAction: 'Approve Q3 observability initiative', hasTradeoffs: false },
      { id: 'rec-3', summary: 'Add CI gates for RLS verification and critical path smoke tests', confidence: 85, organizationalImpact: 'Prevents security regressions · deployment confidence', implementationComplexity: 'Low · GitHub Actions or Vercel checks', risk: 'Low · may slow deploys slightly until tuned', recommendedAction: 'Pilot on auth and checkout routes first', hasTradeoffs: false },
    ],
    recommendedNextSteps: [
      'Engineering council review of onboarding refactor with CDO',
      'Observability layer design doc · incident intelligence feed',
      'Quarterly RLS audit schedule · document in Operational DNA',
      'Technical debt register sync to Company Genome maturity',
    ],
    futureOpportunities: [
      'Unified engineering health score synced to Company Genome',
      'Automatic architecture review on every engineering initiative',
      'Technology ops center live dashboards in Architect Studio',
      'Executive compass audit on every infrastructure investment',
    ],
  };
}

export function bootstrapChiefTechnologyOfficerPlatform(): void {
  bootstrapChiefTechnologyOfficerStore(buildChiefTechnologyOfficerSeed());
}
