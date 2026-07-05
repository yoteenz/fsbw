import { bootstrapLeadershipModesStore } from './store';
import type { LeadershipModesStore } from './types';

export function buildLeadershipModesSeed(): Partial<LeadershipModesStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    activeModeId: 'founder',
    recommendedModeId: 'founder',
    dashboard: {
      summary:
        'LEADERSHIP MODES V1.0 — NDXBOOK · founder mode active · executives handle routine work quietly · vision briefing ready.',
      activeModeLabel: 'FOUNDER MODE',
      recommendedModeLabel: 'FOUNDER MODE',
      detectionConfidencePct: 87,
      transitionsToday: 2,
      briefingReady: true,
      campusAmbiance: 'CREATIVE ENERGY · INNOVATION · CONCEPT WALLS',
    },
    leadershipModes: [
      {
        id: 'founder',
        label: 'FOUNDER MODE',
        tagline: 'Optimized for creation · minimize operational noise',
        priorities: [
          'Vision · innovation · brainstorming · strategy',
          'Product creation · brand building · company architecture',
          'Future planning · creative exploration · organizational design',
        ],
        active: true,
      },
      {
        id: 'executive',
        label: 'EXECUTIVE MODE',
        tagline: 'Optimized for leadership · organizational awareness',
        priorities: [
          'Executive briefings · organizational health · department performance',
          'Executive council · approvals · governance · financial health',
          'Growth · customer experience · technology · organizational intelligence',
        ],
        active: false,
      },
      {
        id: 'creator',
        label: 'CREATOR MODE',
        tagline: 'Founder as creator inside the organization',
        priorities: [
          'Content creation · publishing · campaigns · NDXBOOK',
          'Reader graph · creator marketplace · media production',
          'Distribution · creative workflows · creator performance',
        ],
        active: false,
      },
      {
        id: 'operator',
        label: 'OPERATOR MODE',
        tagline: 'Execution · momentum · day-to-day coordination',
        priorities: [
          'Workflow orchestration · delegations · implementation',
          'Cross-functional coordination · project health',
          'Operational bottlenecks · organizational momentum',
        ],
        active: false,
      },
    ],
    modeDetections: [
      { id: 'md-1', signal: 'Heavy product planning sprint this week', recommendedMode: 'founder', confidence: 91, overrideAllowed: true },
      { id: 'md-2', signal: 'Board meeting scheduled Thursday', recommendedMode: 'executive', confidence: 94, overrideAllowed: true },
      { id: 'md-3', signal: '100K GTM campaign creation phase', recommendedMode: 'creator', confidence: 88, overrideAllowed: true },
      { id: 'md-4', signal: 'Major operational week · 5 active workflows', recommendedMode: 'operator', confidence: 85, overrideAllowed: true },
      { id: 'md-5', signal: 'Onboarding simplification sprint active', recommendedMode: 'operator', confidence: 79, overrideAllowed: true },
    ],
    adaptiveInterface: [
      { id: 'ai-1', area: 'Navigation', currentMode: 'founder', adjustment: 'Vision · strategy · architecture prioritized · ops links minimized' },
      { id: 'ai-2', area: 'Dashboard', currentMode: 'founder', adjustment: 'Innovation widgets · concept walls · future planning front and center' },
      { id: 'ai-3', area: 'Executive briefings', currentMode: 'founder', adjustment: 'Vision briefing only · routine ops suppressed unless escalated' },
      { id: 'ai-4', area: 'Notifications', currentMode: 'founder', adjustment: 'Only strategic · creative · architectural signals surface' },
      { id: 'ai-5', area: 'Shortcuts', currentMode: 'founder', adjustment: 'Founder\'s Promise · Company Genome · Architect Studio · Strategy Engine' },
      { id: 'ai-6', area: 'Widgets', currentMode: 'founder', adjustment: 'Creative exploration · organizational design · brand vision' },
      { id: 'ai-7', area: 'Campus activity', currentMode: 'founder', adjustment: 'Creative energy · innovation spaces · concept walls active' },
      { id: 'ai-8', area: 'Recommendations', currentMode: 'founder', adjustment: 'Studio Intelligence surfaces possibilities not operational tasks' },
    ],
    chiefOfStaffBriefings: [
      {
        id: 'cos-1',
        mode: 'founder',
        briefingType: 'Vision briefing',
        summary: 'Editorial identity crystallizing · stat-forward GTM vision · organizational architecture maturing toward enterprise',
        anticipates: 'Founder thinking about creation · strategy · future · not operational noise',
      },
      {
        id: 'cos-2',
        mode: 'executive',
        briefingType: 'Leadership briefing',
        summary: 'Organizational health 74% · 3 pending approvals · council synthesis ready · trust gates enforced',
        anticipates: 'Founder thinking about decisions · governance · organizational health',
      },
      {
        id: 'cos-3',
        mode: 'creator',
        briefingType: 'Creative briefing',
        summary: 'NDXBOOK production queue · reader spotlight pilot +15% advocacy · Writing DNA gates active',
        anticipates: 'Founder thinking about content · publishing · campaigns · creative performance',
      },
      {
        id: 'cos-4',
        mode: 'operator',
        briefingType: 'Execution briefing',
        summary: '5 active workflows · onboarding sprint blockers · delegation health 82% · 2 bottlenecks flagged',
        anticipates: 'Founder thinking about execution · coordination · momentum · bottlenecks',
      },
    ],
    executiveBehaviors: [
      { id: 'eb-1', executive: 'Chief Brand Officer', mode: 'founder', communicationStyle: 'Present possibilities', example: 'Three editorial identity directions · each aligned with stat-forward promise' },
      { id: 'eb-2', executive: 'Chief Brand Officer', mode: 'executive', communicationStyle: 'Present decisions', example: 'Recommend approving spotlight program · brand risk low · council aligned' },
      { id: 'eb-3', executive: 'Chief Growth Officer', mode: 'creator', communicationStyle: 'Present inspiration', example: 'Reader advocacy stories · campaign angles · relationship-driven GTM concepts' },
      { id: 'eb-4', executive: 'Chief Growth Officer', mode: 'operator', communicationStyle: 'Present execution', example: 'GTM Phase 1 blocked at onboarding gate · Step 3 fix in sprint · timeline impact' },
      { id: 'eb-5', executive: 'Chief of Staff', mode: 'founder', communicationStyle: 'Present possibilities', example: 'Organizational architecture options · maturity path to enterprise' },
      { id: 'eb-6', executive: 'Chief of Staff', mode: 'executive', communicationStyle: 'Present decisions', example: '3 approvals pending · recommended routing · council synthesis ready' },
      { id: 'eb-7', executive: 'Chief Experience Officer', mode: 'operator', communicationStyle: 'Present execution', example: 'Onboarding Step 3 friction · A/B experiment results · simplification sprint status' },
      { id: 'eb-8', executive: 'Chief Technology Officer', mode: 'executive', communicationStyle: 'Present decisions', example: 'Auth refactor critical path · security trust infrastructure · founder decision needed' },
    ],
    oiModeIntegration: [
      { id: 'oi-1', evaluation: 'Product planning sprint dominates calendar this week', recommendation: 'founder', rationale: 'Heavy vision · strategy · architecture work detected' },
      { id: 'oi-2', evaluation: 'Board meeting Thursday · 3 pending governance approvals', recommendation: 'executive', rationale: 'Leadership context peaks mid-week · switch recommended Wednesday evening' },
      { id: 'oi-3', evaluation: 'Campaign creation phase for reader spotlight program', recommendation: 'creator', rationale: 'Creative workload elevated · publishing pipeline active' },
      { id: 'oi-4', evaluation: '5 active workflows · onboarding sprint · delegation load high', recommendation: 'operator', rationale: 'Operational momentum week · cross-functional coordination critical' },
      { id: 'oi-5', evaluation: 'Current maturity SCALE · governance active · trust gates enforced', recommendation: 'founder', rationale: 'Default to creation mode unless operational signals override' },
    ],
    campusTransformations: [
      { id: 'ct-1', mode: 'founder', ambiance: 'Creative energy · innovation · concept walls', spaces: 'Innovation loft · blueprint rooms · vision observatory', feeling: 'Possibility · future · architectural thinking' },
      { id: 'ct-2', mode: 'executive', ambiance: 'Executive council · organizational dashboards', spaces: 'Council chamber · strategy observatory · governance hall', feeling: 'Leadership · stewardship · organizational awareness' },
      { id: 'ct-3', mode: 'creator', ambiance: 'Media studios · production spaces · storytelling', spaces: 'NDXBOOK newsroom · creator pavilion · distribution center', feeling: 'Creation · publishing · audience connection' },
      { id: 'ct-4', mode: 'operator', ambiance: 'Workflow command center · execution coordination', spaces: 'Operations floor · delegation hub · workflow orchestration center', feeling: 'Momentum · coordination · day-to-day progress' },
    ],
    leadershipTransitions: [
      {
        id: 'lt-1',
        fromMode: 'founder',
        toMode: 'executive',
        preserved: ['Active initiatives', 'Executive discussions', 'Workspace state', 'Thought process threads'],
        instant: true,
      },
      {
        id: 'lt-2',
        fromMode: 'executive',
        toMode: 'creator',
        preserved: ['Campaign drafts', 'Council decisions', 'Approval context', 'Creative briefs'],
        instant: true,
      },
      {
        id: 'lt-3',
        fromMode: 'creator',
        toMode: 'operator',
        preserved: ['Publishing queue', 'Workflow assignments', 'Delegation ownership', 'Project health'],
        instant: true,
      },
      {
        id: 'lt-4',
        fromMode: 'operator',
        toMode: 'founder',
        preserved: ['Sprint outcomes', 'Bottleneck resolutions', 'Execution learnings', 'Strategic context'],
        instant: true,
      },
    ],
    recommendedNextSteps: [
      'Review vision briefing before product planning session',
      'Switch to executive mode Wednesday for board preparation',
      'Allow Studio Intelligence to recommend creator mode during campaign week',
      'Preserve workspace context when switching between modes',
    ],
    futureOpportunities: [
      'Studio OS asks "How do you want to lead today?" on every session start',
      'Calendar-integrated automatic mode transitions',
      'Ambient campus transformation tied to active leadership mode',
    ],
  };
}

export function bootstrapLeadershipModesPlatform(): void {
  bootstrapLeadershipModesStore(buildLeadershipModesSeed());
}
