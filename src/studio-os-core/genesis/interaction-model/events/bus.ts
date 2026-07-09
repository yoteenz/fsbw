import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import { recordAuditEntry } from '../audit/engine';
import type { AuditLevel, EventCategoryId, InteractionVisibility } from '../constants';
import type { StudioEvent } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createEventId(eventType: string): string {
  const token = eventType.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  return `EVT-${token}-${Date.now().toString(36)}`;
}

export type EmitStudioEventInput = {
  officialName: string;
  eventType: string;
  category: EventCategoryId;
  sourceObjectId: string;
  actorObjectId: string;
  affectedObjectIds?: string[];
  interactionId?: string;
  payload?: Record<string, unknown>;
  visibility?: InteractionVisibility;
  auditLevel?: AuditLevel;
  correlationId?: string;
  causationId?: string;
};

/** Event Bus™ — emit observable, traceable events */
export function emitStudioEvent(input: EmitStudioEventInput): StudioEvent {
  const event: StudioEvent = {
    eventId: createEventId(input.eventType),
    officialName: input.officialName.trim(),
    eventType: input.eventType.trim(),
    category: input.category,
    occurredAt: now(),
    sourceObjectId: input.sourceObjectId,
    actorObjectId: input.actorObjectId,
    affectedObjectIds: input.affectedObjectIds ?? [],
    interactionId: input.interactionId,
    payload: input.payload ?? {},
    visibility: input.visibility ?? 'participant-visible',
    auditLevel: input.auditLevel ?? 'event',
    correlationId: input.correlationId,
    causationId: input.causationId,
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    events: [...store.events, event],
  }));

  recordAuditEntry({
    eventId: event.eventId,
    interactionId: event.interactionId,
    level: event.auditLevel,
    action: `event.${event.eventType}`,
    actorObjectId: event.actorObjectId,
    subjectObjectIds: event.affectedObjectIds,
    visibility: event.visibility,
    details: { category: event.category, officialName: event.officialName },
  });

  return event;
}

export function listRecentStudioEvents(limit = 50): StudioEvent[] {
  return [...readInteractionModelStore().events]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}

export function getStudioEventBusStats() {
  const events = readInteractionModelStore().events;
  return {
    totalEvents: events.length,
    byCategory: events.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
