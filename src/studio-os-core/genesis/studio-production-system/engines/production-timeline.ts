import type { XpsTimelineEvent } from '../types';
import { XPS_PRODUCTION_STAGES, XPS_PRODUCTION_STAGE_LABELS, type XpsProductionStage } from '../constants';

/** Production Timeline™ — stage progression for a production package */
export function buildProductionTimeline(now = new Date().toISOString()): XpsTimelineEvent[] {
  const stages: XpsProductionStage[] = [...XPS_PRODUCTION_STAGES];
  return stages.map((stage, i) => ({
    eventId: `timeline-${stage}`,
    stage,
    label: XPS_PRODUCTION_STAGE_LABELS[stage],
    status: i === 0 ? 'active' : i < 2 ? 'upcoming' : 'upcoming',
    scheduledAt: i === 0 ? now : undefined,
  }));
}

export function advanceTimelineStage(
  timeline: XpsTimelineEvent[],
  currentStage: XpsProductionStage
): { timeline: XpsTimelineEvent[]; nextStage: XpsProductionStage } {
  const idx = timeline.findIndex((t) => t.stage === currentStage);
  const nextIdx = Math.min(idx + 1, timeline.length - 1);
  const nextStage = timeline[nextIdx]?.stage ?? currentStage;
  const updated = timeline.map((t, i) => ({
    ...t,
    status: i < nextIdx ? ('complete' as const) : i === nextIdx ? ('active' as const) : ('upcoming' as const),
  }));
  return { timeline: updated, nextStage };
}

export function getActiveTimelineEvent(timeline: XpsTimelineEvent[]): XpsTimelineEvent | undefined {
  return timeline.find((t) => t.status === 'active') ?? timeline[0];
}
