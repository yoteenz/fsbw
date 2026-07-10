import type { FlightContextOverlay, HeartbeatState } from '../types';

let sessionId = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
let bootStartedAt = Date.now();
let contextOverlay: FlightContextOverlay = {};
let reactRenderCount = 0;
let activeSubscriptionCount = 0;
let cachedHeartbeat: HeartbeatState | null = null;

export function getFlightSessionId(): string {
  return sessionId;
}

export function getBootStartedAt(): number {
  return bootStartedAt;
}

export function registerFlightContext(overlay: FlightContextOverlay): void {
  contextOverlay = { ...contextOverlay, ...overlay };
}

export function incrementReactRenderCount(): number {
  reactRenderCount += 1;
  return reactRenderCount;
}

export function getReactRenderCount(): number {
  return reactRenderCount;
}

export function incrementActiveSubscriptions(): number {
  activeSubscriptionCount += 1;
  return activeSubscriptionCount;
}

export function decrementActiveSubscriptions(): number {
  activeSubscriptionCount = Math.max(0, activeSubscriptionCount - 1);
  return activeSubscriptionCount;
}

export function getActiveSubscriptionCount(): number {
  return activeSubscriptionCount;
}

export function refreshHeartbeatState(): HeartbeatState | null {
  try {
    const win = window as unknown as {
      __MTD?: () => {
        heartbeat?: number;
        rafCount?: number;
        timeoutProbe?: number;
        frozen?: boolean;
        lastHeartbeatAt?: number;
      };
    };
    if (typeof win.__MTD !== 'function') return cachedHeartbeat;
    const snap = win.__MTD();
    cachedHeartbeat = {
      heartbeat: snap.heartbeat ?? 0,
      rafCount: snap.rafCount ?? 0,
      timeoutProbe: snap.timeoutProbe ?? 0,
      frozen: snap.frozen ?? false,
      lastHeartbeatAt: snap.lastHeartbeatAt ?? 0,
    };
    return cachedHeartbeat;
  } catch {
    return cachedHeartbeat;
  }
}

export function readRegistryVersion(): string | null {
  try {
    const raw = localStorage.getItem('genesis_v1');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { frameworkVersion?: string; version?: string };
    return parsed.frameworkVersion ?? parsed.version ?? null;
  } catch {
    return null;
  }
}

export function readCompanyLabel(): string | null {
  try {
    const ws = localStorage.getItem('studioOsActiveWorkspaceId');
    if (ws) return ws;
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user) as { email?: string };
      return parsed.email ?? null;
    }
  } catch {
    /* ignore */
  }
  return contextOverlay.company ?? null;
}

export function gatherContextFields(): {
  route: string;
  browser: string;
  platform: string;
  company: string | null;
  stationId: string | null;
  shellId: string | null;
  compileRunId: string | null;
  heartbeatState: HeartbeatState | null;
  registryVersion: string | null;
  sceneStackVersion: string | null;
  reactRenderCount: number;
  activeSubscriptions: number;
  contextVersion: string | null;
  url: string;
  sessionId: string;
  bundleVersion: string | null;
  reactVersion: string | null;
} {
  const hb = refreshHeartbeatState();
  return {
    route: typeof window !== 'undefined' ? window.location.pathname : '',
    browser: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    company: readCompanyLabel(),
    stationId: contextOverlay.stationId ?? null,
    shellId: contextOverlay.shellId ?? null,
    compileRunId: contextOverlay.compileRunId ?? null,
    heartbeatState: hb,
    registryVersion: contextOverlay.registryVersion ?? readRegistryVersion(),
    sceneStackVersion: contextOverlay.sceneStackVersion ?? null,
    reactRenderCount,
    activeSubscriptions: activeSubscriptionCount,
    contextVersion: contextOverlay.contextVersion ?? null,
    url: typeof window !== 'undefined' ? window.location.href : '',
    sessionId,
    bundleVersion: import.meta.env.VITE_APP_VERSION ?? null,
    reactVersion: '19',
  };
}
