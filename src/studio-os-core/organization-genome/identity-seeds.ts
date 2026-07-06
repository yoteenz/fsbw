import type { OrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/types';
import type { OrganizationCharter } from '../organization-inauguration/types';
import { loadWorkspace } from '../workspace/loader';
import type {
  GenomeCommunicationStyle,
  GenomeIdentityLayerEntry,
  OrganizationBrandVoice,
  OrganizationCustomerStandards,
  OrganizationDecisionDna,
  OrganizationIdentityCore,
} from './types';
import {
  GENOME_APPROVAL_STYLES,
  GENOME_RISK_LEVELS,
} from './constants';

function answer(blueprint: OrganizationDiscoveryBlueprint | null, promptId: string): string {
  return blueprint?.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

function parseList(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferCommunicationStyle(blueprint: OrganizationDiscoveryBlueprint | null): GenomeCommunicationStyle {
  const industry = blueprint?.industryId ?? '';
  const tone = answer(blueprint, 'identity-uvp').toLowerCase();
  if (/technical|precision|engineering|compliance/i.test(industry + tone)) return 'technical-precise';
  if (/story|legacy|heritage|craft/i.test(tone)) return 'story-driven';
  if (/teach|learn|education|academy/i.test(tone)) return 'educational';
  if (/warm|care|personal|boutique/i.test(tone)) return 'warm-professional';
  return 'executive-direct';
}

function inferRiskTolerance(blueprint: OrganizationDiscoveryBlueprint | null): (typeof GENOME_RISK_LEVELS)[number] {
  const mistakes = answer(blueprint, 'decision-mistakes').toLowerCase();
  const automation = answer(blueprint, 'growth-automation').toLowerCase();
  if (/cautious|conservative|slow|careful/i.test(mistakes)) return 'conservative';
  if (/experiment|bold|move fast|aggressive/i.test(automation + mistakes)) return 'bold';
  if (/pilot|test|iterate/i.test(automation)) return 'experimental';
  return 'balanced';
}

function inferApprovalStyle(blueprint: OrganizationDiscoveryBlueprint | null): (typeof GENOME_APPROVAL_STYLES)[number] {
  const onlyYou = answer(blueprint, 'founder-only-you');
  const judgment = answer(blueprint, 'decision-human-judgment');
  if (onlyYou.length > 20) return 'founder-final';
  if (/team|consensus|collaborate/i.test(judgment)) return 'team-consensus';
  if (/delegate|trust|autonomous/i.test(judgment)) return 'autonomous-with-escalation';
  return 'delegated-with-review';
}

export function buildIdentityCore(
  blueprint: OrganizationDiscoveryBlueprint | null,
  charter?: OrganizationCharter
): OrganizationIdentityCore {
  const mission =
    charter?.mission ||
    answer(blueprint, 'identity-mission') ||
    'Mission preserved in organizational memory.';
  const vision =
    charter?.vision ||
    answer(blueprint, 'identity-vision') ||
    answer(blueprint, 'growth-vision') ||
    'Vision evolving with the organization.';
  const valuesRaw =
    charter?.coreValues ||
    answer(blueprint, 'wisdom-new-employee') ||
    answer(blueprint, 'decision-unwritten') ||
    'Core values documented through Business Discovery Blueprint™.';
  const objectivesRaw =
    charter?.growthObjectives ||
    answer(blueprint, 'growth-future-goals') ||
    answer(blueprint, 'identity-goals') ||
    'Long-term objectives captured in Discovery Blueprint.';
  const founderPhilosophy =
    [
      answer(blueprint, 'founder-only-you'),
      answer(blueprint, 'decision-patterns'),
      answer(blueprint, 'wisdom-never-outsource'),
    ]
      .filter(Boolean)
      .join(' ') || 'Leadership philosophy evolves with founder discovery sessions.';

  return {
    mission,
    vision,
    coreValues: parseList(valuesRaw).length > 0 ? parseList(valuesRaw) : [valuesRaw],
    longTermObjectives: parseList(objectivesRaw).length > 0 ? parseList(objectivesRaw) : [objectivesRaw],
    founderPhilosophy,
  };
}

export function buildBrandVoice(
  organizationId: string,
  blueprint: OrganizationDiscoveryBlueprint | null
): OrganizationBrandVoice {
  const workspace = loadWorkspace(organizationId)?.schema;
  const uvp = answer(blueprint, 'identity-uvp');
  const personality =
    uvp ||
    workspace?.metadata.description ||
    'Professional · trustworthy · expertise-driven organization.';
  const tone =
    workspace?.brandVoice ||
    answer(blueprint, 'wisdom-new-employee') ||
    'Clear · confident · respectful — never generic or fear-based.';
  const vocabulary = parseList(
    answer(blueprint, 'identity-core-services') + ',' + answer(blueprint, 'services-differentiators')
  );
  const terminology = parseList(answer(blueprint, 'decision-unwritten') + ',' + answer(blueprint, 'wisdom-stories'));

  return {
    brandPersonality: personality,
    toneOfVoice: tone,
    communicationStyle: inferCommunicationStyle(blueprint),
    brandVocabulary: vocabulary.length > 0 ? vocabulary.slice(0, 12) : ['expertise', 'legacy', 'trust', 'service'],
    internalTerminology:
      terminology.length > 0 ? terminology.slice(0, 8) : ['Headquarters', 'Profession Brain', 'Digital Staff'],
    designPhilosophy:
      answer(blueprint, 'identity-uvp') ||
      'Graphics-first clarity · executive information architecture · premium professional presence.',
    brandRules: workspace?.brandRules ?? ['Preserve expertise', 'Build legacy', 'Guide responsibly'],
  };
}

export function buildDecisionDna(blueprint: OrganizationDiscoveryBlueprint | null): OrganizationDecisionDna {
  const principles = [
    answer(blueprint, 'decision-how'),
    answer(blueprint, 'decision-correct'),
    answer(blueprint, 'decision-human-judgment'),
    answer(blueprint, 'decision-shortcuts'),
  ].filter(Boolean);

  return {
    leadershipPhilosophy:
      answer(blueprint, 'founder-only-you') ||
      answer(blueprint, 'decision-patterns') ||
      'Leadership preserves judgment — automation assists, humans decide what matters.',
    decisionPrinciples:
      principles.length > 0
        ? principles
        : ['Document reasoning', 'Escalate when uncertain', 'Preserve institutional memory'],
    approvalPreferences: inferApprovalStyle(blueprint),
    approvalNotes: answer(blueprint, 'decision-human-judgment') || 'Founder review on high-impact decisions.',
    riskTolerance: inferRiskTolerance(blueprint),
    riskNotes: answer(blueprint, 'decision-mistakes') || 'Learn from mistakes — document exceptions in Profession Brain.',
  };
}

export function buildCustomerStandards(blueprint: OrganizationDiscoveryBlueprint | null): OrganizationCustomerStandards {
  const target = answer(blueprint, 'identity-target-customers');
  const services = answer(blueprint, 'identity-core-services');
  return {
    experienceStandards: [
      target ? `Serve ${target} with professional clarity.` : 'Every interaction reflects organizational standards.',
      'Concierge responses consult Genome before generating.',
      'Customer education before hard sells.',
    ],
    servicePromise: services
      ? `Deliver ${services.split(/[,;\n]/)[0]?.trim()} with consistent identity.`
      : 'Exceptional professional service aligned to organizational identity.',
    escalationTone: 'Warm · transparent · never dismissive — escalate with confidence, not fear.',
  };
}

export function buildIdentityLayers(
  identityCore: OrganizationIdentityCore,
  brandVoice: OrganizationBrandVoice,
  decisionDna: OrganizationDecisionDna,
  customerStandards: OrganizationCustomerStandards,
  now: string
): GenomeIdentityLayerEntry[] {
  const entries: Omit<GenomeIdentityLayerEntry, 'layer'>[] = [
    { label: 'BRAND PERSONALITY', value: brandVoice.brandPersonality, source: 'blueprint', lastUpdated: now },
    { label: 'TONE OF VOICE', value: brandVoice.toneOfVoice, source: 'workspace', lastUpdated: now },
    { label: 'COMMUNICATION STYLE', value: brandVoice.communicationStyle, source: 'derived', lastUpdated: now },
    { label: 'LEADERSHIP PHILOSOPHY', value: decisionDna.leadershipPhilosophy, source: 'blueprint', lastUpdated: now },
    { label: 'CORE VALUES', value: identityCore.coreValues.join(' · '), source: 'charter', lastUpdated: now },
    { label: 'CUSTOMER EXPERIENCE', value: customerStandards.servicePromise, source: 'blueprint', lastUpdated: now },
    { label: 'APPROVAL PREFERENCES', value: `${decisionDna.approvalPreferences} — ${decisionDna.approvalNotes}`, source: 'derived', lastUpdated: now },
    { label: 'RISK TOLERANCE', value: `${decisionDna.riskTolerance} — ${decisionDna.riskNotes}`, source: 'derived', lastUpdated: now },
    { label: 'DECISION PRINCIPLES', value: decisionDna.decisionPrinciples.join(' · '), source: 'blueprint', lastUpdated: now },
    { label: 'DESIGN PHILOSOPHY', value: brandVoice.designPhilosophy, source: 'derived', lastUpdated: now },
    { label: 'BRAND VOCABULARY', value: brandVoice.brandVocabulary.join(' · '), source: 'blueprint', lastUpdated: now },
    { label: 'INTERNAL TERMINOLOGY', value: brandVoice.internalTerminology.join(' · '), source: 'blueprint', lastUpdated: now },
    { label: 'MISSION', value: identityCore.mission, source: 'charter', lastUpdated: now },
    { label: 'VISION', value: identityCore.vision, source: 'charter', lastUpdated: now },
    { label: 'LONG-TERM OBJECTIVES', value: identityCore.longTermObjectives.join(' · '), source: 'blueprint', lastUpdated: now },
  ];

  return entries.map((entry, i) => ({
    ...entry,
    layer: [
      'brand-personality',
      'tone-of-voice',
      'communication-style',
      'leadership-philosophy',
      'core-values',
      'customer-experience',
      'approval-preferences',
      'risk-tolerance',
      'decision-principles',
      'design-philosophy',
      'brand-vocabulary',
      'internal-terminology',
      'mission-vision',
      'long-term-objectives',
    ][i] as GenomeIdentityLayerEntry['layer'],
  }));
}

export function computeGenomeCompleteness(
  identityCore: OrganizationIdentityCore,
  brandVoice: OrganizationBrandVoice,
  decisionDna: OrganizationDecisionDna
): number {
  const checks = [
    identityCore.mission.length > 20,
    identityCore.vision.length > 20,
    identityCore.coreValues.length > 0,
    brandVoice.brandPersonality.length > 10,
    brandVoice.toneOfVoice.length > 10,
    decisionDna.decisionPrinciples.length > 0,
    decisionDna.leadershipPhilosophy.length > 10,
    identityCore.longTermObjectives.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
