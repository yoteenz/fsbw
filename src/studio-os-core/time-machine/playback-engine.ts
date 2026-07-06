import type { MomentComparison, OrganizationTimeMachineProfile, ReplayEvent, TimelineFilter } from './types';

export function buildDockTimeMachineLine(profile: OrganizationTimeMachineProfile): string {
  return `Time Machine™ ${profile.replayScore}% reconstruction · ${profile.totalReplayableEvents} replayable events · ${RECONSTRUCTION_LAYERS_COUNT} layers per event · understand WHY, not just what.`;
}

const RECONSTRUCTION_LAYERS_COUNT = 11;

export function buildDefaultFilter(): TimelineFilter {
  return { eventType: 'all', dateFrom: null, dateTo: null, layer: 'all' };
}

export function buildMomentComparison(events: ReplayEvent[]): MomentComparison | null {
  if (events.length < 2) return null;
  const a = events[0];
  const b = events[1];
  return {
    momentA: { label: a.title, timestamp: a.occurredAt, summary: a.commentary.whatHappened },
    momentB: { label: b.title, timestamp: b.occurredAt, summary: b.commentary.whatHappened },
    differences: [
      `Duration: ${a.durationMinutes} min vs ${b.durationMinutes} min`,
      `Steps: ${a.stepCount} vs ${b.stepCount}`,
      `Event type: ${a.eventLabel} vs ${b.eventLabel}`,
      a.commentary.whyItHappened !== b.commentary.whyItHappened
        ? 'Different root causes — compare automation chains'
        : 'Similar workflow patterns — compare permissions context',
    ],
  };
}

export function filterReplayEvents(events: ReplayEvent[], filter: TimelineFilter): ReplayEvent[] {
  return events.filter((e) => {
    if (filter.eventType !== 'all' && e.eventType !== filter.eventType) return false;
    if (filter.dateFrom && e.occurredAt < filter.dateFrom) return false;
    if (filter.dateTo && e.occurredAt > filter.dateTo) return false;
    if (filter.layer !== 'all') {
      const hasLayer = e.reconstructedLayers.some((l) => l.layer === filter.layer);
      if (!hasLayer) return false;
    }
    return true;
  });
}

export function getStepAtIndex(event: ReplayEvent, stepIndex: number): ReplayEvent['steps'][0] | null {
  return event.steps[stepIndex] ?? null;
}

export function summarizeTimeMachine(profile: OrganizationTimeMachineProfile): string {
  return `${profile.dockTimeMachineLine} Experience events exactly as they occurred.`;
}
