import { buildEventTypeCatalog } from './event-catalog';
import { EVENT_LATENCY_BASELINE_MS } from './constants';
import type { EventSubscription } from './types';

/** Subscription registry — which systems react to which events (loosely coupled). */
export function buildSubscriptionRegistry(): EventSubscription[] {
  const subs: EventSubscription[] = [];
  let idx = 0;

  for (const eventType of buildEventTypeCatalog()) {
    for (const subscriber of eventType.subscribers) {
      subs.push({
        subscriptionId: `sub-${++idx}`,
        subscriberSystem: subscriber,
        eventTypeId: eventType.eventTypeId,
        reaction: describeReaction(subscriber, eventType.verb),
        latencyMs: EVENT_LATENCY_BASELINE_MS + (idx % 7) * 3,
        enabled: true,
      });
    }
  }

  return subs;
}

function describeReaction(systemId: string, verb: string): string {
  const reactions: Record<string, string> = {
    'executive-timeline': `Append ${verb} milestone to organizational timeline`,
    'memory-engine': `Record ${verb} event in organizational memory`,
    'organization-pulse': `Update pulse indicators after ${verb}`,
    'documentation-registry': `Sync documentation metadata on ${verb}`,
    'command-dock': `Surface proactive briefing for ${verb}`,
    notifications: `Deliver notification for ${verb}`,
    'automation-registry': `Queue automation workflow on ${verb}`,
    analytics: `Record analytics metric for ${verb}`,
    search: `Re-index searchable entities after ${verb}`,
    'design-token-engine': `Validate token bindings on ${verb}`,
    'interaction-engine': `Audit interaction compliance on ${verb}`,
    'system-registry': `Register system object on ${verb}`,
    'legacy-vault': `Archive historical record on ${verb}`,
    'event-bus': `Persist event history and update inspector metrics`,
  };
  return reactions[systemId] ?? `React to ${verb} event`;
}

export function getSubscriptionsForEvent(eventTypeId: string): EventSubscription[] {
  return buildSubscriptionRegistry().filter((s) => s.eventTypeId === eventTypeId && s.enabled);
}

export function getSubscriptionsForSystem(systemId: string): EventSubscription[] {
  return buildSubscriptionRegistry().filter((s) => s.subscriberSystem === systemId && s.enabled);
}
