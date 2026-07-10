/**
 * Scoped recovery actions — never clears auth or unrelated website data by default.
 */
import {
  listQuarantinedKeys,
  quarantineIncompatiblePersistedState,
  type QuarantineResult,
} from './persisted-state-audit';
import { clearObsoleteStudioCaches, unregisterAllServiceWorkers } from './service-worker-audit';

const EXPERIENCE_LAB_SESSION_KEYS = [
  'worldCompilerDiagnosticMode_v1',
  'worldCompilerInvestigationLog_v1',
  'worldCompilerLayer1Forensic_v1',
  'worldCompilerInvestigationStopped_v1',
  'studioOsDiagnosticCheckpoint_v1',
  'studioOsFlightRecorderSummary_v1',
  'studioOsFlightRecorderLastReport_v1',
];

const WORLD_COMPILER_SESSION_KEYS = [
  'worldCompilerDiagnosticMode_v1',
  'worldCompilerLayer1Forensic_v1',
  'worldCompilerInvestigationLog_v1',
  'worldCompilerInvestigationStopped_v1',
];

export type RecoveryActionResult = {
  ok: boolean;
  action: string;
  detail: string;
};

export async function runUnregisterServiceWorkers(): Promise<RecoveryActionResult> {
  const count = await unregisterAllServiceWorkers();
  return {
    ok: true,
    action: 'unregister-service-workers',
    detail: `Unregistered ${count} service worker registration(s).`,
  };
}

export async function runClearObsoleteCaches(): Promise<RecoveryActionResult> {
  const cleared = await clearObsoleteStudioCaches();
  return {
    ok: true,
    action: 'clear-obsolete-caches',
    detail: cleared.length ? `Cleared caches: ${cleared.join(', ')}` : 'No matching Studio OS caches found.',
  };
}

export function runQuarantineIncompatibleState(): RecoveryActionResult & { audit: QuarantineResult } {
  const audit = quarantineIncompatiblePersistedState();
  return {
    ok: true,
    action: 'quarantine-incompatible-state',
    detail: `Quarantined ${audit.quarantined.length} record(s).`,
    audit,
  };
}

export function runResetExperienceLabTransientState(): RecoveryActionResult {
  let removed = 0;
  for (const key of EXPERIENCE_LAB_SESSION_KEYS) {
    try {
      if (sessionStorage.getItem(key) != null) {
        sessionStorage.removeItem(key);
        removed += 1;
      }
    } catch {
      /* ignore */
    }
  }
  return {
    ok: true,
    action: 'reset-experience-lab-transient',
    detail: `Removed ${removed} Experience Lab session key(s).`,
  };
}

export function runResetWorldCompilerTransientState(): RecoveryActionResult {
  let removed = 0;
  for (const key of WORLD_COMPILER_SESSION_KEYS) {
    try {
      if (sessionStorage.getItem(key) != null) {
        sessionStorage.removeItem(key);
        removed += 1;
      }
    } catch {
      /* ignore */
    }
  }
  return {
    ok: true,
    action: 'reset-world-compiler-transient',
    detail: `Removed ${removed} World Compiler session key(s).`,
  };
}

export function getRecoveryHealthSummary(): {
  quarantinedKeys: string[];
  buildId: string | null;
  buildMismatch: boolean;
} {
  return {
    quarantinedKeys: listQuarantinedKeys(),
    buildId: (() => {
      try {
        return document.querySelector('meta[name="app-build-id"]')?.getAttribute('content') ?? null;
      } catch {
        return null;
      }
    })(),
    buildMismatch: (() => {
      try {
        const current = document.querySelector('meta[name="app-build-id"]')?.getAttribute('content');
        const prev = localStorage.getItem('fsbw_lastKnownBuildId_v1');
        return Boolean(current && prev && current !== prev);
      } catch {
        return false;
      }
    })(),
  };
}

export function reloadCleanly(): void {
  const url = new URL(window.location.href);
  url.searchParams.set('_diagReload', String(Date.now()));
  window.location.replace(url.toString());
}
