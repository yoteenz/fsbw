/**
 * Studio OS Black Box Investigation™ — observe-only init.
 * Installs flight recorder, timeline, env diff, lifecycle, state, subscription, timer monitors.
 * Does NOT modify heartbeat, cache, state management, or retry logic.
 */
import { recordFlightEvent, markFlightRecorderInitialized } from './flight-recorder/recorder';
import { installLifecycleMonitor } from './lifecycle-monitor/lifecycle';
import { installStorageObserver } from './state-monitor/storage-observer';
import { installSubscriptionGraphMonitor } from './subscription-graph/graph';
import { installTimerInventory } from './timer-inventory/timer-hook';
import { refreshHeartbeatState, registerFlightContext } from './flight-recorder/context-snapshot';
import { WINDOW_EVENT_MAP, STUDIO_BOOT_EVENT } from './flight-recorder/event-types';
import { captureEnvironmentSnapshot, saveEnvironmentSnapshot } from './environment-diff/capture';
import { buildSessionForensicReport } from './session-report/builder';

let installed = false;
let heartbeatWasAlive = false;
let heartbeatStartedRecorded = false;
let cleanupFns: Array<() => void> = [];

function installWindowEventTap(): () => void {
  const handler = (ev: Event) => {
    const type = WINDOW_EVENT_MAP[ev.type];
    if (type) {
      recordFlightEvent(type, `window:${ev.type}`, {
        detail: { eventType: ev.type },
      });
    }
  };
  for (const name of Object.keys(WINDOW_EVENT_MAP)) {
    window.addEventListener(name, handler);
  }
  return () => {
    for (const name of Object.keys(WINDOW_EVENT_MAP)) {
      window.removeEventListener(name, handler);
    }
  };
}

function installBootListener(): () => void {
  const fn = (ev: Event) => {
    const detail = (ev as CustomEvent).detail;
    recordFlightEvent('BOOT_COMPLETED', 'studio-kernel', {
      detail: typeof detail === 'object' && detail ? { ...(detail as object) } : { detail },
    });
  };
  window.addEventListener(STUDIO_BOOT_EVENT, fn);
  return () => window.removeEventListener(STUDIO_BOOT_EVENT, fn);
}

function installServiceWorkerObserver(): () => void {
  if (!navigator.serviceWorker) return () => undefined;
  const fn = (ev: MessageEvent) => {
    recordFlightEvent('SERVICE_WORKER_MESSAGE', 'serviceWorker', {
      detail: { data: ev.data },
    });
  };
  navigator.serviceWorker.addEventListener('message', fn);
  return () => navigator.serviceWorker?.removeEventListener('message', fn);
}

function installHeartbeatObserver(): () => void {
  let lastHb = -1;
  let lastRaf = -1;
  let staleSince: number | null = null;

  const id = window.setInterval(() => {
    const snap = refreshHeartbeatState();
    if (!snap) return;

    if (snap.heartbeat > 0 && !heartbeatStartedRecorded) {
      heartbeatStartedRecorded = true;
      recordFlightEvent('HEARTBEAT_STARTED', 'heartbeat-observer');
    }

    const alive = snap.heartbeat > lastHb || snap.rafCount > lastRaf;
    if (alive) {
      heartbeatWasAlive = true;
      staleSince = null;
    } else if (heartbeatWasAlive && snap.heartbeat === lastHb) {
      if (!staleSince) staleSince = Date.now();
      if (Date.now() - staleSince > 750) {
        recordFlightEvent('HEARTBEAT_STOPPED', 'heartbeat-observer', {
          detail: { heartbeat: snap.heartbeat, rafCount: snap.rafCount, frozen: snap.frozen },
        });
        heartbeatWasAlive = false;
        staleSince = null;
      }
    }

    if (snap.frozen && snap.heartbeat === lastHb) {
      recordFlightEvent('HEARTBEAT_TIMEOUT', 'heartbeat-observer', {
        detail: { heartbeat: snap.heartbeat },
      });
    }

    lastHb = snap.heartbeat;
    lastRaf = snap.rafCount;
  }, 400);

  return () => clearInterval(id);
}

function installSessionReportOnUnload(): () => void {
  const fn = () => {
    void buildSessionForensicReport();
  };
  window.addEventListener('pagehide', fn);
  return () => window.removeEventListener('pagehide', fn);
}

/** Install all Black Box monitors — call once at app boot. Observe-only. */
export function initStudioOsFlightRecorder(options?: { envLabel?: string }): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  markFlightRecorderInitialized();

  recordFlightEvent('BOOT_STARTED', 'initStudioOsFlightRecorder');
  recordFlightEvent('AUTH_STARTED', 'initStudioOsFlightRecorder');

  cleanupFns = [
    installTimerInventory(),
    installStorageObserver(),
    installLifecycleMonitor(),
    installSubscriptionGraphMonitor(),
    installWindowEventTap(),
    installBootListener(),
    installServiceWorkerObserver(),
    installHeartbeatObserver(),
    installSessionReportOnUnload(),
  ];

  void captureEnvironmentSnapshot(options?.envLabel ?? 'boot').then((snap) => {
    saveEnvironmentSnapshot(snap);
    recordFlightEvent('ENV_SNAPSHOT', 'environment-diff/capture', {
      detail: { label: snap.label, genesisBytes: snap.genesisBytes },
    });
  });

  try {
    if (localStorage.getItem('isSignedIn') === 'true' || localStorage.getItem('currentUser')) {
      recordFlightEvent('AUTH_COMPLETED', 'initStudioOsFlightRecorder');
      recordFlightEvent('SESSION_RESTORED', 'initStudioOsFlightRecorder');
    }
    if (localStorage.getItem('genesis_v1')) {
      recordFlightEvent('GENESIS_LOADED', 'initStudioOsFlightRecorder', {
        detail: { bytes: localStorage.getItem('genesis_v1')?.length ?? 0 },
      });
      recordFlightEvent('REGISTRY_LOADED', 'initStudioOsFlightRecorder');
    }
  } catch {
    /* private mode */
  }

  (window as unknown as {
    __STUDIO_OS_FLIGHT_RECORDER__?: true;
    __STUDIO_OS_RECORD__?: typeof recordFlightEvent;
    __STUDIO_OS_REGISTER_CONTEXT__?: typeof registerFlightContext;
  }).__STUDIO_OS_FLIGHT_RECORDER__ = true;
  (window as unknown as { __STUDIO_OS_RECORD__?: typeof recordFlightEvent }).__STUDIO_OS_RECORD__ =
    recordFlightEvent;
  (window as unknown as { __STUDIO_OS_REGISTER_CONTEXT__?: typeof registerFlightContext }).__STUDIO_OS_REGISTER_CONTEXT__ =
    registerFlightContext;
}

export function shutdownStudioOsFlightRecorder(): void {
  for (const fn of cleanupFns) fn();
  cleanupFns = [];
  installed = false;
}

export { recordFlightEvent, getFlightEvents, getFlightSessionIdFromRecorder } from './flight-recorder/recorder';
export { registerFlightContext } from './flight-recorder/context-snapshot';
export { buildSessionForensicReport, loadLastSessionReport } from './session-report/builder';
export { captureEnvironmentSnapshot, saveEnvironmentSnapshot, loadEnvironmentSnapshots } from './environment-diff/capture';
export { compareEnvironmentSnapshots } from './environment-diff/compare';
export { buildEventTimeline, formatTimelineAscii } from './event-timeline/timeline';
export { getTimerInventory, findThreeSecondTimers } from './timer-inventory/timer-hook';
export { getSubscriptionGraph, detectSubscriptionLoops } from './subscription-graph/graph';
export { STATE_OWNERSHIP, buildOwnershipReport } from './state-monitor/ownership-registry';
