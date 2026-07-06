import { explainRedTeamFinding, queryAiRedTeam } from './discovery-engine';
import { summarizeAiRedTeam } from './engine-profile-builder';
import {
  ensureOrganizationAiRedTeamProfile,
  getOrganizationAiRedTeamProfile,
  runFullRedTeamStressTest,
  runRedTeamChallenge,
} from './store';
import { parseChallengeQuery } from './challenge-engine';
import type { AiRedTeamDockAdvice } from './types';

export function resolveAiRedTeamAdvice(input: string, organizationId: string): AiRedTeamDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationAiRedTeamProfile(organizationId) ?? ensureOrganizationAiRedTeamProfile(organizationId);

  if (/red team|ai red team|stress test|adversarial|assume.*wrong|break studio os/i.test(trimmed)) {
    return {
      response: summarizeAiRedTeam(profile),
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  if (/run challenge|what if.*skip|what if.*upload|what if.*automation|what if.*integration/i.test(trimmed)) {
    const challenge = parseChallengeQuery(trimmed);
    runRedTeamChallenge(organizationId, trimmed);
    return {
      response: challenge
        ? `Red Team challenge "${challenge.replace(/-/g, ' ')}" complete — weaknesses exposed in sandbox. Organization decides resolution.`
        : 'Red Team challenge queued — adversarial probe running in sandbox.',
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  if (/critical.*weakness|security|permission loophole|infinite loop/i.test(trimmed)) {
    const critical = profile.findings.filter((f) => f.severity === 'critical' && f.status !== 'mitigated');
    if (critical.length === 0) {
      return { response: 'No critical Red Team findings open — continuous adversarial probing active.', concierge: 'Chief Concierge' };
    }
    return {
      response: critical.map((f) => `${f.issue.slice(0, 80)} → ${f.suggestedResolution.slice(0, 60)}`).join(' · '),
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  if (/full stress|stress test all|probe everything/i.test(trimmed)) {
    runFullRedTeamStressTest(organizationId);
    return {
      response: `Full Red Team stress test complete — ${profile.openFindings} weaknesses exposed across ${profile.exposureMetrics.length} targets.`,
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  const explainMatch = trimmed.match(/explain (?:finding|weakness) (.+)/i);
  if (explainMatch) {
    const hits = queryAiRedTeam(explainMatch[1], profile, 1);
    if (hits[0]) {
      return { response: explainRedTeamFinding(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryAiRedTeam(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  return null;
}

export function buildProactiveAiRedTeamSuggestion(organizationId: string): string | null {
  const profile = getOrganizationAiRedTeamProfile(organizationId);
  if (!profile) return null;
  return summarizeAiRedTeam(profile);
}

export function buildAiRedTeamOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationAiRedTeamProfile(organizationId);
  return profile.dockRedTeamLine;
}
