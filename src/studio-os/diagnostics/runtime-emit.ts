/**
 * Studio OS Runtime → Global Event Bus → Flight Recorder.
 * Safe to import from any runtime module; queues until recorder is attached.
 */
import type { FlightEventType } from './types';

type PendingEmit = {
  type: FlightEventType;
  source: string;
  detail?: Record<string, unknown>;
};

const pending: PendingEmit[] = [];
const RUNTIME_EVENT = 'studio-os-runtime-event';

function getRecorder(): ((type: FlightEventType, source: string, options?: { detail?: Record<string, unknown> }) => void) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    __STUDIO_OS_RECORD__?: (type: FlightEventType, source: string, options?: { detail?: Record<string, unknown> }) => void;
  };
  return win.__STUDIO_OS_RECORD__ ?? null;
}

/** Emit a runtime lifecycle event — never modifies runtime behavior. */
export function emitStudioOsRuntimeEvent(
  type: FlightEventType,
  source: string,
  detail?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(RUNTIME_EVENT, {
        detail: { type, source, detail },
      })
    );
  }

  const record = getRecorder();
  if (record) {
    record(type, source, { detail });
    return;
  }

  pending.push({ type, source, detail });
}

/** Flush events queued before recorder attached — call once at end of init. */
export function flushPendingRuntimeEvents(): void {
  const record = getRecorder();
  if (!record) return;
  while (pending.length > 0) {
    const next = pending.shift();
    if (!next) break;
    record(next.type, next.source, { detail: next.detail });
  }
}

export { RUNTIME_EVENT };
