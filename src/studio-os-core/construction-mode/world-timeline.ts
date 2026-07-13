export const WORLD_TIMELINE_VERSION = 'world-timeline.v1';

export type WorldTimelineEventType =
  | 'blueprint-approved'
  | 'construction-mode-opened'
  | 'founder-approved'
  | 'manufacturing-started'
  | 'architecture-complete'
  | 'asset-installed'
  | 'inspection-passed'
  | 'inspection-failed'
  | 'repair-scheduled'
  | 'lighting-complete'
  | 'world-activated';

export type WorldTimelineEvent = {
  eventId: string;
  eventType: WorldTimelineEventType;
  label: string;
  timestamp: string;
  assetId: string | null;
  detail: string;
};

export type WorldTimeline = {
  timelineVersion: typeof WORLD_TIMELINE_VERSION;
  planId: string;
  events: WorldTimelineEvent[];
  replayable: true;
};

export function initWorldTimeline(planId: string): WorldTimeline {
  return {
    timelineVersion: WORLD_TIMELINE_VERSION,
    planId,
    events: [],
    replayable: true,
  };
}

export function appendTimelineEvent(
  timeline: WorldTimeline,
  event: Omit<WorldTimelineEvent, 'eventId' | 'timestamp'> & { timestamp?: string }
): WorldTimeline {
  const entry: WorldTimelineEvent = {
    eventId: `evt-${timeline.events.length + 1}`,
    timestamp: event.timestamp ?? new Date().toISOString(),
    eventType: event.eventType,
    label: event.label,
    assetId: event.assetId,
    detail: event.detail,
  };
  return {
    ...timeline,
    events: [...timeline.events, entry],
  };
}
