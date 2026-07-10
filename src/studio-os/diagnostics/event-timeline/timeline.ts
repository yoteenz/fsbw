import type { FlightRecorderEvent, TimelineAnalysis } from '../types';

const ABNORMAL_TYPES = new Set<string>([
  'HEARTBEAT_STOPPED',
  'HEARTBEAT_TIMEOUT',
  'COMPILER_FAILED',
  'ERROR_BOUNDARY',
  'SHELL_INVALIDATED',
]);

const EXPECTED_BOOT_FLOW: string[] = [
  'BOOT_STARTED',
  'AUTH_STARTED',
  'AUTH_COMPLETED',
  'GENESIS_LOADED',
  'REGISTRY_LOADED',
  'BOOT_COMPLETED',
  'HEARTBEAT_STARTED',
  'SCENE_STACK_CREATED',
  'STATION_CREATED',
  'SHELL_CREATED',
  'COMPILER_STARTED',
  'COMPILER_STAGE_COMPLETE',
  'HEARTBEAT_STARTED',
];

function findFirstMissing(expected: string[], seen: Set<string>): string | null {
  for (const step of expected) {
    if (!seen.has(step)) return step;
  }
  return null;
}

/** Build chronological timeline and identify final success / first abnormal / first gap. */
export function buildEventTimeline(events: FlightRecorderEvent[]): TimelineAnalysis {
  const sorted = [...events].sort((a, b) => a.id - b.id);
  const seen = new Set(sorted.map((e) => e.type));

  let finalSuccessful: FlightRecorderEvent | null = null;
  let firstAbnormal: FlightRecorderEvent | null = null;

  for (const ev of sorted) {
    if (ABNORMAL_TYPES.has(ev.type)) {
      if (!firstAbnormal) firstAbnormal = ev;
    } else {
      finalSuccessful = ev;
    }
  }

  const firstMissing = findFirstMissing(EXPECTED_BOOT_FLOW, seen);

  let gapDescription: string | null = null;
  if (firstAbnormal && finalSuccessful) {
    gapDescription = `Last success: ${finalSuccessful.type} (${finalSuccessful.isoTime}) → first abnormal: ${firstAbnormal.type} (${firstAbnormal.isoTime})`;
  } else if (firstMissing) {
    gapDescription = `Expected ${firstMissing} never recorded`;
  }

  return {
    events: sorted.map((e) => ({
      isoTime: e.isoTime,
      type: e.type,
      source: e.source,
      caller: e.caller,
    })),
    finalSuccessfulEvent: finalSuccessful,
    firstMissingEvent: firstMissing,
    firstAbnormalEvent: firstAbnormal,
    gapDescription,
  };
}

/** ASCII timeline for display. */
export function formatTimelineAscii(timeline: TimelineAnalysis): string {
  const lines = timeline.events.map((e) => `${e.isoTime.slice(11, 23)}  ${e.type}  ← ${e.source}`);
  if (timeline.gapDescription) {
    lines.push('', '???', timeline.gapDescription);
  }
  return lines.join('\n');
}
