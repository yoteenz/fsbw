/**
 * Experience Engine Main-Thread Freeze Bisect™ — checkpoint ledger.
 * Low-frequency writes only (enter/exit boundaries). Latest checkpoint mirrored to sessionStorage.
 */

export type FreezeCheckpointPhase = 'enter' | 'exit';

export type FreezeCheckpoint = {
  route: string;
  stage: number;
  component: string;
  function: string;
  phase: FreezeCheckpointPhase;
  timestamp: number;
  renderCount: number;
  effectCount: number;
  detail?: string;
};

const RING_KEY = 'eeFreezeTraceRing_v1';
const LATEST_KEY = 'eeFreezeLatestCheckpoint_v1';
const REPORT_KEY = 'eeFreezeBisectReport_v1';
const MAX_RING = 48;

let renderCount = 0;
let effectCount = 0;

export function incrementBisectRenderCount(): number {
  renderCount += 1;
  return renderCount;
}

export function incrementBisectEffectCount(): number {
  effectCount += 1;
  return effectCount;
}

export function getBisectRenderCounts(): { renderCount: number; effectCount: number } {
  return { renderCount, effectCount };
}

function readRing(): FreezeCheckpoint[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(RING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FreezeCheckpoint[];
  } catch {
    return [];
  }
}

function writeRing(ring: FreezeCheckpoint[]): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(RING_KEY, JSON.stringify(ring.slice(-MAX_RING)));
  } catch {
    /* quota */
  }
}

function mirrorLatest(cp: FreezeCheckpoint): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(LATEST_KEY, JSON.stringify(cp));
  } catch {
    /* quota */
  }
}

/** Record a boundary checkpoint — call only at stage/function enter/exit. */
export function recordFreezeCheckpoint(input: Omit<FreezeCheckpoint, 'timestamp' | 'renderCount' | 'effectCount'>): void {
  const cp: FreezeCheckpoint = {
    ...input,
    timestamp: Date.now(),
    renderCount,
    effectCount,
  };
  const ring = readRing();
  ring.push(cp);
  writeRing(ring);
  mirrorLatest(cp);

  try {
    const win = window as unknown as { __EE_FREEZE_LATEST__?: FreezeCheckpoint };
    win.__EE_FREEZE_LATEST__ = cp;
  } catch {
    /* ignore */
  }
}

export function getFreezeTraceRing(): FreezeCheckpoint[] {
  return readRing();
}

export function getLatestFreezeCheckpoint(): FreezeCheckpoint | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LATEST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FreezeCheckpoint;
  } catch {
    return null;
  }
}

export type BisectSessionReport = {
  savedAt: string;
  route: string;
  targetStage: number;
  completedStage: number;
  privateMode: boolean;
  visibilityState: string;
  mtdSnapshot: Record<string, unknown> | null;
  cssAnimationRunning: boolean | null;
  authPresent: boolean;
  genesisBytes: number;
  lastCheckpoint: FreezeCheckpoint | null;
  ring: FreezeCheckpoint[];
  renderCounts: { renderCount: number; effectCount: number };
  userAgent: string;
};

export function saveBisectSessionReport(report: Omit<BisectSessionReport, 'savedAt'>): void {
  if (typeof sessionStorage === 'undefined') return;
  const full: BisectSessionReport = { ...report, savedAt: new Date().toISOString() };
  try {
    sessionStorage.setItem(REPORT_KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
}

export function loadBisectSessionReport(): BisectSessionReport | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(REPORT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BisectSessionReport;
  } catch {
    return null;
  }
}

export function clearFreezeTrace(): void {
  renderCount = 0;
  effectCount = 0;
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(RING_KEY);
    sessionStorage.removeItem(LATEST_KEY);
  } catch {
    /* ignore */
  }
}
