import {
  LVS_ESCAPE_CLASSIFICATIONS,
  type LvsEscapeClassification,
  type LvsEscapeOutcome,
} from '../constants';
import { mutateLiveValidationSystemStore, readLiveValidationSystemStore } from '../persistence';
import type { LvsEscapeEvent, LvsEscapePattern } from '../types';

/** Escape Velocity Engine™ — meaningful work completed outside Studio OS */
export function listEscapeEvents(limit = 50): LvsEscapeEvent[] {
  return [...readLiveValidationSystemStore().escapeEvents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function listEscapePatterns(): LvsEscapePattern[] {
  return [...readLiveValidationSystemStore().escapePatterns].sort(
    (a, b) => b.escapeVelocityScore - a.escapeVelocityScore
  );
}

export function computePlatformEscapeVelocityScore(): number {
  const patterns = listEscapePatterns();
  if (patterns.length === 0) return 0;
  const total = patterns.reduce((sum, p) => sum + p.escapeVelocityScore, 0);
  return Math.round(total / patterns.length);
}

export function classifyEscapeOutcome(
  classification: LvsEscapeClassification
): LvsEscapeOutcome {
  const map: Record<LvsEscapeClassification, LvsEscapeOutcome> = {
    'missing-capability': 'replace',
    'poor-workflow': 'investigate',
    'low-trust': 'investigate',
    'knowledge-gap': 'replace',
    'integration-need': 'integrate',
    'intentional-boundary': 'accept-boundary',
    'creative-preference': 'integrate',
    'temporary-workaround': 'defer',
  };
  return map[classification];
}

export function detectEscapePatterns(events: LvsEscapeEvent[]): LvsEscapePattern[] {
  const groups = new Map<string, LvsEscapeEvent[]>();

  for (const event of events) {
    const key = `${event.systemId}:${event.destinationCategory}`;
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([key, groupEvents]) => {
    const [systemId, destinationCategory] = key.split(':');
    const classificationCounts = new Map<LvsEscapeClassification, number>();
    for (const e of groupEvents) {
      classificationCounts.set(
        e.classification,
        (classificationCounts.get(e.classification) ?? 0) + 1
      );
    }
    let dominant: LvsEscapeClassification = 'temporary-workaround';
    let max = 0;
    for (const c of LVS_ESCAPE_CLASSIFICATIONS) {
      const count = classificationCounts.get(c) ?? 0;
      if (count > max) {
        max = count;
        dominant = c;
      }
    }

    const frequency = groupEvents.length;
    const avgFriction =
      groupEvents.reduce((s, e) => s + e.frictionScore, 0) / groupEvents.length;
    const escapeVelocityScore = Math.min(
      100,
      Math.round(frequency * 12 + avgFriction * 0.4)
    );

    return {
      patternId: `escape-pattern-${key}`,
      destinationCategory,
      systemId,
      occurrenceCount: frequency,
      dominantClassification: dominant,
      recommendedOutcome: classifyEscapeOutcome(dominant),
      escapeVelocityScore,
      lastSeenAt: groupEvents[groupEvents.length - 1]?.createdAt ?? new Date().toISOString(),
    };
  });
}

export function logEscapeEvent(
  partial: Omit<LvsEscapeEvent, 'eventId' | 'frequency' | 'createdAt' | 'outcome'> & {
    outcome?: LvsEscapeOutcome;
  }
): LvsEscapeEvent {
  const existing = readLiveValidationSystemStore().escapeEvents.filter(
    (e) =>
      e.systemId === partial.systemId &&
      e.destinationCategory === partial.destinationCategory
  );

  const event: LvsEscapeEvent = {
    ...partial,
    eventId: `escape-${Date.now()}`,
    frequency: existing.length + 1,
    outcome: partial.outcome ?? classifyEscapeOutcome(partial.classification),
    createdAt: new Date().toISOString(),
  };

  mutateLiveValidationSystemStore((store) => {
    const escapeEvents = [...store.escapeEvents, event];
    return {
      ...store,
      escapeEvents,
      escapePatterns: detectEscapePatterns(escapeEvents),
    };
  });

  return event;
}
