import type { EnvironmentSnapshot } from '../types';
import { getBootStartedAt } from '../flight-recorder/context-snapshot';

const SNAPSHOTS_KEY = 'studioOsFlightRecorderEnvSnapshots_v1';

function readStorageKeys(storage: Storage): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (k) keys.push(k);
    }
  } catch {
    /* private mode */
  }
  return keys.sort();
}

function readStorageSizes(storage: Storage, keys: string[]): Record<string, number> {
  const sizes: Record<string, number> = {};
  for (const k of keys) {
    try {
      sizes[k] = storage.getItem(k)?.length ?? 0;
    } catch {
      sizes[k] = -1;
    }
  }
  return sizes;
}

function readCookies(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const part of document.cookie.split(';')) {
      const [k, ...rest] = part.trim().split('=');
      if (k) out[k] = rest.join('=');
    }
  } catch {
    /* ignore */
  }
  return out;
}

async function listIndexedDbNames(): Promise<string[]> {
  try {
    if (typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases();
      return dbs.map((d) => d.name ?? '').filter(Boolean);
    }
  } catch {
    /* ignore */
  }
  return [];
}

async function listCacheStorageKeys(): Promise<string[]> {
  try {
    if (typeof caches === 'undefined') return [];
    return await caches.keys();
  } catch {
    return [];
  }
}

async function countServiceWorkers(): Promise<number> {
  try {
    if (!navigator.serviceWorker) return 0;
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.length;
  } catch {
    return 0;
  }
}

/** Capture read-only environment fingerprint — never writes storage. */
export async function captureEnvironmentSnapshot(label: string): Promise<EnvironmentSnapshot> {
  const lsKeys = readStorageKeys(localStorage);
  const ssKeys = readStorageKeys(sessionStorage);
  let genesisBytes = 0;
  let genesisVersion: string | null = null;
  try {
    const raw = localStorage.getItem('genesis_v1');
    genesisBytes = raw?.length ?? 0;
    if (raw) {
      const parsed = JSON.parse(raw) as { frameworkVersion?: string };
      genesisVersion = parsed.frameworkVersion ?? null;
    }
  } catch {
    /* ignore */
  }

  const win = window as unknown as Record<string, unknown>;
  const overlay = (win.__STUDIO_OS_FLIGHT_CONTEXT__ as Record<string, unknown> | undefined) ?? {};

  return {
    label,
    capturedAt: new Date().toISOString(),
    cookies: readCookies(),
    localStorageKeys: lsKeys,
    localStorageSizes: readStorageSizes(localStorage, lsKeys),
    sessionStorageKeys: ssKeys,
    sessionStorageSizes: readStorageSizes(sessionStorage, ssKeys),
    indexedDbNames: await listIndexedDbNames(),
    cacheStorageKeys: await listCacheStorageKeys(),
    serviceWorkerRegistrations: await countServiceWorkers(),
    navigator: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      webdriver: (navigator as unknown as { webdriver?: boolean }).webdriver ?? false,
    },
    featureFlags: {
      startupMax: sessionStorage.getItem('startupMax'),
      startupDisable: sessionStorage.getItem('startupDisable'),
      heartbeatHidden: new URLSearchParams(window.location.search).get('heartbeat') === '0',
    },
    registryVersion: genesisVersion,
    genesisVersion,
    genesisBytes,
    shellId: (overlay.shellId as string) ?? null,
    stationId: (overlay.stationId as string) ?? null,
    compileRunId: (overlay.compileRunId as string) ?? null,
    heartbeatId: (() => {
      try {
        const mtd = win.__MTD as (() => { kernelInstanceId?: string }) | undefined;
        return typeof mtd === 'function' ? (mtd()?.kernelInstanceId ?? null) : null;
      } catch {
        return null;
      }
    })(),
    authState: {
      isSignedIn: localStorage.getItem('isSignedIn'),
      hasCurrentUser: Boolean(localStorage.getItem('currentUser')),
    },
    hydrationState: {
      documentReadyState: document.readyState,
      rootChildCount: document.getElementById('root')?.childElementCount ?? 0,
    },
    bootDurationMs: Date.now() - getBootStartedAt(),
    reactVersion: '19',
    bundleVersion: import.meta.env.VITE_APP_VERSION ?? null,
    contextVersions: overlay,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
}

export function saveEnvironmentSnapshot(snapshot: EnvironmentSnapshot): void {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    const list: EnvironmentSnapshot[] = raw ? (JSON.parse(raw) as EnvironmentSnapshot[]) : [];
    list.push(snapshot);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list));
  } catch {
    /* quota */
  }
}

export function loadEnvironmentSnapshots(): EnvironmentSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    return raw ? (JSON.parse(raw) as EnvironmentSnapshot[]) : [];
  } catch {
    return [];
  }
}
