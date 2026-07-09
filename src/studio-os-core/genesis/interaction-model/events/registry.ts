import { readInteractionModelStore } from '../persistence';
import type { EventCategoryId } from '../constants';
import type { StudioEvent } from '../types';
import { EVENT_CATEGORIES } from '../constants';

/** Event Registry™ */
export function listEventRegistry(): StudioEvent[] {
  return readInteractionModelStore().events;
}

export function getStudioEvent(eventId: string): StudioEvent | undefined {
  return readInteractionModelStore().events.find((e) => e.eventId === eventId);
}

export function listEventsByCategory(category: EventCategoryId): StudioEvent[] {
  return listEventRegistry().filter((e) => e.category === category);
}

export function listEventsForObject(objectId: string): StudioEvent[] {
  return listEventRegistry().filter(
    (e) =>
      e.sourceObjectId === objectId ||
      e.actorObjectId === objectId ||
      e.affectedObjectIds.includes(objectId)
  );
}

export function listEventsByInteraction(interactionId: string): StudioEvent[] {
  return listEventRegistry().filter((e) => e.interactionId === interactionId);
}

export function listEventsByCorrelation(correlationId: string): StudioEvent[] {
  return listEventRegistry().filter((e) => e.correlationId === correlationId);
}

export function getEventCategoryCoverage(): { category: string; count: number }[] {
  return EVENT_CATEGORIES.map((category) => ({
    category,
    count: listEventsByCategory(category).length,
  }));
}

export function searchEventRegistry(query: string, limit = 20): StudioEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return listEventRegistry().slice(0, limit);

  return listEventRegistry()
    .map((event) => {
      let score = 0;
      if (event.eventId.toLowerCase().includes(q)) score += 6;
      if (event.officialName.toLowerCase().includes(q)) score += 5;
      if (event.eventType.toLowerCase().includes(q)) score += 4;
      if (event.category.toLowerCase().includes(q)) score += 2;
      return { event, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ event }) => event);
}
