/**
 * Main-thread freeze diagnostics — plain DOM, independent of React.
 * Heartbeat + trace ring buffer + circuit breakers + startup bisection.
 */

export const STARTUP_STAGES = {
  A: 'react-root',
  B: 'router-mount',
  C: 'provider-tree',
  D: 'studio-bootstrap',
  E: 'auth-session',
  F: 'platform-dna',
  G: 'registry-init',
  H: 'workspace-init',
  I: 'route-guards',
  J: 'experience-runtime',
  K: 'post-load-guard',
} as const;

export type StartupStageId = keyof typeof STARTUP_STAGES;
export type StartupStageName = (typeof STARTUP_STAGES)[StartupStageId];

export type TraceEvent = {
  ts: number;
  kind: 'enter' | 'exit' | 'warn' | 'breaker' | 'checkpoint' | 'info';
  name: string;
  depth: number;
  callCount: number;
  durationMs?: number;
  detail?: string;
};

export type MainThreadDiagnosticsSnapshot = {
  heartbeat: number;
  rafCount: number;
  timeoutProbe: number;
  lastHeartbeatAt: number;
  lastRafAt: number;
  lastTimeoutAt: number;
  longTaskCount: number;
  lastLongTaskMs: number;
  frozen: boolean;
  currentCheckpoint: string;
  bootstrapPhase: string;
  activeModule: string;
  kernelInstanceId: string;
  trace: TraceEvent[];
  breakers: string[];
  startupEnabled: Record<StartupStageId, boolean>;
};

const STAGE_ORDER: StartupStageId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

const MAX_TRACE = 120;
const MAX_LOG_PER_FN = 40;
const LOG_SAMPLE_AFTER = 20;

let initialized = false;
let kernelInstanceId = `kernel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
let heartbeat = 0;
let rafCount = 0;
let timeoutProbe = 0;
let lastHeartbeatAt = 0;
let lastRafAt = 0;
let lastTimeoutAt = 0;
let longTaskCount = 0;
let lastLongTaskMs = 0;
let frozen = false;
let currentCheckpoint = 'pre-init';
let bootstrapPhase = 'idle';
let activeModule = 'none';
let overlayEl: HTMLDivElement | null = null;
let heartbeatEl: HTMLElement | null = null;
let rafEl: HTMLElement | null = null;
let timeoutEl: HTMLElement | null = null;
let checkpointEl: HTMLElement | null = null;
let longTaskEl: HTMLElement | null = null;

const traceRing: TraceEvent[] = [];
const fnCallCounts = new Map<string, number>();
const fnDepth = new Map<string, number>();
const fnLogCounts = new Map<string, number>();
const trippedBreakers = new Set<string>();
const startupEnabled: Record<StartupStageId, boolean> = {
  A: true,
  B: true,
  C: true,
  D: true,
  E: true,
  F: true,
  G: true,
  H: true,
  I: true,
  J: true,
  K: true,
};

let bootstrapActive = 0;
let dispatchDepth = 0;
let redirectWindowStart = 0;
let redirectCount = 0;
let providerRenderWindowStart = 0;
let providerRenderCount = 0;
let lastStateTransitionKey = '';
let loadingLockOwner: string | null = null;
let initPhaseOnce = false;

function parseStartupFlags(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const max = params.get('startupMax')?.toUpperCase() as StartupStageId | null;
    const disable = params.get('startupDisable')?.split(',').map((s) => s.trim().toUpperCase()) ?? [];
    const sessionMax = sessionStorage.getItem('startupMax')?.toUpperCase() as StartupStageId | null;
    const sessionDisable = sessionStorage.getItem('startupDisable')?.split(',').map((s) => s.trim().toUpperCase()) ?? [];

    const effectiveMax = max ?? sessionMax;
    if (effectiveMax && STAGE_ORDER.includes(effectiveMax)) {
      const maxIdx = STAGE_ORDER.indexOf(effectiveMax);
      for (let i = 0; i < STAGE_ORDER.length; i += 1) {
        startupEnabled[STAGE_ORDER[i]] = i <= maxIdx;
      }
    }

    for (const id of [...disable, ...sessionDisable]) {
      if (id in startupEnabled) startupEnabled[id as StartupStageId] = false;
    }
  } catch {
    /* ignore */
  }
}

export function isStartupStageEnabled(stage: StartupStageId): boolean {
  return startupEnabled[stage] ?? true;
}

/** Hide the corner overlay by default; opt in with ?heartbeat=1 or on /__thread-heartbeat. */
export function shouldHideHeartbeatOverlay(): boolean {
  if (typeof window === 'undefined') return true;
  const params = new URLSearchParams(window.location.search);
  if (params.get('heartbeat') === '1') return false;
  if (window.location.pathname.startsWith('/__thread-heartbeat')) return false;
  return true;
}

function pushTrace(event: TraceEvent): void {
  traceRing.push(event);
  if (traceRing.length > MAX_TRACE) traceRing.shift();
}

function shouldLogFn(name: string): boolean {
  const n = (fnLogCounts.get(name) ?? 0) + 1;
  fnLogCounts.set(name, n);
  if (n <= MAX_LOG_PER_FN) return true;
  if (n === LOG_SAMPLE_AFTER + 1) return true;
  return n % 50 === 0;
}

export function recordTraceEvent(
  kind: TraceEvent['kind'],
  name: string,
  detail?: string,
  durationMs?: number
): void {
  const callCount = fnCallCounts.get(name) ?? 0;
  pushTrace({
    ts: Date.now(),
    kind,
    name,
    depth: fnDepth.get(name) ?? 0,
    callCount,
    durationMs,
    detail,
  });
}

export function markStartupCheckpoint(id: string, label?: string): void {
  currentCheckpoint = label ? `${id}:${label}` : id;
  recordTraceEvent('checkpoint', id, label);
  updateOverlay();
}

export function setBootstrapPhase(phase: string, moduleId = 'none'): void {
  bootstrapPhase = phase;
  activeModule = moduleId;
  updateOverlay();
}

function updateOverlay(): void {
  if (!overlayEl) return;
  if (heartbeatEl) heartbeatEl.textContent = String(heartbeat);
  if (rafEl) rafEl.textContent = String(rafCount);
  if (timeoutEl) timeoutEl.textContent = String(timeoutProbe);
  if (checkpointEl) checkpointEl.textContent = currentCheckpoint;
  if (longTaskEl) longTaskEl.textContent = `${longTaskCount} (last ${lastLongTaskMs.toFixed(0)}ms)`;
}

function showBreakerOverlay(
  breakerName: string,
  fnName: string,
  callCount: number,
  detail?: string
): void {
  if (typeof document === 'undefined' || trippedBreakers.has('overlay-shown')) return;
  trippedBreakers.add('overlay-shown');
  frozen = true;

  const panel = document.createElement('div');
  panel.id = 'main-thread-loop-prevented';
  panel.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;background:#1a0000;color:#fff;font:12px/1.4 system-ui,sans-serif;padding:16px;overflow:auto;box-sizing:border-box;';
  const last30 = traceRing.slice(-30);
  panel.innerHTML = `
    <h1 style="margin:0 0 8px;font-size:18px;color:#ff6b6b">MAIN THREAD LOOP PREVENTED</h1>
    <p style="margin:0 0 12px"><strong>Breaker:</strong> ${breakerName}</p>
    <p style="margin:0 0 12px"><strong>Function:</strong> ${fnName} · calls=${callCount}</p>
    <p style="margin:0 0 12px"><strong>URL:</strong> ${window.location.href}</p>
    <p style="margin:0 0 12px"><strong>Bootstrap phase:</strong> ${bootstrapPhase} · module=${activeModule}</p>
    <p style="margin:0 0 12px"><strong>Kernel:</strong> ${kernelInstanceId} · checkpoint=${currentCheckpoint}</p>
    ${detail ? `<pre style="white-space:pre-wrap;background:#300;padding:8px;border-radius:4px">${detail.replace(/</g, '&lt;')}</pre>` : ''}
    <p style="margin:12px 0 6px;font-weight:700">Last 30 trace events</p>
    <pre style="white-space:pre-wrap;background:#111;padding:8px;border-radius:4px;max-height:320px;overflow:auto;font-size:11px">${last30
      .map(
        (e) =>
          `${new Date(e.ts).toISOString().slice(11, 23)} ${e.kind.padEnd(10)} d=${e.depth} ${e.name}${e.detail ? ` — ${e.detail}` : ''}${e.durationMs != null ? ` (${e.durationMs.toFixed(1)}ms)` : ''}`
      )
      .join('\n')
      .replace(/</g, '&lt;')}</pre>
    <p style="margin-top:12px"><a href="/__thread-heartbeat" style="color:#7dd3fc">/__thread-heartbeat</a> · <a href="/__boot-debug" style="color:#7dd3fc">/__boot-debug</a></p>
  `;
  document.body.appendChild(panel);
}

export function tripCircuitBreaker(breakerName: string, fnName: string, detail?: string): never {
  trippedBreakers.add(breakerName);
  const callCount = fnCallCounts.get(fnName) ?? 0;
  recordTraceEvent('breaker', fnName, `${breakerName}: ${detail ?? ''}`);
  showBreakerOverlay(breakerName, fnName, callCount, detail);
  throw new Error(`[main-thread-diagnostics] circuit breaker: ${breakerName} in ${fnName}`);
}

export function assertBootstrapStartOnce(fnName: string): void {
  bootstrapActive += 1;
  if (bootstrapActive > 1) {
    tripCircuitBreaker('bootstrap-max-active', fnName, `active=${bootstrapActive}`);
  }
}

export function releaseBootstrapStart(fnName: string): void {
  bootstrapActive = Math.max(0, bootstrapActive - 1);
  recordTraceEvent('exit', fnName, 'bootstrap-active-released');
}

export function enterDispatchDepth(fnName: string): void {
  dispatchDepth += 1;
  if (dispatchDepth > 10) {
    tripCircuitBreaker('dispatch-recursion-depth', fnName, `depth=${dispatchDepth}`);
  }
}

export function exitDispatchDepth(): void {
  dispatchDepth = Math.max(0, dispatchDepth - 1);
}

export function recordNavigationRedirect(from: string, to: string, fnName: string): void {
  const now = Date.now();
  if (now - redirectWindowStart > 10_000) {
    redirectWindowStart = now;
    redirectCount = 0;
  }
  redirectCount += 1;
  recordTraceEvent('warn', fnName, `redirect ${from} → ${to} (#${redirectCount}/10s)`);
  if (redirectCount > 5) {
    tripCircuitBreaker('navigation-redirect-limit', fnName, `${redirectCount} redirects in 10s`);
  }
}

export function recordProviderRender(providerName: string): void {
  const now = Date.now();
  if (now - providerRenderWindowStart > 5000) {
    providerRenderWindowStart = now;
    providerRenderCount = 0;
  }
  providerRenderCount += 1;
  if (providerRenderCount === 50) {
    recordTraceEvent('warn', providerName, `50 renders in 5s`);
  }
  if (providerRenderCount > 80) {
    tripCircuitBreaker('provider-render-storm', providerName, `${providerRenderCount} renders in 5s`);
  }
}

export function ignoreDuplicateStateTransition(key: string): boolean {
  if (key === lastStateTransitionKey) return true;
  lastStateTransitionKey = key;
  return false;
}

export function acquireLoadingLockDiagnostic(owner: string): boolean {
  if (loadingLockOwner && loadingLockOwner !== owner) {
    recordTraceEvent('warn', 'loading-lock', `duplicate acquire by ${owner} (held by ${loadingLockOwner})`);
    return false;
  }
  loadingLockOwner = owner;
  return true;
}

export function releaseLoadingLockDiagnostic(owner: string): void {
  if (loadingLockOwner === owner) loadingLockOwner = null;
}

export function assertInitPhaseOnce(fnName: string): void {
  if (initPhaseOnce) {
    recordTraceEvent('warn', fnName, 'init phase invoked again (idempotent skip)');
    return;
  }
  initPhaseOnce = true;
}

export function traceSync<T>(name: string, fn: () => T, caller?: string): T {
  const count = (fnCallCounts.get(name) ?? 0) + 1;
  fnCallCounts.set(name, count);
  const depth = (fnDepth.get(name) ?? 0) + 1;
  fnDepth.set(name, depth);
  if (shouldLogFn(name)) {
    recordTraceEvent('enter', name, caller ? `caller=${caller}` : undefined);
  }
  const start = performance.now();
  try {
    return fn();
  } finally {
    const durationMs = performance.now() - start;
    fnDepth.set(name, Math.max(0, depth - 1));
    if (shouldLogFn(name)) {
      recordTraceEvent('exit', name, undefined, durationMs);
    }
    if (durationMs > 200 && shouldLogFn(`${name}:slow`)) {
      recordTraceEvent('warn', name, `slow sync ${durationMs.toFixed(0)}ms`, durationMs);
    }
  }
}

export async function traceAsync<T>(name: string, fn: () => Promise<T>, caller?: string): Promise<T> {
  const count = (fnCallCounts.get(name) ?? 0) + 1;
  fnCallCounts.set(name, count);
  const depth = (fnDepth.get(name) ?? 0) + 1;
  fnDepth.set(name, depth);
  if (shouldLogFn(name)) {
    recordTraceEvent('enter', name, caller ? `caller=${caller}` : undefined);
  }
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const durationMs = performance.now() - start;
    fnDepth.set(name, Math.max(0, depth - 1));
    if (shouldLogFn(name)) {
      recordTraceEvent('exit', name, undefined, durationMs);
    }
  }
}

export function getMainThreadDiagnosticsSnapshot(): MainThreadDiagnosticsSnapshot {
  const now = Date.now();
  const stale = now - lastHeartbeatAt > 750;
  return {
    heartbeat,
    rafCount,
    timeoutProbe,
    lastHeartbeatAt,
    lastRafAt,
    lastTimeoutAt,
    longTaskCount,
    lastLongTaskMs,
    frozen: frozen || stale,
    currentCheckpoint,
    bootstrapPhase,
    activeModule,
    kernelInstanceId,
    trace: [...traceRing],
    breakers: [...trippedBreakers],
    startupEnabled: { ...startupEnabled },
  };
}

function mountEmergencyOverlay(): void {
  if (typeof document === 'undefined' || shouldHideHeartbeatOverlay()) return;
  if (document.getElementById('main-thread-heartbeat-overlay')) return;

  overlayEl = document.createElement('div');
  overlayEl.id = 'main-thread-heartbeat-overlay';
  overlayEl.style.cssText =
    'position:fixed;bottom:8px;right:8px;z-index:2147483646;background:rgba(0,0,0,0.82);color:#0f0;font:11px/1.35 ui-monospace,monospace;padding:6px 8px;border-radius:4px;pointer-events:none;max-width:240px;';
  overlayEl.innerHTML = `
    <div style="color:#7dd3fc;font-weight:700;margin-bottom:2px">MT heartbeat</div>
    <div>hb: <span data-mtd-hb>0</span> · raf: <span data-mtd-raf>0</span> · to: <span data-mtd-to>0</span></div>
    <div>ckpt: <span data-mtd-ckpt>pre-init</span></div>
    <div>long: <span data-mtd-long>0</span></div>
  `;
  heartbeatEl = overlayEl.querySelector('[data-mtd-hb]');
  rafEl = overlayEl.querySelector('[data-mtd-raf]');
  timeoutEl = overlayEl.querySelector('[data-mtd-to]');
  checkpointEl = overlayEl.querySelector('[data-mtd-ckpt]');
  longTaskEl = overlayEl.querySelector('[data-mtd-long]');
  document.documentElement.appendChild(overlayEl);
}

function startHeartbeat(): void {
  window.setInterval(() => {
    heartbeat += 1;
    lastHeartbeatAt = Date.now();
    updateOverlay();
  }, 250);

  const rafLoop = () => {
    rafCount += 1;
    lastRafAt = Date.now();
    updateOverlay();
    window.requestAnimationFrame(rafLoop);
  };
  window.requestAnimationFrame(rafLoop);

  const timeoutLoop = () => {
    timeoutProbe += 1;
    lastTimeoutAt = Date.now();
    updateOverlay();
    window.setTimeout(timeoutLoop, 250);
  };
  window.setTimeout(timeoutLoop, 250);
}

function startLongTaskObserver(): void {
  try {
    if (typeof PerformanceObserver === 'undefined') return;
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration < 50) continue;
        longTaskCount += 1;
        lastLongTaskMs = entry.duration;
        if (entry.duration >= 200) {
          recordTraceEvent('warn', 'long-task', `${entry.duration.toFixed(0)}ms`, entry.duration);
        }
        updateOverlay();
      }
    });
    obs.observe({ entryTypes: ['longtask'] });
  } catch {
    /* longtask not supported */
  }
}

/** Install heartbeat, trace buffer, and circuit breakers — call before any app init. */
export function initMainThreadDiagnostics(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  parseStartupFlags();
  markStartupCheckpoint('0', 'diagnostics-init');
  mountEmergencyOverlay();
  startHeartbeat();
  startLongTaskObserver();

  (window as unknown as { __MTD?: typeof getMainThreadDiagnosticsSnapshot }).__MTD =
    getMainThreadDiagnosticsSnapshot;

  recordTraceEvent('info', 'initMainThreadDiagnostics', kernelInstanceId);
}
