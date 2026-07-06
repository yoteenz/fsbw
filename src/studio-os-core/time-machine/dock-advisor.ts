import { explainReplayEvent, queryTimeMachine } from './discovery-engine';
import { summarizeTimeMachine } from './playback-engine';
import {
  ensureOrganizationTimeMachineProfile,
  getOrganizationTimeMachineProfile,
  selectReplayEvent,
  stepForward,
} from './store';
import type { TimeMachineDockAdvice } from './types';

export function resolveTimeMachineAdvice(input: string, organizationId: string): TimeMachineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationTimeMachineProfile(organizationId) ?? ensureOrganizationTimeMachineProfile(organizationId);

  if (/time machine|organizational replay|replay event|what happened|why did it happen|experience.*occurred/i.test(trimmed)) {
    return {
      response: summarizeTimeMachine(profile),
      concierge: 'Chief Concierge',
      replayScore: profile.replayScore,
    };
  }

  if (/replay purchase|replay booking|replay automation|replay security/i.test(trimmed)) {
    const match = profile.replayEvents.find((e) => trimmed.toLowerCase().includes(e.eventType.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      selectReplayEvent(organizationId, match.id);
      return {
        response: `Replaying "${match.title}" — ${match.commentary.whatHappened} Why: ${match.commentary.whyItHappened.slice(0, 100)}…`,
        concierge: 'Chief Concierge',
        replayScore: profile.replayScore,
      };
    }
  }

  if (/step forward|next step|continue replay/i.test(trimmed)) {
    stepForward(organizationId);
    return { response: 'Advanced one step in replay — Studio Intelligence commentary updated.', concierge: 'Chief Concierge' };
  }

  const explainMatch = trimmed.match(/explain (?:event|replay) (.+)/i);
  if (explainMatch) {
    const hits = queryTimeMachine(explainMatch[1], profile, 1);
    if (hits[0]) {
      return { response: explainReplayEvent(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryTimeMachine(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      replayScore: profile.replayScore,
    };
  }

  return null;
}

export function buildProactiveTimeMachineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationTimeMachineProfile(organizationId);
  if (!profile) return null;
  return summarizeTimeMachine(profile);
}

export function buildTimeMachineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationTimeMachineProfile(organizationId);
  return profile.dockTimeMachineLine;
}
