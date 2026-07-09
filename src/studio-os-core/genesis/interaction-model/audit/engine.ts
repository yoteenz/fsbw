import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import type { AuditLevel, InteractionVisibility } from '../constants';
import type { StudioAuditEntry } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createAuditId(): string {
  return `AUD-${Date.now().toString(36)}`;
}

/** Audit Engine™ — durable interaction and event audit trail */
export function recordAuditEntry(input: {
  interactionId?: string;
  eventId?: string;
  level: AuditLevel;
  action: string;
  actorObjectId?: string;
  subjectObjectIds?: string[];
  visibility?: InteractionVisibility;
  details?: Record<string, unknown>;
}): StudioAuditEntry {
  const entry: StudioAuditEntry = {
    auditId: createAuditId(),
    interactionId: input.interactionId,
    eventId: input.eventId,
    level: input.level,
    action: input.action,
    actorObjectId: input.actorObjectId,
    subjectObjectIds: input.subjectObjectIds ?? [],
    visibility: input.visibility ?? 'participant-visible',
    details: input.details ?? {},
    createdAt: now(),
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    auditLog: [...store.auditLog, entry],
  }));

  return entry;
}

export function listAuditLog(filter?: {
  interactionId?: string;
  eventId?: string;
  actorObjectId?: string;
  level?: AuditLevel;
}): StudioAuditEntry[] {
  let entries = readInteractionModelStore().auditLog;
  if (filter?.interactionId) {
    entries = entries.filter((e) => e.interactionId === filter.interactionId);
  }
  if (filter?.eventId) entries = entries.filter((e) => e.eventId === filter.eventId);
  if (filter?.actorObjectId) {
    entries = entries.filter((e) => e.actorObjectId === filter.actorObjectId);
  }
  if (filter?.level) entries = entries.filter((e) => e.level === filter.level);
  return entries;
}

export function getAuditTrailForInteraction(interactionId: string): StudioAuditEntry[] {
  return listAuditLog({ interactionId });
}

export function getAuditTrailForCorrelation(correlationId: string): StudioAuditEntry[] {
  const store = readInteractionModelStore();
  const interactionIds = store.interactions
    .filter((i) => i.correlationId === correlationId)
    .map((i) => i.interactionId);
  const eventIds = store.events.filter((e) => e.correlationId === correlationId).map((e) => e.eventId);

  return store.auditLog.filter(
    (e) =>
      (e.interactionId && interactionIds.includes(e.interactionId)) ||
      (e.eventId && eventIds.includes(e.eventId))
  );
}

export function getAuditEngineStats() {
  const log = readInteractionModelStore().auditLog;
  return {
    totalEntries: log.length,
    byLevel: log.reduce<Record<string, number>>((acc, e) => {
      acc[e.level] = (acc[e.level] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
