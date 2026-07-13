import type { JobLifecycleEvent, JobAuditEvent } from '../schemas/os-job';

export const OBSERVABILITY_STORE_VERSION = 'os-scheduler-observability.v1' as const;
const STORAGE_KEY = 'studioOsSchedulerObservability_v1';

export type ObservabilityLog = {
  logVersion: typeof OBSERVABILITY_STORE_VERSION;
  events: JobAuditEvent[];
  lastEventAt: string;
};

let memoryLog: ObservabilityLog | null = null;

function emptyLog(): ObservabilityLog {
  return { logVersion: OBSERVABILITY_STORE_VERSION, events: [], lastEventAt: new Date().toISOString() };
}

export function readObservabilityLog(): ObservabilityLog {
  if (memoryLog) return memoryLog;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryLog = JSON.parse(raw) as ObservabilityLog;
        return memoryLog;
      }
    } catch {
      /* seed */
    }
  }
  memoryLog = emptyLog();
  return memoryLog;
}

export function writeObservabilityLog(log: ObservabilityLog): void {
  memoryLog = log;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch {
      /* memory fallback */
    }
  }
}

export function resetObservabilityLogForTests(): void {
  memoryLog = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function recordJobEvent(event: JobAuditEvent): void {
  const log = readObservabilityLog();
  const next: ObservabilityLog = {
    ...log,
    events: [...log.events, event].slice(-500),
    lastEventAt: event.at,
  };
  writeObservabilityLog(next);
}

export function recordJobLifecycle(jobId: string, event: JobLifecycleEvent, reason?: string, actor = 'os-scheduler'): void {
  recordJobEvent({ event, at: new Date().toISOString(), reason, actor, metadata: { jobId } });
}

export function getEventsForJob(jobId: string): JobAuditEvent[] {
  return readObservabilityLog().events.filter((e) => e.metadata?.jobId === jobId);
}

export function countEventsByType(event: JobLifecycleEvent): number {
  return readObservabilityLog().events.filter((e) => e.event === event).length;
}

export function persistJobAuditEvents(jobId: string, events: JobAuditEvent[]): void {
  for (const e of events) {
    recordJobEvent({ ...e, metadata: { ...e.metadata, jobId } });
  }
}
