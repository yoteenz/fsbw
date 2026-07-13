import type { WorldTimeline, WorldTimelineEvent } from './world-timeline';

export const FOUNDER_TIME_MACHINE_VERSION = 'founder-time-machine.v1';

export type TimeMachineReplayMode = 'full-build' | 'repairs-only' | 'upgrades-only' | 'version-diff';

export type FounderTimeMachine = {
  machineVersion: typeof FOUNDER_TIME_MACHINE_VERSION;
  planId: string;
  events: WorldTimelineEvent[];
  currentIndex: number;
  replayMode: TimeMachineReplayMode | null;
  isReplaying: boolean;
};

export function initFounderTimeMachine(timeline: WorldTimeline): FounderTimeMachine {
  return {
    machineVersion: FOUNDER_TIME_MACHINE_VERSION,
    planId: timeline.planId,
    events: timeline.events,
    currentIndex: timeline.events.length - 1,
    replayMode: null,
    isReplaying: false,
  };
}

export function startTimeMachineReplay(
  machine: FounderTimeMachine,
  mode: TimeMachineReplayMode
): FounderTimeMachine {
  return {
    ...machine,
    replayMode: mode,
    isReplaying: true,
    currentIndex: 0,
  };
}

export function advanceTimeMachineReplay(machine: FounderTimeMachine): FounderTimeMachine {
  if (!machine.isReplaying) return machine;
  const nextIndex = machine.currentIndex + 1;
  if (nextIndex >= machine.events.length) {
    return { ...machine, isReplaying: false, currentIndex: machine.events.length - 1 };
  }
  return { ...machine, currentIndex: nextIndex };
}

export function getCurrentReplayEvent(machine: FounderTimeMachine): WorldTimelineEvent | null {
  if (machine.events.length === 0) return null;
  return machine.events[machine.currentIndex] ?? null;
}

export function filterEventsForReplayMode(
  events: WorldTimelineEvent[],
  mode: TimeMachineReplayMode
): WorldTimelineEvent[] {
  switch (mode) {
    case 'repairs-only':
      return events.filter((e) => e.eventType === 'repair-scheduled' || e.eventType === 'inspection-failed');
    case 'upgrades-only':
      return events.filter((e) => e.eventType === 'asset-installed');
    case 'full-build':
    default:
      return events;
  }
}
