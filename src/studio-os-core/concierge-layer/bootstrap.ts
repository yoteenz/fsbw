import { bootstrapConciergeLayerStore } from './store';
import type { ConciergeLayerStore } from './types';
import { CONCIERGE_PHILOSOPHY, CONCIERGE_TERMINOLOGY_MAP } from './constants';
import { CONCIERGE_ROSTER } from './mapping';

export function buildConciergeLayerSeed(): Partial<ConciergeLayerStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'CONCIERGE LAYER V1.0 — NDXBOOK · 8 concierge identities · you don\'t navigate Studio OS · Studio OS guides you.',
      conciergeTeamSize: 8,
      activeGuidanceSessions: 24,
      founderSatisfactionPct: 96,
      recommendationsToday: 12,
      organizationalConfidencePct: 93,
    },
    conciergePhilosophy: [...CONCIERGE_PHILOSOPHY],
    conciergeIdentities: [...CONCIERGE_ROSTER],
    conciergeBehavior: [
      { id: 'cb-1', principle: 'Guide', description: 'Lead founders through complexity with calm confidence — never overwhelm' },
      { id: 'cb-2', principle: 'Recommend', description: 'Surface opportunities with evidence · executive reasoning translated personally' },
      { id: 'cb-3', principle: 'Educate', description: 'Deepen organizational understanding · learning feels like mentorship not training' },
      { id: 'cb-4', principle: 'Coordinate', description: 'Connect concierge team · executives · architects · council behind seamless experience' },
      { id: 'cb-5', principle: 'Translate complexity', description: 'Governance · maturity · technical trade-offs explained in founder language' },
      { id: 'cb-6', principle: 'Prepare founders', description: 'Council prep · milestone celebrations · decision packets ready before asked' },
      { id: 'cb-7', principle: 'Surface opportunities', description: 'Proactive guidance · anticipated needs · hospitality-driven intelligence' },
      { id: 'cb-8', principle: 'Explain executive reasoning', description: 'Every recommendation includes why · historical comparisons · supporting evidence' },
    ],
    chiefConciergeExperience: [
      { id: 'cc-1', experience: 'Arrival Experience', chiefConciergeRole: 'Personal welcome · headquarters reveal · concierge team introduction', timing: 'begin' },
      { id: 'cc-2', experience: 'Founder Walk', chiefConciergeRole: 'Guided path · reflection spaces · legacy storytelling companion', timing: 'both' },
      { id: 'cc-3', experience: 'Morning Briefing', chiefConciergeRole: 'Daily priorities · unified organizational summary · attention protection', timing: 'begin' },
      { id: 'cc-4', experience: 'Executive Council preparation', chiefConciergeRole: 'Synthesis packet · dissent summary · founder judgment items highlighted', timing: 'begin' },
      { id: 'cc-5', experience: 'Organizational updates', chiefConciergeRole: 'Maturity · confidence · apprenticeship progress in founder language', timing: 'both' },
      { id: 'cc-6', experience: 'Executive introductions', chiefConciergeRole: 'Meet Your Concierge Team · workspace tours · warm personal guidance', timing: 'begin' },
      { id: 'cc-7', experience: 'Daily priorities', chiefConciergeRole: 'What matters today · what can wait · what requires founder judgment', timing: 'begin' },
      { id: 'cc-8', experience: 'Weekly reflections', chiefConciergeRole: 'Stewardship review · organizational learning · wisdom captured', timing: 'conclude' },
      { id: 'cc-9', experience: 'Milestone celebrations', chiefConciergeRole: 'Quiet confidence · meaningful recognition · legacy preserved', timing: 'conclude' },
    ],
    relationshipExamples: [
      {
        id: 're-1',
        founderQuestion: 'Should we approve this campaign headline batch?',
        concierge: 'Brand Concierge',
        behindTheScenes: 'Consults Chief Brand Officer · Writing DNA analysis · 847 review pattern match',
        founderExperience: 'Seamless conversation · recommendation with editorial evidence · reasoning explained warmly',
      },
      {
        id: 're-2',
        founderQuestion: 'Why is onboarding still blocking GTM?',
        concierge: 'Experience Concierge + Launch Concierge',
        behindTheScenes: 'CEO trust gate assessment · CGO maturity check · Strategy Engine alignment',
        founderExperience: 'Personal explanation of Step 3 friction · trust-before-scale philosophy · next milestone clear',
      },
      {
        id: 're-3',
        founderQuestion: 'What should I prioritize this week?',
        concierge: 'Chief Concierge',
        behindTheScenes: 'CoS inbox synthesis · council prep · OI signals · apprenticeship graduation review',
        founderExperience: 'Three priorities · estimated review time · attention protected · council packet ready',
      },
      {
        id: 're-4',
        founderQuestion: 'Why did we defer the auth refactor last quarter?',
        concierge: 'Knowledge Concierge',
        behindTheScenes: 'OI decision journal · KG trace · CTO technical assessment history',
        founderExperience: 'Institutional memory retrieved · reasoning preserved · lesson connected to current priority',
      },
    ],
    terminologyMap: [...CONCIERGE_TERMINOLOGY_MAP],
    futureOpportunities: [
      'Automatic Concierge creation as new executive disciplines are introduced',
      'Voice-guided Chief Concierge for mobile-first founder experience',
      'Concierge-mentored learning paths integrated with Studio Institute and Organizational Apprenticeship',
    ],
  };
}

export function bootstrapConciergeLayerPlatform(): void {
  bootstrapConciergeLayerStore(buildConciergeLayerSeed());
}
