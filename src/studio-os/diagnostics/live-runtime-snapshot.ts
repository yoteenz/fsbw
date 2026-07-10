/**
 * Live runtime status snapshot — read-only aggregation for Mission Control UI.
 */
import { gatherContextFields, refreshHeartbeatState } from './flight-recorder/context-snapshot';
import { getFlightEvents } from './flight-recorder/recorder';
import { getTimerInventory } from './timer-inventory/timer-hook';
import { getSubscriptionGraph } from './subscription-graph/graph';
import type { FlightEventType, FlightRecorderEvent } from './types';

export type LiveRuntimeSnapshot = {
  heartbeat: number;
  rafCount: number;
  heartbeatFrozen: boolean;
  checkpoint: string;
  route: string;
  compilerStage: string | null;
  compileRunId: string | null;
  shellId: string | null;
  stationId: string | null;
  renderStatus: string;
  runtimeStatus: string;
  activeSubscriptions: number;
  activeTimers: number;
  mountedComponents: number;
  sessionId: string;
  lastEventType: FlightEventType | null;
  lastEventAt: string | null;
};

const ABNORMAL = new Set<string>([
  'HEARTBEAT_STOPPED',
  'HEARTBEAT_TIMEOUT',
  'COMPILER_FAILED',
  'COMPILER_RESET',
  'ERROR',
  'RUNTIME_ERROR',
  'UNCAUGHT_EXCEPTION',
  'UNHANDLED_REJECTION',
  'ERROR_BOUNDARY',
  'SESSION_DESTROYED',
  'SHELL_DESTROYED',
]);

export function isAbnormalEventType(type: FlightEventType): boolean {
  return ABNORMAL.has(type);
}

export function classifySubsystem(type: FlightEventType, source: string): string {
  if (type.startsWith('HEARTBEAT') || source.includes('heartbeat')) return 'heartbeat';
  if (type.startsWith('BOOT') || type.startsWith('RECORDER') || source.includes('studio-kernel')) return 'boot';
  if (type.includes('EXPERIENCE_LAB')) return 'experience-lab';
  if (
    type.includes('COMPILER') ||
    type.includes('WORLD_COMPILER') ||
    type.includes('LANDMARK') ||
    type.includes('SHELL') ||
    source.includes('world-compiler')
  ) {
    return 'compiler';
  }
  if (type.includes('STATION')) return 'station';
  if (type.includes('STORAGE') || type === 'STORE_UPDATED') return 'storage';
  if (type.includes('TIMER') || type === 'REQUEST_ANIMATION_FRAME') return 'timer';
  if (type.includes('SUBSCRIPTION')) return 'subscription';
  if (type.includes('ROUTE') || type.includes('VISIBILITY') || type.includes('PAGE')) return 'navigation';
  if (type.includes('SESSION')) return 'session';
  if (type.includes('COMPONENT') || type.includes('PROVIDER')) return 'lifecycle';
  if (type.includes('ERROR') || type.includes('UNCAUGHT') || type.includes('UNHANDLED') || type === 'WARNING') {
    return 'error';
  }
  return 'runtime';
}

function lastEventOfType(events: FlightRecorderEvent[], prefix: string): FlightRecorderEvent | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    if (events[i].type.startsWith(prefix) || events[i].type.includes(prefix)) return events[i];
  }
  return null;
}

function readCheckpoint(): string {
  try {
    const stored = sessionStorage.getItem('studioOsDiagnosticCheckpoint_v1');
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  try {
    const win = window as unknown as { __MTD?: () => { currentCheckpoint?: string } };
    if (typeof win.__MTD === 'function') {
      const snap = win.__MTD() as { currentCheckpoint?: string };
      if (snap.currentCheckpoint) return snap.currentCheckpoint;
    }
  } catch {
    /* ignore */
  }
  return 'unknown';
}

/** Build live Mission Control snapshot from global recorder state. */
export function buildLiveRuntimeSnapshot(): LiveRuntimeSnapshot {
  const events = [...getFlightEvents()];
  const ctx = gatherContextFields();
  const hb = refreshHeartbeatState();
  const lastCompilerStage = [...events]
    .reverse()
    .find((e) => e.type === 'COMPILER_STAGE_CHANGED' || e.type === 'COMPILER_STAGE_ENTER');
  const lastHb = lastEventOfType(events, 'HEARTBEAT');
  const bootDone = events.some((e) => e.type === 'BOOT_COMPLETED');
  const bootStarted = events.some((e) => e.type === 'BOOT_STARTED');
  const last = events[events.length - 1] ?? null;

  let runtimeStatus = 'idle';
  if (bootDone) runtimeStatus = 'boot-complete';
  else if (bootStarted) runtimeStatus = 'booting';
  else if (events.some((e) => e.type === 'RECORDER_READY')) runtimeStatus = 'recorder-ready';

  if (lastHb?.type === 'HEARTBEAT_STOPPED' || lastHb?.type === 'HEARTBEAT_TIMEOUT') {
    runtimeStatus = 'heartbeat-stopped';
  } else if (hb && hb.heartbeat > 0 && !hb.frozen) {
    runtimeStatus = 'heartbeat-active';
  }

  const compilerStartIdx = events.map((e) => e.type).lastIndexOf('WORLD_COMPILER_STARTED');
  const compilerStopIdx = events.map((e) => e.type).lastIndexOf('WORLD_COMPILER_STOPPED');
  const compilerRunning = compilerStartIdx > compilerStopIdx;
  if (compilerRunning) runtimeStatus = 'compiler-active';

  return {
    heartbeat: hb?.heartbeat ?? 0,
    rafCount: hb?.rafCount ?? 0,
    heartbeatFrozen: hb?.frozen ?? false,
    checkpoint: readCheckpoint(),
    route: last?.route ?? ctx.route,
    compilerStage:
      (lastCompilerStage?.detail?.stage as string | undefined) ??
      (lastCompilerStage?.detail?.stageName as string | undefined) ??
      null,
    compileRunId: ctx.compileRunId ?? (lastCompilerStage?.detail?.compileRunId as string | undefined) ?? null,
    shellId: ctx.shellId,
    stationId: ctx.stationId,
    renderStatus: ctx.reactRenderCount > 0 ? `renders:${ctx.reactRenderCount}` : 'no-renders',
    runtimeStatus,
    activeSubscriptions: getSubscriptionGraph().reduce((n, e) => n + e.subscribers.length, 0) || ctx.activeSubscriptions,
    activeTimers: getTimerInventory().length,
    mountedComponents: events.filter((e) => e.type === 'COMPONENT_MOUNT').length,
    sessionId: ctx.sessionId,
    lastEventType: last?.type ?? null,
    lastEventAt: last?.isoTime ?? null,
  };
}

export function findFirstFailureIndex(events: FlightRecorderEvent[]): number {
  return events.findIndex((e) => isAbnormalEventType(e.type));
}

export function findLatestErrorIndex(events: FlightRecorderEvent[]): number {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    if (
      ['ERROR', 'RUNTIME_ERROR', 'UNCAUGHT_EXCEPTION', 'UNHANDLED_REJECTION', 'ERROR_BOUNDARY'].includes(
        events[i].type
      )
    ) {
      return i;
    }
  }
  return -1;
}

export function rootCauseCandidate(events: FlightRecorderEvent[]): string | null {
  const idx = findFirstFailureIndex(events);
  if (idx < 0) return null;
  const ev = events[idx];
  return `${ev.isoTime.slice(11, 19)} ${ev.type} ← ${ev.source}`;
}
