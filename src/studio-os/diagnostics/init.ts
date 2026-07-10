/**
 * Studio OS Black Box Investigation™ — global flight recorder init.
 * Installs monitors at earliest boot; never tied to diagnostic React pages.
 */
import { recordFlightEvent, markFlightRecorderInitialized } from './flight-recorder/recorder';
import { installLifecycleMonitor } from './lifecycle-monitor/lifecycle';
import { installStorageObserver } from './state-monitor/storage-observer';
import { installSubscriptionGraphMonitor } from './subscription-graph/graph';
import { installTimerInventory } from './timer-inventory/timer-hook';
import { refreshHeartbeatState, registerFlightContext } from './flight-recorder/context-snapshot';
import { WINDOW_EVENT_MAP } from './flight-recorder/event-types';
import { captureEnvironmentSnapshot, saveEnvironmentSnapshot } from './environment-diff/capture';
import { buildSessionForensicReport } from './session-report/builder';
import { installGlobalRuntimeEventBus } from './global-event-bus';
import { flushPendingRuntimeEvents } from './runtime-emit';
import { STUDIO_BOOT_EVENT } from '../../studio-os-core/kernel/types';
import type { StudioBootLiveState } from '../../studio-os-core/kernel/types';

let installed = false;
let heartbeatWasAlive = false;
let heartbeatStartedRecorded = false;
let bootStartedRecorded = false;
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

function installStudioBootListener(): () => void {
  const fn = (ev: Event) => {
    const detail = (ev as CustomEvent<StudioBootLiveState>).detail;
    if (!detail) return;

    if (detail.started && !bootStartedRecorded) {
      bootStartedRecorded = true;
      recordFlightEvent('BOOT_STARTED', 'studio-kernel', {
        detail: { currentModuleId: detail.currentModuleId, elapsedMs: detail.elapsedMs },
      });
      recordFlightEvent('SESSION_CREATED', 'studio-kernel', { detail: { sessionId: detail.currentModuleId } });
    }

    if (detail.complete) {
      recordFlightEvent('BOOT_COMPLETED', 'studio-kernel', {
        detail: { ready: detail.ready, errors: detail.errors, warnings: detail.warnings },
      });
    }
  };
  window.addEventListener(STUDIO_BOOT_EVENT, fn);
  return () => window.removeEventListener(STUDIO_BOOT_EVENT, fn);
}

function installVisibilityObserver(): () => void {
  const fn = () => {
    const state = document.visibilityState;
    recordFlightEvent('VISIBILITY_CHANGED', 'document.visibilityState', {
      detail: { state },
    });
    if (state === 'hidden') {
      recordFlightEvent('PAGE_HIDDEN', 'document.visibilityState');
    } else {
      recordFlightEvent('PAGE_VISIBLE', 'document.visibilityState');
    }
  };
  document.addEventListener('visibilitychange', fn);
  return () => document.removeEventListener('visibilitychange', fn);
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
      if (heartbeatWasAlive === false && heartbeatStartedRecorded) {
        recordFlightEvent('HEARTBEAT_RESTARTED', 'heartbeat-observer', {
          detail: { heartbeat: snap.heartbeat, rafCount: snap.rafCount },
        });
      }
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
    recordFlightEvent('SESSION_DESTROYED', 'window.pagehide');
    void buildSessionForensicReport();
  };
  window.addEventListener('pagehide', fn);
  return () => window.removeEventListener('pagehide', fn);
}

/** Install global Black Box recorder — call once at earliest main entry. Observe-only. */
export function initStudioOsFlightRecorder(options?: { envLabel?: string }): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  (window as unknown as {
    __STUDIO_OS_RECORD__?: typeof recordFlightEvent;
    __STUDIO_OS_REGISTER_CONTEXT__?: typeof registerFlightContext;
  }).__STUDIO_OS_RECORD__ = recordFlightEvent;
  (window as unknown as { __STUDIO_OS_REGISTER_CONTEXT__?: typeof registerFlightContext }).__STUDIO_OS_REGISTER_CONTEXT__ =
    registerFlightContext;

  recordFlightEvent('RECORDER_ATTACHED', 'global-flight-recorder');
  markFlightRecorderInitialized();

  cleanupFns = [
    installGlobalRuntimeEventBus(),
    installTimerInventory(),
    installStorageObserver(),
    installLifecycleMonitor(),
    installSubscriptionGraphMonitor(),
    installWindowEventTap(),
    installStudioBootListener(),
    installVisibilityObserver(),
    installServiceWorkerObserver(),
    installHeartbeatObserver(),
    installSessionReportOnUnload(),
  ];

  recordFlightEvent('SESSION_CREATED', 'global-flight-recorder', {
    detail: { phase: 'recorder-attached' },
  });

  void captureEnvironmentSnapshot(options?.envLabel ?? 'boot').then((snap) => {
    saveEnvironmentSnapshot(snap);
    recordFlightEvent('ENV_SNAPSHOT', 'environment-diff/capture', {
      detail: { label: snap.label, genesisBytes: snap.genesisBytes },
    });
  });

  try {
    if (localStorage.getItem('isSignedIn') === 'true' || localStorage.getItem('currentUser')) {
      recordFlightEvent('AUTH_COMPLETED', 'global-flight-recorder');
      recordFlightEvent('SESSION_RESTORED', 'global-flight-recorder');
    }
    if (localStorage.getItem('genesis_v1')) {
      recordFlightEvent('GENESIS_LOADED', 'global-flight-recorder', {
        detail: { bytes: localStorage.getItem('genesis_v1')?.length ?? 0 },
      });
      recordFlightEvent('REGISTRY_LOADED', 'global-flight-recorder');
    }
  } catch {
    /* private mode */
  }

  recordFlightEvent('RECORDER_READY', 'global-flight-recorder');
  flushPendingRuntimeEvents();

  (window as unknown as { __STUDIO_OS_FLIGHT_RECORDER__?: true }).__STUDIO_OS_FLIGHT_RECORDER__ = true;
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
export { buildEventTimeline, formatTimelineAscii, formatTimelineVertical } from './event-timeline/timeline';
export { getTimerInventory, findThreeSecondTimers } from './timer-inventory/timer-hook';
export { getSubscriptionGraph, detectSubscriptionLoops } from './subscription-graph/graph';
export { STATE_OWNERSHIP, buildOwnershipReport } from './state-monitor/ownership-registry';
export { emitStudioOsRuntimeEvent } from './runtime-emit';
export {
  pauseRecording,
  resumeRecording,
  startRecording,
  clearRecording,
  getRecorderRuntimeStatus,
  getRecordingElapsedMs,
  isRecorderActive,
  isRecorderPaused,
} from './recorder-controller';
export { buildMarkdownFlightReport } from './markdown-report';
