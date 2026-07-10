/**
 * Boot-time World Compiler investigation recorder — passive instrumentation only.
 * Registered from global-boot before Experience Lab or investigation routes load.
 */
import {
  getInvestigationEvents,
  loadInvestigationEventsFromSession,
  logCompilerEvent,
} from './investigation-log';
import { installStallEvidenceGlobal, loadStallEvidenceFromSession } from './stall-evidence';
import type { CompilerInvestigationEvent } from './types';

const BOOT_STATE_KEY = 'worldCompilerInvestigationRecorderBoot_v1';
const CANONICAL_EVENT_SOURCE = 'investigation-log.logCompilerEvent';

export type InvestigationRecorderSelfTest = {
  status: 'PASS' | 'FAIL' | 'PENDING';
  eventId: number | null;
  timestamp: string | null;
  message: string | null;
};

export type InvestigationRecorderBootState = {
  bootComplete: boolean;
  recorderConnected: boolean;
  compilerEventSourceConnected: boolean;
  canonicalEventSource: string;
  bootedAt: string;
  selfTest: InvestigationRecorderSelfTest;
};

let bootState: InvestigationRecorderBootState | null = null;

function persistBootState(state: InvestigationRecorderBootState): void {
  try {
    sessionStorage.setItem(BOOT_STATE_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function loadInvestigationRecorderBootState(): InvestigationRecorderBootState | null {
  if (bootState) return bootState;
  try {
    const raw = sessionStorage.getItem(BOOT_STATE_KEY);
    if (!raw) return null;
    bootState = JSON.parse(raw) as InvestigationRecorderBootState;
    return bootState;
  } catch {
    return null;
  }
}

export function isSelfTestEvent(event: CompilerInvestigationEvent): boolean {
  return (
    event.type === 'INVESTIGATION_RECORDER_SELF_TEST' ||
    event.detail?.selfTest === true ||
    event.source === 'investigation-recorder-boot'
  );
}

export function isRealCompilerLifecycleEvent(event: CompilerInvestigationEvent): boolean {
  if (isSelfTestEvent(event)) return false;
  return (
    event.type === 'PIPELINE_LIFECYCLE' ||
    event.type === 'PIPELINE_OWNERSHIP' ||
    event.type === 'LOAD_SHELL_MILESTONE' ||
    event.type === 'COMPILE_STAGE_ENTER' ||
    event.type === 'COMPILE_STAGE_COMPLETE' ||
    event.type === 'COMPILE_FAILED' ||
    event.type === 'COMPILE_RUN_STARTED' ||
    event.type === 'COMPILE_RUN_ENDED' ||
    event.type === 'UI_COMPILER_SYNC' ||
    event.type === 'ASYNC_BOUNDARY_START' ||
    event.type === 'ASYNC_BOUNDARY_END'
  );
}

export function filterRealCompilerEvents(
  events: readonly CompilerInvestigationEvent[]
): CompilerInvestigationEvent[] {
  return events.filter(isRealCompilerLifecycleEvent);
}

function runRecorderSelfTest(): InvestigationRecorderSelfTest {
  const before = getInvestigationEvents().length;
  const ev = logCompilerEvent('INVESTIGATION_RECORDER_SELF_TEST', 'investigation-recorder-boot', {
    detail: { selfTest: true, probe: 'recorder-connection-self-test' },
  });
  const after = getInvestigationEvents();
  const found = after.some((e) => e.id === ev.id);
  const persisted =
    typeof sessionStorage !== 'undefined' &&
    (() => {
      try {
        const raw = sessionStorage.getItem('worldCompilerInvestigationLog_v1');
        if (!raw) return false;
        const parsed = JSON.parse(raw) as CompilerInvestigationEvent[];
        return parsed.some((e) => e.id === ev.id);
      } catch {
        return false;
      }
    })();

  if (found && persisted && after.length >= before + 1) {
    return {
      status: 'PASS',
      eventId: ev.id,
      timestamp: ev.isoTime,
      message: 'Self-test event recorded and persisted to sessionStorage',
    };
  }

  return {
    status: 'FAIL',
    eventId: ev.id,
    timestamp: ev.isoTime,
    message: `Self-test verification failed (found=${found}, persisted=${persisted})`,
  };
}

function registerExportGlobals(): void {
  if (typeof window === 'undefined') return;
  const win = window as unknown as {
    __WC_RECORDER_BOOT__?: InvestigationRecorderBootState;
    __WC_INVESTIGATION__?: CompilerInvestigationEvent[];
    __WC_EXPORT_INVESTIGATION_JSON__?: () => Promise<string>;
    __WC_EXPORT_INVESTIGATION__?: () => Promise<unknown>;
  };
  win.__WC_INVESTIGATION__ = [...getInvestigationEvents()];
  win.__WC_EXPORT_INVESTIGATION_JSON__ = () =>
    import('./investigation-export').then((m) => m.exportCompleteInvestigationJson());
  win.__WC_EXPORT_INVESTIGATION__ = () =>
    import('./investigation-export').then((m) => m.buildCompleteInvestigationExport());
}

/** Boot-time subscription — idempotent; safe to call from global-boot. */
export function initWorldCompilerInvestigationRecorder(): InvestigationRecorderBootState {
  if (typeof window === 'undefined') {
    return {
      bootComplete: false,
      recorderConnected: false,
      compilerEventSourceConnected: false,
      canonicalEventSource: CANONICAL_EVENT_SOURCE,
      bootedAt: new Date().toISOString(),
      selfTest: { status: 'FAIL', eventId: null, timestamp: null, message: 'SSR / no window' },
    };
  }

  const existing = loadInvestigationRecorderBootState();
  if (existing?.bootComplete && existing.recorderConnected) {
    registerExportGlobals();
    return existing;
  }

  loadInvestigationEventsFromSession();
  loadStallEvidenceFromSession();
  installStallEvidenceGlobal();

  const selfTest = runRecorderSelfTest();
  const connected = selfTest.status === 'PASS';

  registerExportGlobals();

  bootState = {
    bootComplete: true,
    recorderConnected: connected,
    compilerEventSourceConnected: connected,
    canonicalEventSource: CANONICAL_EVENT_SOURCE,
    bootedAt: new Date().toISOString(),
    selfTest,
  };

  const win = window as unknown as { __WC_RECORDER_BOOT__?: InvestigationRecorderBootState };
  win.__WC_RECORDER_BOOT__ = bootState;
  persistBootState(bootState);

  void import('./investigation-export').then(({ markInvestigationInstrumentationReady }) => {
    markInvestigationInstrumentationReady();
  });

  return bootState;
}

export function isRecorderConnected(): boolean {
  const state = loadInvestigationRecorderBootState();
  return state?.recorderConnected === true && state?.selfTest?.status === 'PASS';
}

export function getRecorderSelfTest(): InvestigationRecorderSelfTest {
  const state = loadInvestigationRecorderBootState();
  return (
    state?.selfTest ?? {
      status: 'PENDING',
      eventId: null,
      timestamp: null,
      message: 'Recorder boot not completed',
    }
  );
}
