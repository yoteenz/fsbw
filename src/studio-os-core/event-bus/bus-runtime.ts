import { STUDIO_OS_EVENT_BUS_UPDATED } from './constants';
import { createHistoryEntryFromPublish, replayEventEntry } from './event-history';
import { getEventTypeDefinition } from './event-catalog';
import { getSubscriptionsForEvent } from './subscription-registry';
import type { EventHistoryEntry, PublishEventInput } from './types';

type EventHandler = (entry: EventHistoryEntry) => void;

const handlers = new Map<string, Set<EventHandler>>();

/** Publish event to Event Bus™ — subscribers react asynchronously (loosely coupled). */
export function publishEvent(
  organizationId: string,
  input: PublishEventInput,
  existingHistory: EventHistoryEntry[] = []
): { entry: EventHistoryEntry; history: EventHistoryEntry[] } {
  const def = getEventTypeDefinition(input.eventTypeId);
  if (!def) {
    const fallback: EventHistoryEntry = {
      eventId: `evt-unknown-${Date.now()}`,
      eventTypeId: input.eventTypeId,
      name: input.eventTypeId,
      verb: 'created',
      domain: 'system',
      publishedAt: new Date().toISOString(),
      publisher: input.publisher,
      payloadSummary: input.payloadSummary ?? 'unknown event type',
      status: 'failed',
      latencyMs: 0,
      subscriberCount: 0,
      replayable: false,
    };
    return { entry: fallback, history: [fallback, ...existingHistory] };
  }

  const entry = createHistoryEntryFromPublish(input);
  const history = [entry, ...existingHistory];

  void organizationId;
  notifySubscribers(input.eventTypeId, entry);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(STUDIO_OS_EVENT_BUS_UPDATED, {
        detail: { eventTypeId: input.eventTypeId, eventId: entry.eventId },
      })
    );
  }

  return { entry, history };
}

function notifySubscribers(eventTypeId: string, entry: EventHistoryEntry): void {
  const subs = getSubscriptionsForEvent(eventTypeId);
  void subs;

  const typeHandlers = handlers.get(eventTypeId);
  if (typeHandlers) {
    for (const handler of typeHandlers) {
      try {
        handler(entry);
      } catch {
        /* subscriber failures isolated — bus continues */
      }
    }
  }

  const wildcard = handlers.get('*');
  if (wildcard) {
    for (const handler of wildcard) {
      try {
        handler(entry);
      } catch {
        /* isolated */
      }
    }
  }
}

/** Subscribe to event type — systems decide whether to respond. */
export function subscribeToEvent(eventTypeId: string, handler: EventHandler): () => void {
  if (!handlers.has(eventTypeId)) handlers.set(eventTypeId, new Set());
  handlers.get(eventTypeId)!.add(handler);
  return () => handlers.get(eventTypeId)?.delete(handler);
}

/** Replay historical event via Event Inspector. */
export function replayEvent(
  organizationId: string,
  entry: EventHistoryEntry,
  existingHistory: EventHistoryEntry[]
): { entry: EventHistoryEntry; history: EventHistoryEntry[] } {
  const replayed = replayEventEntry(entry);
  return publishEvent(
    organizationId,
    {
      eventTypeId: 'event-bus.replayed',
      publisher: 'event-bus-inspector',
      payloadSummary: `Replay ${entry.eventId} → ${entry.eventTypeId}`,
    },
    [replayed, ...existingHistory]
  );
}

export function getSubscriberCount(eventTypeId: string): number {
  return getSubscriptionsForEvent(eventTypeId).length;
}
