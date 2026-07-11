/**
 * Early boot hygiene — clears stale loading locks and quarantines corrupt persisted state
 * so normal browser profiles load as reliably as incognito (without wiping auth or invite data).
 */
import { quarantineIncompatiblePersistedState } from '../diagnostic-entry/persisted-state-audit';
import { clearLoadingScreenDocumentLock } from './loadingScreenLock';

const BUILD_ID_KEY = 'fsbw_lastKnownBuildId_v1';

/** Session keys that can leave bisection / diagnostic flags stuck across deploys. */
const STALE_SESSION_KEYS_ON_BUILD_CHANGE = [
  'startupMax',
  'startupDisable',
  'studioOsDiagnosticCheckpoint_v1',
  'worldCompilerDiagnosticMode_v1',
  'worldCompilerInvestigationStopped_v1',
];

function readBuildId(): string | null {
  try {
    return document.querySelector('meta[name="app-build-id"]')?.getAttribute('content') ?? null;
  } catch {
    return null;
  }
}

/** Remove orphan loading overlays and stuck html[data-loading-screen] from a crashed prior tab. */
export function clearStaleBootArtifacts(): void {
  if (typeof document === 'undefined') return;

  const overlay = document.querySelector('.loading-screen-root');
  const stuckAttr = document.documentElement.getAttribute('data-loading-screen') === 'true';

  if (stuckAttr && !overlay) {
    clearLoadingScreenDocumentLock();
  }

  if (overlay && !overlay.isConnected) {
    overlay.remove();
    clearLoadingScreenDocumentLock();
  }
}

function clearStaleSessionKeysOnBuildChange(): boolean {
  if (typeof window === 'undefined') return false;
  const current = readBuildId();
  if (!current) return false;

  let previous: string | null = null;
  try {
    previous = localStorage.getItem(BUILD_ID_KEY);
  } catch {
    return false;
  }

  if (previous === current) return false;

  try {
    localStorage.setItem(BUILD_ID_KEY, current);
  } catch {
    /* ignore */
  }

  for (const key of STALE_SESSION_KEYS_ON_BUILD_CHANGE) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  return Boolean(previous);
}

export type BootHygieneResult = {
  buildChanged: boolean;
  quarantined: number;
};

/** Safe to call synchronously before React mount on every route. */
export function runBootHygiene(options: { quarantine?: boolean } = {}): BootHygieneResult {
  clearStaleBootArtifacts();
  const buildChanged = clearStaleSessionKeysOnBuildChange();

  let quarantined = 0;
  if (options.quarantine !== false && typeof window !== 'undefined') {
    const audit = quarantineIncompatiblePersistedState();
    quarantined = audit.quarantined.length;
    if (quarantined > 0) {
      console.info('[boot-hygiene] quarantined incompatible persisted state', audit.quarantined);
    }
  }

  if (buildChanged) {
    console.info('[boot-hygiene] new deploy detected — cleared stale session bisection flags');
  }

  return { buildChanged, quarantined };
}
