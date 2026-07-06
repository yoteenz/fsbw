import type { EventTypeDefinition } from './types';
import { buildEventTypeCatalog, getEventTypeDefinition } from './event-catalog';

const customTypes: EventTypeDefinition[] = [];

export function registerEventType(entry: EventTypeDefinition): EventTypeDefinition {
  const idx = customTypes.findIndex((e) => e.eventTypeId === entry.eventTypeId);
  if (idx >= 0) customTypes[idx] = entry;
  else customTypes.push(entry);
  return entry;
}

export function getAllEventTypes(): EventTypeDefinition[] {
  const byId = new Map(buildEventTypeCatalog().map((e) => [e.eventTypeId, e]));
  for (const custom of customTypes) {
    byId.set(custom.eventTypeId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredEventType(eventTypeId: string): EventTypeDefinition | undefined {
  return getAllEventTypes().find((e) => e.eventTypeId === eventTypeId) ?? getEventTypeDefinition(eventTypeId);
}
