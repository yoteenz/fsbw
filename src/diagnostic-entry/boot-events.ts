/**
 * Pre-React probe reader + append-only boot trace + Black Box boot events.
 */
import { recordFlightEvent } from '../studio-os/diagnostics/flight-recorder/recorder';

export type PreMainProbeSnapshot = {
  schemaVersion: number;
  capturedAt: string;
  route: string;
  buildId: string;
  previousBuildId: string | null;
  buildMismatch: boolean;
  diagnosticIsolationActive: boolean;
  mainBundleStarted: boolean;
  serviceWorker: { controller: string | null; supported: boolean };
  cookies: string[];
  localStorage: { keys: Array<{ key: string; bytes: number }>; error?: string };
  sessionStorage: { keys: Array<{ key: string; bytes: number }>; error?: string };
  studioOsLocalKeys: Array<{ key: string; bytes: number }>;
  studioOsSessionKeys: Array<{ key: string; bytes: number }>;
  documentReadyState: string;
};

const PROBE_KEY = 'studioOsPreMainProbe_v1';
const TRACE_KEY = 'studioOsPreMainBootTrace_v1';

export function readPreMainProbe(): PreMainProbeSnapshot | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as { __STUDIO_OS_PRE_MAIN_PROBE__?: PreMainProbeSnapshot };
  if (win.__STUDIO_OS_PRE_MAIN_PROBE__) return win.__STUDIO_OS_PRE_MAIN_PROBE__;
  try {
    const raw = sessionStorage.getItem(PROBE_KEY);
    return raw ? (JSON.parse(raw) as PreMainProbeSnapshot) : null;
  } catch {
    return null;
  }
}

export function appendBootTrace(
  event: string,
  detail?: Record<string, unknown>
): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(TRACE_KEY);
    const trace: Array<{ ts: number; event: string; detail?: Record<string, unknown> }> = raw
      ? (JSON.parse(raw) as Array<{ ts: number; event: string; detail?: Record<string, unknown> }>)
      : [];
    trace.push({ ts: Date.now(), event, detail });
    sessionStorage.setItem(TRACE_KEY, JSON.stringify(trace.slice(-200)));
  } catch {
    /* quota */
  }
}

export function readBootTrace(): Array<{ ts: number; event: string; detail?: Record<string, unknown> }> {
  try {
    const raw = sessionStorage.getItem(TRACE_KEY);
    return raw ? (JSON.parse(raw) as Array<{ ts: number; event: string; detail?: Record<string, unknown> }>) : [];
  } catch {
    return [];
  }
}

type DiagnosticBootEventType =
  | 'PRE_MAIN_ENTRY'
  | 'DIAGNOSTIC_ENTRY_SELECTED'
  | 'MAIN_ENTRY_SELECTED'
  | 'SERVICE_WORKER_FOUND'
  | 'SERVICE_WORKER_VERSION_MISMATCH'
  | 'CACHE_MANIFEST_INSPECTED'
  | 'PERSISTED_STATE_FOUND'
  | 'PERSISTED_STATE_VALID'
  | 'PERSISTED_STATE_INVALID'
  | 'PERSISTED_STATE_QUARANTINED'
  | 'DIAGNOSTIC_UI_COMMITTED'
  | 'MAIN_BOOT_BYPASSED'
  | 'ERROR';

export function recordDiagnosticBootEvent(
  type: DiagnosticBootEventType,
  detail?: Record<string, unknown>
): void {
  appendBootTrace(type, detail);
  try {
    recordFlightEvent(type as import('../studio-os/diagnostics/types').FlightEventType, 'diagnostic-boot', {
      detail,
    });
  } catch {
    /* recorder not ready yet on earliest events */
  }
}

export function markMainBundleStarted(): void {
  try {
    const probe = readPreMainProbe();
    if (probe) {
      probe.mainBundleStarted = true;
      sessionStorage.setItem(PROBE_KEY, JSON.stringify(probe));
    }
  } catch {
    /* ignore */
  }
}
