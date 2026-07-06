import { AI_CONSULTATION_CONTEXTS } from './constants';
import type {
  AiConsultationContext,
  GenomeAiConsultationRule,
  GenomeConsultationResult,
  OrganizationGenomeProfile,
} from './types';

const GENERIC_AVOID = [
  'Generic SaaS language',
  'Fear-based disclaimers',
  'Identity inconsistent with Genome',
  'Tone that contradicts brand voice',
];

function buildRuleForContext(
  profile: OrganizationGenomeProfile,
  context: AiConsultationContext
): GenomeAiConsultationRule {
  const { identityCore, brandVoice, decisionDna, customerStandards } = profile;
  const baseReflect = [
    `Mission: ${identityCore.mission.slice(0, 120)}`,
    `Tone: ${brandVoice.toneOfVoice.slice(0, 80)}`,
    `Values: ${identityCore.coreValues.slice(0, 3).join(' · ')}`,
  ];

  const contextRules: Record<AiConsultationContext, { reflect: string[]; avoid: string[]; sample: string }> = {
    email: {
      reflect: [...baseReflect, brandVoice.communicationStyle],
      avoid: [...GENERIC_AVOID, 'Overly casual unless Genome specifies warm tone'],
      sample: `Draft reflects ${brandVoice.communicationStyle} style — ${brandVoice.toneOfVoice.slice(0, 60)}.`,
    },
    workflow: {
      reflect: [...baseReflect, ...decisionDna.decisionPrinciples.slice(0, 2)],
      avoid: [...GENERIC_AVOID, 'Workflows that bypass approval preferences'],
      sample: `Automation respects ${decisionDna.approvalPreferences} approval pattern.`,
    },
    proposal: {
      reflect: [...baseReflect, brandVoice.designPhilosophy.slice(0, 80)],
      avoid: [...GENERIC_AVOID, 'Proposals that ignore risk tolerance'],
      sample: `Proposal aligns to ${decisionDna.riskTolerance} risk posture and organizational values.`,
    },
    presentation: {
      reflect: [...baseReflect, brandVoice.designPhilosophy],
      avoid: [...GENERIC_AVOID, 'Visual or narrative inconsistent with brand personality'],
      sample: `Presentation uses ${brandVoice.brandVocabulary.slice(0, 4).join(' · ')} vocabulary.`,
    },
    automation: {
      reflect: [...baseReflect, decisionDna.leadershipPhilosophy.slice(0, 80)],
      avoid: [...GENERIC_AVOID, 'Autonomous actions beyond approval preferences'],
      sample: `Automation consults Genome before executing — escalates per ${decisionDna.approvalPreferences}.`,
    },
    'concierge-response': {
      reflect: [...baseReflect, customerStandards.escalationTone],
      avoid: [...GENERIC_AVOID, 'Responses that ignore customer experience standards'],
      sample: customerStandards.servicePromise,
    },
    'marketing-campaign': {
      reflect: [...baseReflect, brandVoice.brandPersonality.slice(0, 80)],
      avoid: [...GENERIC_AVOID, 'Campaign voice that conflicts with internal terminology'],
      sample: `Campaign voice: ${brandVoice.brandPersonality.slice(0, 100)}.`,
    },
    'customer-interaction': {
      reflect: [...baseReflect, ...customerStandards.experienceStandards.slice(0, 2)],
      avoid: [...GENERIC_AVOID, 'Interactions that feel like generic AI'],
      sample: customerStandards.escalationTone,
    },
    document: {
      reflect: [...baseReflect, ...brandVoice.brandRules.slice(0, 2)],
      avoid: [...GENERIC_AVOID, 'Documents without organizational terminology'],
      sample: `Document uses internal terms: ${brandVoice.internalTerminology.slice(0, 3).join(' · ')}.`,
    },
    general: {
      reflect: baseReflect,
      avoid: GENERIC_AVOID,
      sample: `All output reflects who ${profile.companyName} is — not generic AI defaults.`,
    },
  };

  const rule = contextRules[context];
  return {
    context,
    mustReflect: rule.reflect,
    mustAvoid: rule.avoid,
    sampleGuidance: rule.sample,
  };
}

export function buildAiConsultationRules(profile: OrganizationGenomeProfile): GenomeAiConsultationRule[] {
  return AI_CONSULTATION_CONTEXTS.map((context) => buildRuleForContext(profile, context));
}

/** Every AI interaction should consult the Organization Genome before generating work. */
export function consultOrganizationGenome(
  profile: OrganizationGenomeProfile,
  context: AiConsultationContext = 'general'
): GenomeConsultationResult {
  const rule =
    profile.aiConsultationRules.find((r) => r.context === context) ??
    buildRuleForContext(profile, context);

  return {
    organizationId: profile.organizationId,
    context,
    constraints: [...rule.mustReflect, ...rule.mustAvoid.map((a) => `Avoid: ${a}`)],
    toneGuidance: `${profile.brandVoice.toneOfVoice} · ${profile.brandVoice.communicationStyle}`,
    vocabularyToUse: profile.brandVoice.brandVocabulary,
    vocabularyToAvoid: ['subscribe to features', 'AI platform', 'setup complete', 'generic chatbot'],
    mustReflectIdentity: profile.genomeCompletenessPct >= 40,
  };
}

export function formatGenomeConsultationBrief(
  profile: OrganizationGenomeProfile,
  context: AiConsultationContext = 'general'
): string {
  const consultation = consultOrganizationGenome(profile, context);
  const lines = [
    `ORGANIZATION GENOME™ · ${profile.companyName}`,
    `Mission: ${profile.identityCore.mission}`,
    `Tone: ${consultation.toneGuidance}`,
    `Values: ${profile.identityCore.coreValues.join(' · ')}`,
    `Decision: ${profile.decisionDna.decisionPrinciples[0] ?? 'Consult founder on high-impact choices.'}`,
    ...consultation.constraints.slice(0, 4).map((c) => `· ${c}`),
  ];
  return lines.join('\n');
}
