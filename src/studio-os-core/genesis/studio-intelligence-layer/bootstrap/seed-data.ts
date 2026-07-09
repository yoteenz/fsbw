import { XSIL_SUBSYSTEM_VERSION } from '../constants';
import type {
  XsilAudienceDnaRecord,
  XsilCanonCandidate,
  XsilCompanyRecord,
  XsilCreativeNode,
  XsilDecisionDnaRecord,
  XsilOperatingManualRecord,
  XsilProductDnaRecord,
  XsilTasteGenomeRecord,
} from '../types';

const now = '2026-07-09T00:00:00.000Z';

export const SEED_COMPANY_REGISTRY: XsilCompanyRecord[] = [
  {
    companyId: 'studio-os',
    companyName: 'Studio OS™',
    operatingPhilosophy: 'Build permanent operating civilizations for visionaries.',
    mission: 'Give every visionary a permanent operating civilization.',
    version: '1.0.0',
    status: 'canonical',
    updatedAt: now,
  },
  {
    companyId: 'frontal-slayer',
    companyName: 'Frontal Slayer™',
    operatingPhilosophy: 'Luxury hair concierge meets digital mansion.',
    mission: 'Make every client feel personally known, glamorous, and cared for.',
    version: '1.0.0',
    status: 'canonical',
    updatedAt: now,
  },
  {
    companyId: 'ndx',
    companyName: 'NDX™',
    operatingPhilosophy: 'Independent media intelligence and cultural signal command.',
    mission: 'Detect signal, publish with clarity, command cultural relevance.',
    version: '1.0.0',
    status: 'canonical',
    updatedAt: now,
  },
];

function manual(companyId: string, philosophy: string): XsilOperatingManualRecord {
  return {
    manualId: `manual-${companyId}`,
    companyId,
    version: '1.0.0',
    operatingPhilosophy: philosophy,
    executivePrinciples: [
      'Founder approval for canon',
      'Evidence before urgency',
      'One primary action per viewport',
    ],
    departmentPlaybooks: [
      { departmentId: 'executive', purpose: 'Strategic direction', cadence: 'Daily briefing' },
      { departmentId: 'creative', purpose: 'Brand-safe generation', cadence: 'Campaign cycles' },
    ],
    sops: [
      { sopId: `sop-launch-${companyId}`, title: 'Launch readiness checklist', owner: 'Founder' },
      { sopId: `sop-creative-${companyId}`, title: 'Creative approval workflow', owner: 'Creative lead' },
    ],
    approvalWorkflows: [
      { workflowId: `wf-canon-${companyId}`, domain: 'Canonization', requiresFounder: true },
      { workflowId: `wf-campaign-${companyId}`, domain: 'Marketing', requiresFounder: false },
    ],
    qualityStandards: ['Accessibility is brand integrity', 'No generic SaaS copy', 'Luxury floor enforced'],
    automationRules: [
      { ruleId: `auto-recommend-${companyId}`, action: 'Orb recommendations', mode: 'recommend' },
      { ruleId: `auto-canon-${companyId}`, action: 'Canonization', mode: 'approve' },
    ],
    decisionOwnership: [
      { domain: 'Brand Canon', owner: 'Founder' },
      { domain: 'Campaign launch', owner: 'Marketing lead' },
    ],
    escalationPaths: [
      { riskClass: 'Brand contradiction', path: 'Orb → Founder review' },
      { riskClass: 'Quality below floor', path: 'Block → Revise → Re-score' },
    ],
    canonStatus: 'canonical',
    updatedAt: now,
  };
}

export const SEED_OPERATING_MANUAL_REGISTRY: XsilOperatingManualRecord[] = SEED_COMPANY_REGISTRY.map((c) =>
  manual(c.companyId, c.operatingPhilosophy)
);

function decisionDna(companyId: string, principles: string[], anti: string[]): XsilDecisionDnaRecord {
  return {
    decisionDnaId: `decision-${companyId}`,
    companyId,
    founderId: 'founder-primary',
    version: '1.0.0',
    riskTolerance: { label: 'Measured risk', value: 65 },
    speedQualityBias: { label: 'Quality with evidence', value: 72 },
    luxuryAffordabilityBias: { label: 'Premium floor', value: companyId === 'frontal-slayer' ? 88 : 70 },
    innovationConventionBias: { label: 'Innovate within canon', value: 68 },
    leadershipStyle: ['decisive', 'protective', 'legacy-minded'],
    platformPhilosophy: 'Systemize expertise; never lose institutional memory.',
    learnedPrinciples: principles,
    antiPatterns: anti,
    decisionHistory: [
      {
        decisionId: `dec-hist-${companyId}-1`,
        summary: 'Prioritize institutional permanence over hype launches',
        rationale: 'Aligns with operating philosophy',
        confidence: 92,
        outcome: 'Strong founder alignment',
        createdAt: now,
      },
    ],
    updatedAt: now,
  };
}

export const SEED_DECISION_REGISTRY: XsilDecisionDnaRecord[] = [
  decisionDna('studio-os', ['Permanence over hype', 'One deploy per task'], ['Move fast and break things', 'Discount language']),
  decisionDna('frontal-slayer', ['Concierge warmth always', 'Breathing room is luxury'], ['Generic SaaS UI', 'Discount bin language']),
  decisionDna('ndx', ['Signal before urgency', 'Evidence before publish'], ['Clickbait framing', 'Salon luxury language']),
];

function taste(companyId: string, luxury: number, approved: string[], rejected: string[]): XsilTasteGenomeRecord {
  return {
    tasteGenomeId: `taste-${companyId}`,
    companyId,
    version: '1.0.0',
    typography: ['Futura labels', 'Grace display accents'],
    layout: ['Executive restraint', 'One focal object'],
    photography: companyId === 'ndx' ? ['Broadcast panels', 'Screen reflections'] : ['Marble daylight', 'Architectural calm'],
    luxuryLevel: luxury,
    motion: ['Subtle transitions', 'Reduced-motion branch'],
    copywriting: companyId === 'frontal-slayer' ? ['Concierge warmth'] : ['Executive clarity'],
    approvedPatterns: approved.map((label, i) => ({ patternId: `ap-${companyId}-${i}`, label, confidence: 85 - i * 3 })),
    rejectedPatterns: rejected.map((label, i) => ({ patternId: `rp-${companyId}-${i}`, label, rationale: 'Founder rejected' })),
    updatedAt: now,
  };
}

export const SEED_TASTE_REGISTRY: XsilTasteGenomeRecord[] = [
  taste('studio-os', 78, ['Crystalline HQ', 'Institutional calm'], ['SaaS dashboard clone', 'Startup hype']),
  taste('frontal-slayer', 88, ['Mirror-light hero', 'Editorial beauty'], ['Crowded layouts', 'Clinical coldness']),
  taste('ndx', 72, ['Dark glass command floor', 'Headline hierarchy'], ['Marble institution cues', 'Salon language']),
];

function audience(companyId: string, segment: string, psych: string, transform: string): XsilAudienceDnaRecord {
  return {
    audienceDnaId: `audience-${companyId}`,
    companyId,
    version: '1.0.0',
    segmentName: segment,
    demographics: 'Primary segment from Company Genome',
    psychographics: psych,
    emotionalTriggers: ['belonging', 'confidence', 'control'],
    buyingMotivations: ['trust', 'transformation', 'status'],
    luxuryExpectations: companyId === 'frontal-slayer' ? 'Concierge, editorial, personally known' : 'Executive restraint',
    painPoints: ['Fragmented tools', 'Generic experiences', 'Lost expertise'],
    desiredTransformation: transform,
    updatedAt: now,
  };
}

export const SEED_AUDIENCE_REGISTRY: XsilAudienceDnaRecord[] = [
  audience('studio-os', 'Visionary founders', 'Wants calm control and legacy', 'Build something that lasts'),
  audience('frontal-slayer', 'Luxury hair clients', 'Wants to feel seen and glamorous', 'Feel cared for and elevated'),
  audience('ndx', 'Media strategists', 'Wants to be first and analytically sharp', 'Command information flow'),
];

function product(companyId: string, name: string, promise: string): XsilProductDnaRecord {
  return {
    productDnaId: `product-${companyId}`,
    companyId,
    version: '1.0.0',
    productName: name,
    purpose: `Flagship offering for ${name}`,
    emotionalPromise: promise,
    lifecycle: 'flagship',
    packagingRules: 'Brand-safe packaging with luxury floor',
    launchStrategy: 'Evidence-led launch with founder approval gate',
    audienceFit: 'Primary audience segment',
    updatedAt: now,
  };
}

export const SEED_PRODUCT_REGISTRY: XsilProductDnaRecord[] = [
  product('studio-os', 'Studio OS Platform', 'Your operating civilization awaits'),
  product('frontal-slayer', 'Concierge Mansion Experience', 'Welcome back, bestie. Your mansion is ready.'),
  product('ndx', 'Media Command Floor', 'Signal detected. Your command floor is live.'),
];

export const SEED_CREATIVE_REGISTRY: XsilCreativeNode[] = [
  {
    nodeId: 'creative-studio-campaign',
    companyId: 'studio-os',
    nodeType: 'campaign',
    title: 'Legacy Institution Campaign',
    tags: ['legacy', 'headquarters', 'executive'],
    approvalStatus: 'approved',
    relatedNodeIds: ['creative-studio-hero'],
    updatedAt: now,
  },
  {
    nodeId: 'creative-studio-hero',
    companyId: 'studio-os',
    nodeType: 'asset',
    title: 'HQ Hero — Operating Civilization',
    tags: ['hero', 'marble', 'institutional'],
    approvalStatus: 'approved',
    relatedNodeIds: ['creative-studio-campaign'],
    updatedAt: now,
  },
  {
    nodeId: 'creative-fs-packaging',
    companyId: 'frontal-slayer',
    nodeType: 'packaging',
    title: 'Gloss White Product Card',
    tags: ['packaging', 'concierge', 'beauty'],
    approvalStatus: 'approved',
    relatedNodeIds: [],
    updatedAt: now,
  },
  {
    nodeId: 'creative-ndx-desk',
    companyId: 'ndx',
    nodeType: 'motion',
    title: 'Broadcast Desk Motion',
    tags: ['broadcast', 'signal', 'dark-glass'],
    approvalStatus: 'approved',
    relatedNodeIds: [],
    updatedAt: now,
  },
];

export const SEED_CANON_REGISTRY: XsilCanonCandidate[] = [
  {
    candidateId: 'canon-studio-manual',
    companyId: 'studio-os',
    title: 'Studio OS Operating Manual v1',
    summary: 'Executive principles and launch SOPs',
    proposedClass: 'company-canon',
    source: 'Operating Manual Engine',
    confidence: 88,
    status: 'approved',
    founderReviewRequired: true,
    createdAt: now,
  },
  {
    candidateId: 'canon-fs-brand',
    companyId: 'frontal-slayer',
    title: 'Concierge warmth rule',
    summary: 'Every touchpoint must feel personally known',
    proposedClass: 'brand-canon',
    source: 'Brand Discovery cross-check',
    confidence: 91,
    status: 'pending',
    founderReviewRequired: true,
    createdAt: now,
  },
];

export function buildStudioIntelligenceSeedStore() {
  return {
    version: XSIL_SUBSYSTEM_VERSION,
    companyRegistry: SEED_COMPANY_REGISTRY,
    operatingManualRegistry: SEED_OPERATING_MANUAL_REGISTRY,
    decisionRegistry: SEED_DECISION_REGISTRY,
    tasteRegistry: SEED_TASTE_REGISTRY,
    audienceRegistry: SEED_AUDIENCE_REGISTRY,
    productRegistry: SEED_PRODUCT_REGISTRY,
    creativeRegistry: SEED_CREATIVE_REGISTRY,
    canonRegistry: SEED_CANON_REGISTRY,
    seededAt: new Date().toISOString(),
  };
}
