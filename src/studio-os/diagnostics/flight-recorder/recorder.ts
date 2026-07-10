/**
 * Append-only Studio OS Flight Recorder — observes only, never modifies runtime.
 */
import type { FlightEventType, FlightRecorderEvent } from '../types';
import { gatherContextFields, getFlightSessionId } from './context-snapshot';
import { persistFlightEvent, getMemoryMirror } from './persistence';

let sequence = 0;
let initialized = false;
const listeners = new Set<(event: FlightRecorderEvent) => void>();

function captureCaller(): string {
  try {
    const stack = new Error().stack ?? '';
    const lines = stack.split('\n').slice(2, 6);
    return lines.join(' | ').trim().slice(0, 480);
  } catch {
    return 'unknown';
  }
}

/** Record a flight event. Append-only — prior events are never modified. */
export function recordFlightEvent(
  type: FlightEventType,
  source: string,
  options?: {
    caller?: string;
    detail?: Record<string, unknown>;
  }
): FlightRecorderEvent {
  sequence += 1;
  const ctx = gatherContextFields();
  const event: FlightRecorderEvent = {
    id: sequence,
    eventId: `${ctx.sessionId}:${sequence}`,
    timestamp: Date.now(),
    isoTime: new Date().toISOString(),
    type,
    source,
    caller: options?.caller ?? captureCaller(),
    route: ctx.route,
    browser: ctx.browser,
    platform: ctx.platform,
    company: ctx.company,
    stationId: ctx.stationId,
    shellId: ctx.shellId,
    compileRunId: ctx.compileRunId,
    heartbeatState: ctx.heartbeatState,
    registryVersion: ctx.registryVersion,
    sceneStackVersion: ctx.sceneStackVersion,
    reactRenderCount: ctx.reactRenderCount,
    activeSubscriptions: ctx.activeSubscriptions,
    contextVersion: ctx.contextVersion,
    url: ctx.url,
    sessionId: ctx.sessionId,
    bundleVersion: ctx.bundleVersion,
    reactVersion: ctx.reactVersion,
    detail: options?.detail,
  };

  persistFlightEvent(event);
  for (const fn of listeners) {
    try {
      fn(event);
    } catch {
      /* observer must not throw */
    }
  }
  return event;
}

export function onFlightEvent(listener: (event: FlightRecorderEvent) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFlightEvents(): readonly FlightRecorderEvent[] {
  return getMemoryMirror();
}

export function isFlightRecorderInitialized(): boolean {
  return initialized;
}

export function markFlightRecorderInitialized(): void {
  initialized = true;
}

export function getFlightSessionIdFromRecorder(): string {
  return getFlightSessionId();
}
