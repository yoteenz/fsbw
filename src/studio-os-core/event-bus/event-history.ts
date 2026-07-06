import { EVENT_HISTORY_MAX_ENTRIES, EVENT_LATENCY_BASELINE_MS } from './constants';
import { getEventTypeDefinition } from './event-catalog';
import { getChainForEvent } from './chain-builder';
import { getSubscriptionsForEvent } from './subscription-registry';
import type { EventHistoryEntry, PublishEventInput } from './types';

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Seed demo event history for Event Inspector and auditing. */
export function buildSeedEventHistory(): EventHistoryEntry[] {
  const now = Date.now();
  const seeds: PublishEventInput[] = [
    { eventTypeId: 'customer.created', publisher: 'Knowledge Commerce', payloadSummary: 'customerId: cust-1042 · Acme Studio' },
    { eventTypeId: 'module.registered', publisher: 'system-registry', payloadSummary: 'moduleId: interaction-engine · M130' },
    { eventTypeId: 'documentation.published', publisher: 'documentation-registry', payloadSummary: 'systemId: event-bus · docs/studio-os/event-bus.md' },
    { eventTypeId: 'component.registered', publisher: 'component-registry', payloadSummary: 'componentId: EventBusWorkspace · panel' },
    { eventTypeId: 'memory.recorded', publisher: 'memory-engine', payloadSummary: 'memoryId: mem-8821 · M129 design tokens' },
    { eventTypeId: 'command.routed', publisher: 'command-dock', payloadSummary: 'command: Show Design Token Engine status' },
    { eventTypeId: 'workflow.approved', publisher: 'autonomous-preparation', payloadSummary: 'workflowId: prep-exec-brief · approved by founder' },
    { eventTypeId: 'pulse.alert', publisher: 'organization-pulse', payloadSummary: 'indicator: documentation · state: needs-attention' },
    { eventTypeId: 'search.indexed', publisher: 'documentation-sync', payloadSummary: 'entityType: system · event-bus' },
    { eventTypeId: 'timeline.milestone', publisher: 'executive-timeline', payloadSummary: 'milestoneId: ms-130 · Interaction Engine shipped' },
  ];

  return seeds.map((seed, i) => {
    const def = getEventTypeDefinition(seed.eventTypeId);
    const subs = getSubscriptionsForEvent(seed.eventTypeId);
    const chain = getChainForEvent(seed.eventTypeId);
    const latencyMs = EVENT_LATENCY_BASELINE_MS + (i % 5) * 4;

    return {
      eventId: `seed-${i + 1}`,
      eventTypeId: seed.eventTypeId,
      name: def?.name ?? seed.eventTypeId,
      verb: def?.verb ?? 'created',
      domain: def?.domain ?? 'system',
      publishedAt: new Date(now - (seeds.length - i) * 3600000).toISOString(),
      publisher: seed.publisher,
      payloadSummary: seed.payloadSummary ?? '',
      status: i === 7 ? 'partial' : 'delivered',
      latencyMs,
      subscriberCount: subs.length,
      chainId: chain?.chainId,
      replayable: true,
    } satisfies EventHistoryEntry;
  });
}

export function createHistoryEntryFromPublish(input: PublishEventInput): EventHistoryEntry {
  const def = getEventTypeDefinition(input.eventTypeId);
  const subs = getSubscriptionsForEvent(input.eventTypeId);
  const chain = getChainForEvent(input.eventTypeId);

  return {
    eventId: generateEventId(),
    eventTypeId: input.eventTypeId,
    name: def?.name ?? input.eventTypeId,
    verb: def?.verb ?? 'created',
    domain: def?.domain ?? 'system',
    publishedAt: new Date().toISOString(),
    publisher: input.publisher,
    payloadSummary: input.payloadSummary ?? JSON.stringify(input.payload ?? {}).slice(0, 120),
    status: subs.length > 0 ? 'delivered' : 'partial',
    latencyMs: EVENT_LATENCY_BASELINE_MS + subs.length * 2,
    subscriberCount: subs.length,
    chainId: chain?.chainId,
    replayable: true,
  };
}

export function appendEventHistory(
  history: EventHistoryEntry[],
  entry: EventHistoryEntry
): EventHistoryEntry[] {
  return [entry, ...history].slice(0, EVENT_HISTORY_MAX_ENTRIES);
}

export function replayEventEntry(entry: EventHistoryEntry): EventHistoryEntry {
  return {
    ...createHistoryEntryFromPublish({
      eventTypeId: entry.eventTypeId,
      publisher: 'event-bus-replay',
      payloadSummary: `REPLAY of ${entry.eventId} · ${entry.payloadSummary}`,
    }),
    eventId: generateEventId(),
    status: 'delivered',
    latencyMs: entry.latencyMs,
  };
}

export function filterEventHistory(
  history: EventHistoryEntry[],
  filter: { domain?: string; verb?: string; status?: string; query?: string }
): EventHistoryEntry[] {
  return history.filter((e) => {
    if (filter.domain && e.domain !== filter.domain) return false;
    if (filter.verb && e.verb !== filter.verb) return false;
    if (filter.status && e.status !== filter.status) return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      const blob = `${e.name} ${e.eventTypeId} ${e.publisher} ${e.payloadSummary}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });
}
