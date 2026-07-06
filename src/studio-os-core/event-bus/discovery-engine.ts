import { getAllEventTypes } from './registration';
import type { EventSearchHit } from './types';

/** Search event types by name, domain, verb, publisher, or subscriber. */
export function queryEventTypes(query: string, limit = 12): EventSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const types = getAllEventTypes();
  const hits: EventSearchHit[] = [];

  for (const entry of types) {
    const blob = `${entry.name} ${entry.eventTypeId} ${entry.domain} ${entry.verb} ${entry.description} ${entry.publishers.join(' ')} ${entry.subscribers.join(' ')}`.toLowerCase();
    let score = 0;
    let reason = 'keyword';
    for (const term of terms) {
      if (entry.eventTypeId.includes(term)) score += 12;
      if (entry.domain.includes(term)) {
        score += 10;
        reason = 'domain';
      }
      if (entry.verb.includes(term)) {
        score += 9;
        reason = 'verb';
      }
      if (entry.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry, score, matchReason: reason });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainEventType(eventTypeId: string): string | null {
  const entry = getAllEventTypes().find((e) => e.eventTypeId === eventTypeId);
  if (!entry) return null;
  return `${entry.name} (${entry.verb}/${entry.domain}) — ${entry.description} Publishers: ${entry.publishers.join(', ') || 'platform'}. Subscribers: ${entry.subscribers.slice(0, 4).join(', ') || 'none'}.`;
}
