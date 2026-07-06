import {
  ensureOrganizationMemoryProfile,
  getOrganizationMemoryProfile,
  recallMemoryForQuery,
} from './store';
import type { MemoryEngineDockAdvice } from './types';

export function resolveMemoryEngineAdvice(
  input: string,
  organizationId: string
): MemoryEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (
    /have we done|done this before|what happened|recommend again|memory engine|organizational memory|remember when|past project|lessons learned/i.test(
      trimmed
    )
  ) {
    const profile = getOrganizationMemoryProfile(organizationId) ?? ensureOrganizationMemoryProfile(organizationId);
    const recall = recallMemoryForQuery(organizationId, trimmed);
    return {
      response: recall.hasPriorExperience
        ? `Memory: ${recall.whatHappened} Recommendation: ${recall.recommendation.replace(/-/g, ' ')} — ${recall.recommendationReason}`
        : `No prior memory for this yet — ${profile.companyName} will remember this outcome forever once documented.`,
      concierge: 'Chief Concierge',
      recall,
    };
  }

  if (/memory depth|how much do we remember|compounding|stop repeating/i.test(trimmed)) {
    const profile = getOrganizationMemoryProfile(organizationId) ?? ensureOrganizationMemoryProfile(organizationId);
    const top = profile.compoundingRecommendations[0];
    return {
      response: `Memory depth ${profile.memoryDepthScore}% · ${profile.records.length} records · ${profile.totalLessonsCaptured} lessons. ${top ? top.title + ' — ' + top.rationale.slice(0, 80) : 'Continue completing projects to compound knowledge.'}`,
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listMemoryEngineDockSuggestions(organizationId: string): string[] {
  ensureOrganizationMemoryProfile(organizationId);
  const profile = getOrganizationMemoryProfile(organizationId);
  if (!profile) {
    return ['Open Memory Engine.', 'Document a completed project lesson.'];
  }

  const suggestions = [
    'Have we done this before?',
    'What happened last time we tried this?',
    'Would we recommend doing it again?',
  ];

  if (profile.compoundingRecommendations[0]) {
    suggestions.unshift(profile.compoundingRecommendations[0].title);
  }

  return suggestions.slice(0, 4);
}

export function buildProactiveMemorySuggestion(organizationId: string): string | null {
  const profile = getOrganizationMemoryProfile(organizationId);
  if (!profile) return null;

  const avoid = profile.compoundingRecommendations.find((r) => r.category === 'avoid-failure');
  if (avoid) {
    return `Memory Engine: ${avoid.title} — knowledge explains why; memory proves what actually worked.`;
  }

  if (profile.memoryDepthScore < 50) {
    return `Memory depth ${profile.memoryDepthScore}% — complete projects to auto-generate lessons learned and best practices.`;
  }

  return `Studio OS remembers ${profile.records.length} organizational moments — recall before repeating initiatives.`;
}
