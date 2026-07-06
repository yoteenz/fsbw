import { RELEASE_GATE_LABELS } from './constants';
import { queryReleaseReadiness } from './discovery-engine';
import { describeReleaseGate } from './gate-engine';
import { explainOpenIssue, summarizeReleaseReadiness } from './report-engine';
import {
  ensureOrganizationReleaseReadinessProfile,
  getOrganizationReleaseReadinessProfile,
  selectReleaseCandidate,
} from './store';
import type { ReleaseReadinessDockAdvice } from './types';

export function resolveReleaseReadinessAdvice(
  input: string,
  organizationId: string
): ReleaseReadinessDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationReleaseReadinessProfile(organizationId) ??
    ensureOrganizationReleaseReadinessProfile(organizationId);

  if (/release readiness|production ready|readiness score|approval gate|deploy/i.test(trimmed)) {
    return {
      response: summarizeReleaseReadiness(profile),
      concierge: 'Chief Concierge',
      overallReadinessScore: profile.overallReadinessScore,
      releaseGate: profile.releaseGate,
    };
  }

  if (/executive approval|rollback|deployment strategy|studio intelligence briefing/i.test(trimmed)) {
    const brief = profile.executiveBriefs[0];
    if (brief) {
      return { response: brief.studioIntelligenceSummary, concierge: 'Chief Concierge', releaseGate: profile.releaseGate };
    }
  }

  if (/production is a privilege|earn the right|confident before deployment/i.test(trimmed)) {
    return {
      response: describeReleaseGate(profile.releaseGate),
      concierge: 'Chief Concierge',
      overallReadinessScore: profile.overallReadinessScore,
      releaseGate: profile.releaseGate,
    };
  }

  if (/blocked|not ready|needs review|ready for qa|executive review/i.test(trimmed)) {
    const gate = profile.releaseGate;
    return {
      response: `${RELEASE_GATE_LABELS[gate]} — ${profile.approvalsGranted}/${profile.approvalsRequired} approvals · ${profile.openIssuesCount} open issues.`,
      concierge: 'Chief Concierge',
      releaseGate: gate,
    };
  }

  const hits = queryReleaseReadiness(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|readiness|approval/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallReadinessScore: profile.overallReadinessScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:issue|approval|readiness) (.+)/i);
  if (explainMatch) {
    const found = queryReleaseReadiness(explainMatch[1], profile, 1);
    if (found[0]?.type === 'issue') {
      const issue = profile.openIssues.find((i) => i.id === found[0].id);
      if (issue) return { response: explainOpenIssue(issue), concierge: 'Chief Concierge' };
    }
  }

  if (/design compliance|prompt qa|experience qa|visual diff|accessibility|performance|regression|security|trust|simulation|guardian|documentation/i.test(trimmed)) {
    const approval = profile.disciplineApprovals.find((a) =>
      trimmed.toLowerCase().includes(a.discipline.replace(/-/g, ' ').split(' ')[0] ?? '')
    );
    if (approval) {
      selectReleaseCandidate(organizationId, profile.selectedReleaseId ?? profile.productionReports[0]?.releaseId ?? '');
      return { response: `${approval.disciplineLabel}: ${approval.status} · ${approval.score}% — ${approval.summary}`, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactiveReadinessSuggestion(organizationId: string): string | null {
  const profile = getOrganizationReleaseReadinessProfile(organizationId);
  if (!profile) return null;
  return summarizeReleaseReadiness(profile);
}

export function buildReleaseReadinessOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationReleaseReadinessProfile(organizationId);
  return profile.dockReadinessLine;
}
