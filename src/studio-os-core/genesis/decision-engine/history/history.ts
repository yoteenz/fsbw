import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import type { DecisionStatus } from '../constants';
import type { StudioDecisionHistoryEntry } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createHistoryId(): string {
  return `DHST-${Date.now().toString(36)}`;
}

/** Decision History™ — lifecycle and outcome archive */
export function recordDecisionHistory(input: {
  decisionId: string;
  status: DecisionStatus;
  summary: string;
  actorObjectId?: string;
}): StudioDecisionHistoryEntry {
  const entry: StudioDecisionHistoryEntry = {
    historyId: createHistoryId(),
    decisionId: input.decisionId,
    status: input.status,
    summary: input.summary.trim(),
    actorObjectId: input.actorObjectId,
    recordedAt: now(),
  };

  mutateDecisionEngineStore((store) => ({
    ...store,
    history: [...store.history, entry],
  }));

  return entry;
}

export function listDecisionHistory(decisionId?: string): StudioDecisionHistoryEntry[] {
  const history = readDecisionEngineStore().history;
  return decisionId ? history.filter((h) => h.decisionId === decisionId) : history;
}

export function getDecisionTimeline(decisionId: string): StudioDecisionHistoryEntry[] {
  return listDecisionHistory(decisionId).sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
}

export function listSupersededDecisions(): string[] {
  return readDecisionEngineStore()
    .decisions.filter((d) => d.status === 'superseded')
    .map((d) => d.decisionId);
}

export function archiveDecisionOutcome(
  decisionId: string,
  outcome: string,
  actorObjectId?: string
): StudioDecisionHistoryEntry {
  return recordDecisionHistory({
    decisionId,
    status: 'executed',
    summary: `Outcome: ${outcome}`,
    actorObjectId,
  });
}
