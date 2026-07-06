import { RED_TEAM_CHALLENGE_QUERIES, RED_TEAM_CHALLENGES } from './constants';
import type { RedTeamChallengeRun } from './types';

const CHALLENGE_LABELS: Record<(typeof RED_TEAM_CHALLENGES)[number], string> = {
  'customer-skips-step': 'Customer Skips Step',
  'incomplete-upload': 'Incomplete Upload',
  'simultaneous-automations': 'Simultaneous Automations',
  'conflicting-brain-advice': 'Conflicting Brain Advice',
  'integration-unavailable': 'Integration Unavailable',
};

const CHALLENGE_SUMMARIES: Record<(typeof RED_TEAM_CHALLENGES)[number], string> = {
  'customer-skips-step': 'Red Team bypassed optional onboarding step — downstream workflow entered undefined state.',
  'incomplete-upload': 'Partial upload accepted — processing pipeline failed silently without user feedback.',
  'simultaneous-automations': 'Two automations fired on same event — duplicate actions and state conflict detected.',
  'conflicting-brain-advice': 'Overlapping brain domains produced contradictory guidance — trust boundary violated.',
  'integration-unavailable': 'Integration disconnect simulated — cascading failures in 3 dependent workflows.',
};

export function buildRecentChallenges(now: string): RedTeamChallengeRun[] {
  const iso = (offsetHours: number) => new Date(Date.parse(now) - offsetHours * 3600000).toISOString();

  return RED_TEAM_CHALLENGES.map((challengeId, idx) => ({
    id: `rt-challenge-${idx + 1}`,
    challengeId,
    challengeLabel: CHALLENGE_LABELS[challengeId],
    query: RED_TEAM_CHALLENGE_QUERIES[idx] ?? RED_TEAM_CHALLENGE_QUERIES[0],
    startedAt: iso(idx * 3 + 1),
    completedAt: iso(idx * 3),
    findingsProduced: idx % 3 === 0 ? 2 : 1,
    summary: CHALLENGE_SUMMARIES[challengeId],
  }));
}

export function parseChallengeQuery(query: string): (typeof RED_TEAM_CHALLENGES)[number] | null {
  const lower = query.toLowerCase();
  if (/skip.*step|customer.*skip|bypass.*step/i.test(lower)) return 'customer-skips-step';
  if (/incomplete|partial.*upload|missing.*data/i.test(lower)) return 'incomplete-upload';
  if (/two automation|simultaneous|same time|trigger.*together/i.test(lower)) return 'simultaneous-automations';
  if (/conflict.*brain|contradict.*advice|conflicting.*profession/i.test(lower)) return 'conflicting-brain-advice';
  if (/integration.*unavailable|disconnect|becomes unavailable/i.test(lower)) return 'integration-unavailable';
  return null;
}

export function summarizeChallenge(challengeId: (typeof RED_TEAM_CHALLENGES)[number]): string {
  return CHALLENGE_SUMMARIES[challengeId];
}

export { CHALLENGE_LABELS, RED_TEAM_CHALLENGE_QUERIES };
