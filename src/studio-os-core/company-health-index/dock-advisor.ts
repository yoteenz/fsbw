import {
  ensureOrganizationHealthIndexProfile,
  getOrganizationHealthIndexProfile,
} from './store';
import type { CompanyHealthIndexDockAdvice } from './types';

export function resolveCompanyHealthIndexAdvice(
  input: string,
  organizationId: string
): CompanyHealthIndexDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationHealthIndexProfile(organizationId) ?? ensureOrganizationHealthIndexProfile(organizationId);

  if (/health index|company health|executive health|organizational health|weak area|health score/i.test(trimmed)) {
    const weak = profile.weakAreas[0];
    return {
      response: weak
        ? `Executive Health ${profile.executiveHealthScore}% (${profile.executiveStatus}). Weakest: ${weak.label} at ${weak.scorePct}% — ${weak.proactiveAction.slice(0, 100)}`
        : `Executive Health ${profile.executiveHealthScore}% — all major categories above threshold. Healthier, not simply larger.`,
      concierge: 'Chief Concierge',
      executiveScore: profile.executiveHealthScore,
    };
  }

  if (/what needs attention|proactive|before it becomes a problem/i.test(trimmed)) {
    const priority = profile.proactivePriorities[0];
    return {
      response: priority ?? 'Review Company Health Index for proactive priorities.',
      concierge: 'Chief Concierge',
      executiveScore: profile.executiveHealthScore,
    };
  }

  const category = profile.categoryScores.find((c) =>
    trimmed.toLowerCase().includes(c.label.toLowerCase().split(' ')[0])
  );
  if (category && /health|score|how are we/i.test(trimmed)) {
    return {
      response: `${category.label}: ${category.scorePct}% (${category.status}). ${category.signal.slice(0, 100)}. ${category.recommendation.slice(0, 80)}`,
      concierge: 'Chief Concierge',
      executiveScore: profile.executiveHealthScore,
    };
  }

  return null;
}

export function listCompanyHealthIndexDockSuggestions(organizationId: string): string[] {
  ensureOrganizationHealthIndexProfile(organizationId);
  const profile = getOrganizationHealthIndexProfile(organizationId);
  if (!profile) {
    return ['Open Company Health Index.', 'Review executive health score.'];
  }

  const suggestions = [
    'What is our executive health score?',
    'Which areas need attention before they become problems?',
    'Show proactive health priorities.',
  ];

  if (profile.weakAreas[0]) {
    suggestions.unshift(`Address ${profile.weakAreas[0].label} (${profile.weakAreas[0].scorePct}%) proactively.`);
  }

  return suggestions.slice(0, 4);
}

export function buildProactiveHealthSuggestion(organizationId: string): string | null {
  const profile = getOrganizationHealthIndexProfile(organizationId);
  if (!profile) return null;

  if (profile.weakAreas[0]) {
    return `Executive Health ${profile.executiveHealthScore}% — ${profile.weakAreas[0].label} at ${profile.weakAreas[0].scorePct}% needs proactive attention before it becomes a business problem.`;
  }

  return `Executive Health ${profile.executiveHealthScore}% — organization trending ${profile.executiveStatus}. Studio OS helps you become healthier, not simply larger.`;
}
