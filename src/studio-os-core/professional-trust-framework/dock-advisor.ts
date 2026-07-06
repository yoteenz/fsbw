import {
  ensureOrganizationTrustFrameworkProfile,
  getOrganizationTrustFrameworkProfile,
  recommendEscalationForAction,
} from './store';
import type { ProfessionalTrustDockAdvice } from './types';

export function resolveProfessionalTrustAdvice(
  input: string,
  organizationId: string
): ProfessionalTrustDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationTrustFrameworkProfile(organizationId);
  if (!profile) return null;

  const escalation = recommendEscalationForAction(trimmed, profile.brainDeclarations);
  if (escalation) {
    return {
      response: `This action may exceed Digital Concierge scope. ${escalation.label} — ${escalation.reason}`,
      concierge: 'Chief Concierge',
      escalation,
      beyondScope: true,
    };
  }

  if (/trust|scope|confidence|professional review|licensed/i.test(trimmed)) {
    const brain = profile.brainDeclarations[0];
    if (brain) {
      const sample = brain.guidanceSamples[0];
      return {
        response: sample
          ? sample.message
          : `${brain.brainLabel} · Coverage ${brain.confidence.knowledgeCoveragePct}% · ${brain.confidence.confidenceLevel} confidence · Review: ${brain.confidence.professionalReviewStatus.replace(/-/g, ' ')}.`,
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/what can.*do|what cannot|scope/i.test(trimmed)) {
    const brain = profile.brainDeclarations.find((d) =>
      trimmed.toLowerCase().includes(d.brainLabel.toLowerCase().split(' ')[0])
    ) ?? profile.brainDeclarations[0];
    if (brain) {
      return {
        response: `Can: ${brain.scope.canDo.slice(0, 2).join(' · ')}. Cannot: ${brain.scope.cannotDo[0]}. Review: ${brain.scope.reviewRequired[0] ?? 'as needed'}.`,
        concierge: 'Chief Concierge',
      };
    }
  }

  return null;
}

export function listProfessionalTrustDockSuggestions(organizationId: string): string[] {
  ensureOrganizationTrustFrameworkProfile(organizationId);
  const profile = getOrganizationTrustFrameworkProfile(organizationId);
  if (!profile) {
    return ['Open Professional Trust Framework.', 'Review Profession Brain scope declarations.'];
  }

  const regulated = profile.brainDeclarations.filter(
    (d) => d.confidence.professionalReviewStatus !== 'none'
  );
  const suggestions = [
    'What is this Profession Brain allowed to do?',
    'Schedule consultation for actions beyond scope.',
  ];

  if (regulated[0]) {
    suggestions.unshift(
      `Review ${regulated[0].brainLabel} — professional review ${regulated[0].confidence.professionalReviewStatus.replace(/-/g, ' ')}.`
    );
  }

  suggestions.push('Prepare documents before licensed professional review.');
  return suggestions.slice(0, 4);
}

export function buildProactiveTrustSuggestion(organizationId: string): string | null {
  const profile = getOrganizationTrustFrameworkProfile(organizationId);
  if (!profile) return null;

  const needsReview = profile.brainDeclarations.find(
    (d) => d.confidence.professionalReviewStatus === 'required-before-submission'
  );
  if (needsReview?.guidanceSamples[0]) {
    return needsReview.guidanceSamples[0].message;
  }

  return null;
}
