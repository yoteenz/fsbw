import type { BusinessEvent } from '../business-types';

export function listBusinessEvents(events: BusinessEvent[]): BusinessEvent[] {
  return [...events].sort((a, b) => a.name.localeCompare(b.name));
}

export function getBusinessEvent(events: BusinessEvent[], eventId: string): BusinessEvent | null {
  return events.find((e) => e.eventId === eventId) ?? null;
}

export function getEventsProducedBy(events: BusinessEvent[], systemId: string): BusinessEvent[] {
  return events.filter((e) => e.producerSystemId === systemId);
}

export function getEventsConsumedBy(events: BusinessEvent[], systemId: string): BusinessEvent[] {
  return events.filter((e) => e.consumerSystemIds.includes(systemId));
}

export function getEventsByCategory(events: BusinessEvent[], category: string): BusinessEvent[] {
  return events.filter((e) => e.category === category);
}
