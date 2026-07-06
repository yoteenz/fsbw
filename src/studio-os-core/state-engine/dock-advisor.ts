import { explainLifecycleState, explainTransition, queryStateEngine } from './discovery-engine';
import { summarizeStateEngine } from './engine-profile-builder';
import { filterHistoryByState } from './history-engine';
import {
  ensureOrganizationStateEngineProfile,
  getOrganizationStateEngineProfile,
} from './store';
import type { StateEngineDockAdvice } from './types';

export function resolveStateEngineAdvice(input: string, organizationId: string): StateEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationStateEngineProfile(organizationId) ??
    ensureOrganizationStateEngineProfile(organizationId);

  if (/state engine|lifecycle management|predictable lifecycle|consistency creates trust/i.test(trimmed)) {
    return {
      response: summarizeStateEngine(profile),
      concierge: 'Chief Concierge',
      consistencyScore: profile.consistencyScore,
    };
  }

  if (/waiting for approval|everything waiting|show.*approval|awaiting approval/i.test(trimmed)) {
    const waiting = filterHistoryByState(profile.historyRecords, 'review');
    const names = waiting.slice(0, 4).map((r) => r.objectName);
    return {
      response:
        profile.objectsAwaitingApproval === 0
          ? 'No objects currently waiting for approval.'
          : `${profile.objectsAwaitingApproval} awaiting approval: ${names.join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/paused|what projects.*paused|currently paused/i.test(trimmed)) {
    const paused = filterHistoryByState(profile.historyRecords, 'paused');
    const names = paused.map((r) => r.objectName);
    return {
      response:
        profile.pausedObjectCount === 0
          ? 'No objects currently paused.'
          : `${profile.pausedObjectCount} paused: ${names.join(' · ') || 'projects and plugins'}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/archive completed|completed campaigns|archive.*campaigns/i.test(trimmed)) {
    const completed = filterHistoryByState(profile.historyRecords, 'completed');
    return {
      response:
        completed.length === 0
          ? 'No completed objects pending archive — run Archive transition on completed campaigns and projects.'
          : `${completed.length} completed — ready for Draft → Review → Approved → Published → Archived path.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/failed today|workflows failed|which workflows failed/i.test(trimmed)) {
    const failed = filterHistoryByState(profile.historyRecords, 'failed');
    const names = failed.map((r) => r.objectName);
    return {
      response:
        profile.failedTodayCount === 0
          ? 'No workflow failures recorded today.'
          : `${profile.failedTodayCount} failed today: ${names.join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/transition|draft.*review.*approved|state history|lifecycle/i.test(trimmed)) {
    const path = profile.transitionRules.slice(0, 4).map((t) => `${t.from}→${t.to}`);
    return {
      response: `Canonical path: Draft → Review → Approved → Published → Archived. Rules: ${path.join(' · ')}… Policy enforced on every transition.`,
      concierge: 'Chief Concierge',
      consistencyScore: profile.consistencyScore,
    };
  }

  if (/undefined|defined state|nothing undefined/i.test(trimmed)) {
    return {
      response: `${profile.lifecycleCoveragePct}% lifecycle coverage — every object has a defined state. Undefined conditions blocked.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainStateMatch = trimmed.match(/explain (?:state|lifecycle)\s+(.+)/i);
  if (explainStateMatch) {
    const hits = queryStateEngine(explainStateMatch[1], organizationId, 1);
    if (hits[0]?.type === 'state') {
      return { response: explainLifecycleState(hits[0].id) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const explainTransMatch = trimmed.match(/explain transition\s+(.+)/i);
  if (explainTransMatch) {
    return {
      response: explainTransition(explainTransMatch[1].trim().replace(/\s+/g, '-')) ?? 'Transition not found.',
      concierge: 'Chief Concierge',
    };
  }

  const hits = queryStateEngine(trimmed, organizationId, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => h.label).join(' · '),
      concierge: 'Chief Concierge',
      consistencyScore: profile.consistencyScore,
    };
  }

  return null;
}

export function listStateEngineDockSuggestions(_organizationId: string): string[] {
  return [
    'Show everything waiting for approval.',
    'What projects are currently paused?',
    'Archive completed campaigns.',
    'Which workflows failed today?',
  ].slice(0, 4);
}

export function buildProactiveStateEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationStateEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeStateEngine(profile);
}

export function buildStateEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationStateEngineProfile(organizationId);
  return profile.dockConsistencyLine;
}
