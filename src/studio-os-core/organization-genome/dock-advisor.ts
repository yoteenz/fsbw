import {
  consultOrganizationGenome,
  formatGenomeConsultationBrief,
} from './ai-consultation';
import {
  ensureOrganizationGenomeProfile,
  getOrganizationGenomeProfile,
} from './store';
import type { OrganizationGenomeDockAdvice } from './types';

export function resolveOrganizationGenomeAdvice(
  input: string,
  organizationId: string
): OrganizationGenomeDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationGenomeProfile(organizationId) ?? ensureOrganizationGenomeProfile(organizationId);

  if (/who are we|our identity|our mission|our vision|our values|organization genome|genome/i.test(trimmed)) {
    return {
      response: `${profile.companyName} — Mission: ${profile.identityCore.mission.slice(0, 140)}. Vision: ${profile.identityCore.vision.slice(0, 100)}. Values: ${profile.identityCore.coreValues.slice(0, 3).join(' · ')}.`,
      concierge: 'Chief Concierge',
      genomeApplied: true,
    };
  }

  if (/tone|voice|how do we communicate|brand personality|vocabulary/i.test(trimmed)) {
    return {
      response: `Tone: ${profile.brandVoice.toneOfVoice.slice(0, 120)}. Style: ${profile.brandVoice.communicationStyle}. Vocabulary: ${profile.brandVoice.brandVocabulary.slice(0, 5).join(' · ')}.`,
      concierge: 'Chief Concierge',
      genomeApplied: true,
    };
  }

  if (/decision|approval|risk tolerance|how do we decide/i.test(trimmed)) {
    return {
      response: `${profile.decisionDna.leadershipPhilosophy.slice(0, 100)} Approval: ${profile.decisionDna.approvalPreferences}. Risk: ${profile.decisionDna.riskTolerance}. ${profile.decisionDna.decisionPrinciples[0] ?? ''}`,
      concierge: 'Chief Concierge',
      genomeApplied: true,
    };
  }

  if (/draft email|write email|customer response|marketing|proposal|presentation/i.test(trimmed)) {
    const context = /email/i.test(trimmed)
      ? 'email'
      : /marketing|campaign/i.test(trimmed)
        ? 'marketing-campaign'
        : /proposal/i.test(trimmed)
          ? 'proposal'
          : /presentation/i.test(trimmed)
            ? 'presentation'
            : /customer/i.test(trimmed)
              ? 'customer-interaction'
              : 'general';
    const brief = formatGenomeConsultationBrief(profile, context);
    const consultation = consultOrganizationGenome(profile, context);
    return {
      response: `Before generating — consult Organization Genome™. ${consultation.toneGuidance}. ${consultation.constraints[0] ?? brief.split('\n')[1] ?? ''}`,
      concierge: 'Chief Concierge',
      genomeApplied: true,
    };
  }

  return null;
}

export function listOrganizationGenomeDockSuggestions(organizationId: string): string[] {
  ensureOrganizationGenomeProfile(organizationId);
  const profile = getOrganizationGenomeProfile(organizationId);
  if (!profile) {
    return ['Open Organization Genome.', 'Complete Business Discovery Blueprint identity chapter.'];
  }

  return [
    'Who are we — what is our organizational identity?',
    `Review tone of voice — ${profile.brandVoice.communicationStyle}.`,
    'How do we make decisions and handle approvals?',
    'Consult Genome before drafting customer communications.',
  ];
}

export function buildProactiveGenomeSuggestion(organizationId: string): string | null {
  const profile = getOrganizationGenomeProfile(organizationId);
  if (!profile) return null;

  if (profile.genomeCompletenessPct < 60) {
    return `Organization Genome is ${profile.genomeCompletenessPct}% complete — continue Business Discovery Blueprint identity chapters to strengthen who ${profile.companyName} is.`;
  }

  return `Every AI interaction consults your Genome — ${profile.brandVoice.toneOfVoice.slice(0, 80)}. Mission drives every output.`;
}
