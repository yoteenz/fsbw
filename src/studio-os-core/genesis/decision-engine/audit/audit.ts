import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import type { DecisionAuditLevel, DecisionVisibility } from '../constants';
import type { DecisionAuditRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createAuditId(): string {
  return `DAU-${Date.now().toString(36)}`;
}

/** Decision Audit™ — durable audit trail for decisions */
export function recordDecisionAudit(input: {
  decisionId?: string;
  level: DecisionAuditLevel;
  action: string;
  actorObjectId?: string;
  visibility?: DecisionVisibility;
  notes?: string;
  details?: Record<string, unknown>;
}): DecisionAuditRecord {
  const entry: DecisionAuditRecord = {
    auditId: createAuditId(),
    level: input.level,
    action: input.action,
    actorObjectId: input.actorObjectId,
    notes: input.notes,
    createdAt: now(),
  };

  mutateDecisionEngineStore((store) => ({
    ...store,
    auditLog: [...store.auditLog, entry],
  }));

  if (input.decisionId) {
    mutateDecisionEngineStore((store) => {
      const idx = store.decisions.findIndex((d) => d.decisionId === input.decisionId);
      if (idx < 0) return store;

      const decision = store.decisions[idx];
      const updated = {
        ...decision,
        auditHistory: [...decision.auditHistory, entry],
        updatedAt: now(),
      };

      const decisions = [...store.decisions];
      decisions[idx] = updated;
      return { ...store, decisions };
    });
  }

  return entry;
}

export function listDecisionAuditLog(filter?: {
  decisionId?: string;
  actorObjectId?: string;
  level?: DecisionAuditLevel;
}): DecisionAuditRecord[] {
  let entries = readDecisionEngineStore().auditLog;
  if (filter?.actorObjectId) {
    entries = entries.filter((e) => e.actorObjectId === filter.actorObjectId);
  }
  if (filter?.level) entries = entries.filter((e) => e.level === filter.level);

  if (filter?.decisionId) {
    const decision = readDecisionEngineStore().decisions.find(
      (d) => d.decisionId === filter.decisionId
    );
    return decision?.auditHistory ?? [];
  }

  return entries;
}

export function getDecisionAuditTrail(decisionId: string): DecisionAuditRecord[] {
  const decision = readDecisionEngineStore().decisions.find((d) => d.decisionId === decisionId);
  return decision?.auditHistory ?? [];
}

export function getDecisionAuditStats() {
  const log = readDecisionEngineStore().auditLog;
  return {
    totalEntries: log.length,
    byLevel: log.reduce<Record<string, number>>((acc, e) => {
      acc[e.level] = (acc[e.level] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
