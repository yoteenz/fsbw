import type { FailureClassification, SessionForensicReport } from '../types';
import { buildEventTimeline } from '../event-timeline/timeline';
import { compareEnvironmentSnapshots, findSnapshotPairs } from '../environment-diff/compare';
import { loadEnvironmentSnapshots } from '../environment-diff/capture';
import { getRemountCount } from '../lifecycle-monitor/lifecycle';
import { buildOwnershipReport } from '../state-monitor/ownership-registry';
import { detectSubscriptionLoops, getSubscriptionGraph } from '../subscription-graph/graph';
import { findThreeSecondTimers, getTimerInventory } from '../timer-inventory/timer-hook';
import { loadAllEventsForSession } from '../flight-recorder/persistence';
import { getFlightSessionIdFromRecorder, recordFlightEvent } from '../flight-recorder/recorder';
import type { FlightRecorderEvent } from '../types';

function classifyFailure(event: FlightRecorderEvent | null): FailureClassification | null {
  if (!event) return null;
  switch (event.type) {
    case 'HEARTBEAT_STOPPED':
    case 'HEARTBEAT_TIMEOUT':
    case 'LONG_TASK':
      return 'main_thread_block';
    case 'COMPONENT_REMOUNT':
      return 'component_remount';
    case 'STORE_UPDATED':
    case 'STORAGE_WRITE':
      return event.detail?.key?.toString().includes('genesis') ? 'browser_storage' : 'state_mutation';
    case 'SCENE_STACK_UPDATED':
    case 'SHELL_INVALIDATED':
      return 'registry_invalidation';
    case 'ERROR_BOUNDARY':
      return 'unknown';
    case 'ROUTE_CHANGED':
      return 'routing';
    case 'SERVICE_WORKER_MESSAGE':
      return 'service_worker';
    case 'CACHE_UPDATED':
      return 'cache';
    case 'TIMER_REGISTERED':
      return 'timer';
    default:
      return 'unknown';
  }
}

function countType(events: FlightRecorderEvent[], type: string): number {
  return events.filter((e) => e.type === type).length;
}

function computeDuration(events: FlightRecorderEvent[], start: string, end: string): number | null {
  const a = events.find((e) => e.type === start);
  const b = events.find((e) => e.type === end);
  if (!a || !b) return null;
  return b.timestamp - a.timestamp;
}

/** Assemble evidence-only session report — no recommendations. */
export async function buildSessionForensicReport(): Promise<SessionForensicReport> {
  const sessionId = getFlightSessionIdFromRecorder();
  const events = await loadAllEventsForSession(sessionId);
  const timeline = buildEventTimeline(events);

  const hbStart = events.find((e) => e.type === 'HEARTBEAT_STARTED');
  const hbStop = events.find((e) => e.type === 'HEARTBEAT_STOPPED' || e.type === 'HEARTBEAT_TIMEOUT');
  const heartbeatDurationMs =
    hbStart && hbStop ? hbStop.timestamp - hbStart.timestamp : hbStart ? Date.now() - hbStart.timestamp : null;

  const firstAbnormal = timeline.firstAbnormalEvent;
  const finalSuccess = timeline.finalSuccessfulEvent;
  const firstIrreversible = firstAbnormal ?? (finalSuccess ? null : events[events.length - 1] ?? null);

  const snapshots = loadEnvironmentSnapshots();
  const pairs = findSnapshotPairs(snapshots);
  const environmentDiff =
    pairs.length > 0 ? compareEnvironmentSnapshots(pairs[0].baseline, pairs[0].compare) : null;

  const report: SessionForensicReport = {
    sessionId,
    generatedAt: new Date().toISOString(),
    bootCompleted: events.some((e) => e.type === 'BOOT_COMPLETED'),
    heartbeatDurationMs,
    compilerDurationMs: computeDuration(events, 'COMPILER_STARTED', 'COMPILER_STAGE_COMPLETE'),
    registryUpdateCount: countType(events, 'STORE_UPDATED') + countType(events, 'REGISTRY_LOADED'),
    sceneStackUpdateCount: countType(events, 'SCENE_STACK_UPDATED'),
    reactRemountCount: getRemountCount(),
    errorCount: countType(events, 'ERROR_BOUNDARY'),
    warningCount: countType(events, 'LONG_TASK'),
    finalSuccessfulEvent: finalSuccess,
    firstAbnormalEvent: firstAbnormal,
    firstIrreversibleFailure: firstIrreversible,
    failureClassification: classifyFailure(firstIrreversible),
    timeline,
    environmentDiff,
    ownershipConflicts: buildOwnershipReport(),
    timerInventory: getTimerInventory(),
    subscriptionGraph: getSubscriptionGraph(),
    subscriptionLoops: detectSubscriptionLoops(),
    evidenceOnly: true,
  };

  recordFlightEvent('SESSION_REPORT', 'session-report/builder', {
    detail: {
      eventCount: events.length,
      firstAbnormal: firstAbnormal?.type ?? null,
      failureClassification: report.failureClassification,
    },
  });

  try {
    sessionStorage.setItem('studioOsFlightRecorderLastReport_v1', JSON.stringify(report));
  } catch {
    /* quota */
  }

  return report;
}

export function loadLastSessionReport(): SessionForensicReport | null {
  try {
    const raw = sessionStorage.getItem('studioOsFlightRecorderLastReport_v1');
    return raw ? (JSON.parse(raw) as SessionForensicReport) : null;
  } catch {
    return null;
  }
}

export function getThreeSecondTimerEvidence(): ReturnType<typeof findThreeSecondTimers> {
  return findThreeSecondTimers();
}
