import { summarizeConfidenceProfile } from './improvement-engine';
import {
  ensureOrganizationKnowledgeConfidenceProfile,
  getOrganizationKnowledgeConfidenceProfile,
} from './store';
import type { KnowledgeConfidenceDockAdvice } from './types';

export function resolveKnowledgeConfidenceAdvice(
  input: string,
  organizationId: string
): KnowledgeConfidenceDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationKnowledgeConfidenceProfile(organizationId) ??
    ensureOrganizationKnowledgeConfidenceProfile(organizationId);

  if (/knowledge confidence|brain confidence|how confident|trustworthiness of knowledge|quality assurance/i.test(trimmed)) {
    return {
      response: summarizeConfidenceProfile(profile),
      concierge: 'Chief Concierge',
      overallConfidenceScore: profile.overallConfidenceScore,
    };
  }

  const brainMatch = profile.brainProfiles.find((b) =>
    trimmed.toLowerCase().includes(b.shortLabel.toLowerCase())
  );
  if (brainMatch && /confidence|score|reliable|trust|coverage/i.test(trimmed)) {
    const weakest = brainMatch.dimensionScores.slice().sort((a, b) => a.scorePct - b.scorePct)[0];
    return {
      response: `${brainMatch.brainLabel}: ${brainMatch.overallConfidenceScore}% overall confidence. Strongest: ${brainMatch.strongestDimension}. Weakest: ${brainMatch.weakestDimension} (${weakest?.scorePct ?? 0}%). Studio OS communicates honestly — never pretends to know more than it does.`,
      concierge: 'Chief Concierge',
      overallConfidenceScore: brainMatch.overallConfidenceScore,
      brainLabel: brainMatch.brainLabel,
    };
  }

  if (/learning recommendation|needs teaching|where.*weakest|low confidence/i.test(trimmed)) {
    const rec = profile.learningRecommendations[0];
    return {
      response: rec
        ? `${rec.brainLabel}: ${rec.trigger} — ${rec.recommendation}`
        : 'All Profession Brains above teaching threshold — institutional intelligence quality is strong.',
      concierge: 'Chief Concierge',
      overallConfidenceScore: profile.overallConfidenceScore,
    };
  }

  if (/weakest brain|lowest confidence|where.*teaching/i.test(trimmed)) {
    const weakest = profile.brainProfiles.slice().sort((a, b) => a.overallConfidenceScore - b.overallConfidenceScore)[0];
    return {
      response: weakest
        ? `Lowest confidence: ${weakest.brainLabel} at ${weakest.overallConfidenceScore}%. Focus on ${weakest.weakestDimension}. Update Profession Brain™ and Studio Institute™.`
        : 'No Profession Brains assessed yet.',
      concierge: 'Chief Concierge',
      brainLabel: weakest?.brainLabel,
      overallConfidenceScore: profile.overallConfidenceScore,
    };
  }

  return null;
}

export function listKnowledgeConfidenceDockSuggestions(organizationId: string): string[] {
  const profile = ensureOrganizationKnowledgeConfidenceProfile(organizationId);
  const weakest = profile.brainProfiles.slice().sort((a, b) => a.overallConfidenceScore - b.overallConfidenceScore)[0];

  return [
    'What is our overall Knowledge Confidence score?',
    weakest ? `How confident is our ${weakest.shortLabel} brain?` : 'Which Profession Brain needs teaching?',
    'Show learning recommendations for low confidence areas',
    'Where is our institutional knowledge strongest?',
  ].slice(0, 4);
}

export function buildProactiveKnowledgeConfidenceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationKnowledgeConfidenceProfile(organizationId);
  if (!profile) return null;

  const highPriority = profile.learningRecommendations.find((r) => r.priority === 'high');
  if (highPriority) {
    return `${highPriority.brainLabel}: ${highPriority.trigger} — ${highPriority.recommendation.slice(0, 100)}. Trust through transparency.`;
  }

  if (profile.brainsNeedingTeaching > 0) {
    return `${profile.brainsNeedingTeaching} Profession Brain(s) below confidence threshold — review Knowledge Confidence before relying on automated guidance.`;
  }

  return `Knowledge Confidence ${profile.overallConfidenceScore}% — institutional intelligence quality assured across ${profile.brainsAssessed} brains.`;
}
