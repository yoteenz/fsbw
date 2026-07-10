import type { TimerRecord } from '../types';
import { recordFlightEvent } from '../flight-recorder/recorder';

let nextTimerId = 1;
const timers = new Map<number, TimerRecord>();
const nativeToInventory = new Map<number, number>();

function captureCaller(): string {
  try {
    const stack = new Error().stack ?? '';
    return stack.split('\n').slice(2, 5).join(' | ').trim().slice(0, 320);
  } catch {
    return 'unknown';
  }
}

function inferPurpose(caller: string): string | null {
  if (caller.includes('main-thread-diagnostics')) return 'MTD heartbeat/RAF/timeout probe';
  if (caller.includes('loadingTerminalRegistry')) return 'Loading screen watchdog';
  if (caller.includes('post-load-render-guard')) return 'Post-load render audit';
  if (caller.includes('StudioOrbProvider')) return 'Orb voice/keyboard timer';
  if (caller.includes('useCreativeStudioRenderPreview')) return 'Experience Lab pipeline clock';
  if (caller.includes('useGuardLoadingTimeout')) return 'Guard loading timeout';
  if (caller.includes('App.tsx')) return 'App-level interval';
  if (caller.includes('shellV2Heartbeat')) return 'Shell V2 heartbeat';
  return null;
}

function canRestartEngine(caller: string): boolean {
  return (
    caller.includes('studio-kernel') ||
    caller.includes('studio-bootstrap') ||
    caller.includes('bootstrapStudioOs') ||
    caller.includes('main-legacy') ||
    caller.includes('loadingTerminalRegistry')
  );
}

/** Wrap timers — observe only; original behavior unchanged. */
export function installTimerInventory(): () => void {
  const origSetTimeout = window.setTimeout.bind(window);
  const origSetInterval = window.setInterval.bind(window);
  const origClearTimeout = window.clearTimeout.bind(window);
  const origClearInterval = window.clearInterval.bind(window);
  const origRaf = window.requestAnimationFrame.bind(window);

  const register = (kind: TimerRecord['kind'], intervalMs: number | null): number => {
    const id = nextTimerId++;
    const caller = captureCaller();
    const rec: TimerRecord = {
      timerId: id,
      kind,
      intervalMs,
      caller,
      purpose: inferPurpose(caller),
      registeredAt: Date.now(),
      stateModified: null,
      canRestartEngine: canRestartEngine(caller),
    };
    timers.set(id, rec);
    recordFlightEvent('TIMER_REGISTERED', 'timer-inventory', {
      detail: { timerId: id, kind, intervalMs, caller, purpose: rec.purpose },
    });
    try {
      const win = window as unknown as { __STUDIO_OS_TIMER_INVENTORY__?: TimerRecord[] };
      win.__STUDIO_OS_TIMER_INVENTORY__ = getTimerInventory();
    } catch {
      /* ignore */
    }
    return id;
  };

  window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
    const invId = register('timeout', timeout ?? 0);
    const nativeId = origSetTimeout(handler as Parameters<typeof setTimeout>[0], timeout, ...(args as []));
    nativeToInventory.set(nativeId, invId);
    return nativeId;
  }) as typeof window.setTimeout;

  window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
    const invId = register('interval', timeout ?? 0);
    const nativeId = origSetInterval(handler as Parameters<typeof setInterval>[0], timeout, ...(args as []));
    nativeToInventory.set(nativeId, invId);
    return nativeId;
  }) as typeof window.setInterval;

  window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    recordFlightEvent('REQUEST_ANIMATION_FRAME', 'timer-inventory', {
      detail: { caller: captureCaller() },
    });
    return origRaf(callback);
  }) as typeof window.requestAnimationFrame;

  const clearNative = (kind: 'timeout' | 'interval', id: number) => {
    const invId = nativeToInventory.get(id);
    recordFlightEvent('TIMER_CLEARED', 'timer-inventory', { detail: { kind, timerId: invId ?? id } });
    if (kind === 'timeout') origClearTimeout(id);
    else origClearInterval(id);
  };

  window.clearTimeout = ((id: number) => clearNative('timeout', id)) as typeof window.clearTimeout;
  window.clearInterval = ((id: number) => clearNative('interval', id)) as typeof window.clearInterval;

  return () => {
    window.setTimeout = origSetTimeout;
    window.setInterval = origSetInterval;
    window.requestAnimationFrame = origRaf;
    window.clearTimeout = origClearTimeout;
    window.clearInterval = origClearInterval;
  };
}

export function getTimerInventory(): TimerRecord[] {
  return [...timers.values()];
}

/** Timers with ~3000ms interval — candidate for ~3s reset cadence. */
export function findThreeSecondTimers(): TimerRecord[] {
  return getTimerInventory().filter((t) => {
    if (t.intervalMs == null) return false;
    return t.intervalMs >= 2500 && t.intervalMs <= 3500;
  });
}
