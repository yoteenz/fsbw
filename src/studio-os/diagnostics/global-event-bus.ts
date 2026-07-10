/**
 * Global Event Bus — singleton bridge between Studio OS runtime and Black Box recorder.
 * Never tied to React routes or diagnostic pages.
 */
import type { FlightEventType } from './types';
import { emitStudioOsRuntimeEvent, RUNTIME_EVENT } from './runtime-emit';

type BusListener = (type: FlightEventType, source: string, detail?: Record<string, unknown>) => void;

const listeners = new Set<BusListener>();
let busInstalled = false;

export function subscribeStudioOsRuntimeBus(listener: BusListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishStudioOsRuntimeEvent(
  type: FlightEventType,
  source: string,
  detail?: Record<string, unknown>
): void {
  emitStudioOsRuntimeEvent(type, source, detail);
  for (const fn of listeners) {
    try {
      fn(type, source, detail);
    } catch {
      /* observer must not throw */
    }
  }
}

/** Mirror window CustomEvent bus into recorder subscribers. */
export function installGlobalRuntimeEventBus(): () => void {
  if (busInstalled || typeof window === 'undefined') return () => undefined;
  busInstalled = true;

  const onRuntime = (ev: Event) => {
    const detail = (ev as CustomEvent<{ type?: FlightEventType; source?: string; detail?: Record<string, unknown> }>)
      .detail;
    if (!detail?.type || !detail.source) return;
    for (const fn of listeners) {
      try {
        fn(detail.type, detail.source, detail.detail);
      } catch {
        /* ignore */
      }
    }
  };

  window.addEventListener(RUNTIME_EVENT, onRuntime);
  return () => {
    window.removeEventListener(RUNTIME_EVENT, onRuntime);
    busInstalled = false;
  };
}
