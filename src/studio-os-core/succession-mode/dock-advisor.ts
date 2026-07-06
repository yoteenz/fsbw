import {
  ensureOrganizationSuccessionProfile,
  getOrganizationSuccessionProfile,
} from './store';
import type { SuccessionModeDockAdvice } from './types';

export function resolveSuccessionModeAdvice(
  input: string,
  organizationId: string
): SuccessionModeDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationSuccessionProfile(organizationId) ?? ensureOrganizationSuccessionProfile(organizationId);

  if (/succession|founder unavailable|can we operate|succession readiness|irreplaceable knowledge/i.test(trimmed)) {
    const top = profile.recommendations[0];
    return {
      response: `Succession Readiness ${profile.overallSuccessionReadiness}% (${profile.overallStatus}). Founder dependency ${profile.founderDependencyPct}%. ${profile.legacyContinuity.canOperateWithoutFounder ? 'Trending toward independent operation.' : 'More preservation needed before founder unavailability.'} ${top ? top.title + ' — ' + top.rationale.slice(0, 80) : ''}`,
      concierge: 'Chief Concierge',
      readinessScore: profile.overallSuccessionReadiness,
    };
  }

  if (/founder only|knowledge dependency|who holds|single person/i.test(trimmed)) {
    const high = profile.knowledgeDependencies.filter((d) => d.riskLevel === 'high')[0];
    return {
      response: high
        ? `${high.area} — ${high.dependencyType.replace(/-/g, ' ')}. ${high.recommendation.slice(0, 100)}`
        : 'No critical single-person dependencies detected — maintain Profession Brain sync.',
      concierge: 'Chief Concierge',
      readinessScore: profile.overallSuccessionReadiness,
    };
  }

  if (/legacy|preserve expertise|build legacy|future generations/i.test(trimmed)) {
    return {
      response: profile.legacyContinuity.summary.slice(0, 200),
      concierge: 'Chief Concierge',
      readinessScore: profile.overallSuccessionReadiness,
    };
  }

  return null;
}

export function listSuccessionModeDockSuggestions(organizationId: string): string[] {
  ensureOrganizationSuccessionProfile(organizationId);
  const profile = getOrganizationSuccessionProfile(organizationId);
  if (!profile) {
    return ['Open Succession Mode.', 'Assess succession readiness.'];
  }

  const suggestions = [
    'Can this organization operate if the founder becomes unavailable?',
    'What knowledge exists only in one person\'s head?',
    'Show succession readiness recommendations.',
  ];

  if (profile.recommendations[0]) {
    suggestions.unshift(profile.recommendations[0].title);
  }

  return suggestions.slice(0, 4);
}

export function buildProactiveSuccessionSuggestion(organizationId: string): string | null {
  const profile = getOrganizationSuccessionProfile(organizationId);
  if (!profile) return null;

  const critical = profile.knowledgeDependencies.find((d) => d.riskLevel === 'high' && d.dependencyType === 'founder-only');
  if (critical) {
    return `Succession Mode: ${critical.area} is founder-only knowledge — preserve in Profession Brain before it becomes irreplaceable.`;
  }

  if (profile.overallSuccessionReadiness < 60) {
    return `Succession Readiness ${profile.overallSuccessionReadiness}% — preserve expertise, build legacy. Not about replacing founders — preserving everything they built.`;
  }

  return `Succession Readiness ${profile.overallSuccessionReadiness}% — organization less dependent on one person's memory.`;
}
