import {
  conductExecutiveCouncilMeeting,
  ensureOrganizationExecutiveCouncilProfile,
  getOrganizationExecutiveCouncilProfile,
} from './org-store';
import type { ExecutiveCouncilDockAdvice } from './org-types';

const STRATEGIC_PATTERNS =
  /executive council|council meeting|collaborative|strategic decision|increase revenue|grow revenue|should we|evaluate|major decision|executive briefing|many minds|cross-functional|what do the executives|leadership team/i;

export function resolveExecutiveCouncilAdvice(
  input: string,
  organizationId: string
): ExecutiveCouncilDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed || !STRATEGIC_PATTERNS.test(trimmed)) return null;

  const profile = getOrganizationExecutiveCouncilProfile(organizationId) ?? ensureOrganizationExecutiveCouncilProfile(organizationId);

  if (/open council|executive council dashboard|digital executives/i.test(trimmed)) {
    return {
      response: `${profile.activeExecutives} Digital Executives ready · ${profile.meetingsHeld} council meetings held · ${profile.pendingDecisions} pending founder decisions. Open Executive Council for collaborative briefings.`,
      concierge: 'Chief Concierge',
      participantCount: profile.activeExecutives,
    };
  }

  const { briefing } = conductExecutiveCouncilMeeting(organizationId, trimmed);

  const participantLines = briefing.contributions
    .slice(0, 3)
    .map((c) => `${c.executiveName}: ${c.analysis.slice(0, 90)}…`)
    .join('\n');

  return {
    response: `${briefing.chiefConciergeSummary}\n\n${participantLines}\n\nRecommendation: ${briefing.recommendations[0] ?? 'Review full briefing in Executive Council.'}`,
    concierge: 'Chief Concierge',
    briefing,
    participantCount: briefing.participants.length,
  };
}

export function listExecutiveCouncilDockSuggestions(organizationId: string): string[] {
  ensureOrganizationExecutiveCouncilProfile(organizationId);
  const profile = getOrganizationExecutiveCouncilProfile(organizationId);

  const suggestions = [
    'We need to increase revenue — convene the Executive Council.',
    'What would the executive team recommend for our next strategic move?',
    'Evaluate this decision with multiple executive perspectives.',
    'Open Executive Council decision history.',
  ];

  if (profile?.pendingDecisions) {
    suggestions.unshift(`${profile.pendingDecisions} council decision(s) awaiting founder approval.`);
  }

  return suggestions.slice(0, 4);
}

export function buildProactiveCouncilSuggestion(organizationId: string): string | null {
  const profile = getOrganizationExecutiveCouncilProfile(organizationId);
  if (!profile) return null;

  if (profile.pendingDecisions > 0) {
    return `Executive Council: ${profile.pendingDecisions} collaborative decision(s) await founder review — never isolated AI advice.`;
  }

  if (profile.meetingsHeld === 0) {
    return `${profile.activeExecutives} Digital Executives ready — ask a strategic question and receive a unified executive briefing.`;
  }

  return `Council health ${profile.councilHealthPct}% · ${profile.meetingsHeld} meetings · ${profile.activeExecutives} executives — major decisions deserve many minds, one briefing.`;
}
