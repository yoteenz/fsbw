import type { OrganizationTimeMachineProfile } from './types';

export function queryTimeMachine(query: string, profile: OrganizationTimeMachineProfile, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const e of profile.replayEvents) {
    const hay = `${e.title} ${e.eventLabel} ${e.commentary.whatHappened} ${e.commentary.whyItHappened}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'event' as const,
        id: e.id,
        label: e.title,
        score: e.stepCount * 20,
        matchReason: `${e.eventLabel} · ${e.stepCount} steps · ${new Date(e.occurredAt).toLocaleDateString()}`,
      });
    }
  }

  return hits.slice(0, limit);
}

export function explainReplayEvent(eventId: string, profile: OrganizationTimeMachineProfile): string | null {
  const e = profile.replayEvents.find((x) => x.id === eventId);
  if (!e) return null;
  const c = e.commentary;
  return `${e.title}: ${c.whatHappened} Why: ${c.whyItHappened}`;
}
