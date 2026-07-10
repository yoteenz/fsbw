/**
 * Three independent freeze signals for Experience Engine bisect.
 * A = RAF, B = setTimeout, C = CSS animation (no JS driver).
 */

export type FreezeSignalSnapshot = {
  rafCount: number;
  timeoutCount: number;
  cssPulseCount: number;
  rafAlive: boolean;
  timeoutAlive: boolean;
  cssAlive: boolean;
  interpretation: string;
  capturedAt: number;
};

let cssPulseObserver: MutationObserver | null = null;
let cssPulseCount = 0;
let lastCssPulseAt = 0;

/** Attach a MutationObserver to count CSS animation iterations via data attribute toggles. */
export function initCssHeartbeatProbe(el: HTMLElement | null): () => void {
  if (!el) return () => undefined;
  cssPulseCount = 0;
  lastCssPulseAt = Date.now();

  const onAnim = () => {
    cssPulseCount += 1;
    lastCssPulseAt = Date.now();
  };
  el.addEventListener('animationiteration', onAnim);

  return () => {
    el.removeEventListener('animationiteration', onAnim);
    cssPulseObserver?.disconnect();
    cssPulseObserver = null;
  };
}

function readMtdCounts(): { raf: number; timeout: number; hb: number } {
  try {
    const win = window as unknown as {
      __MTD?: () => { rafCount?: number; timeoutProbe?: number; heartbeat?: number };
    };
    const snap = typeof win.__MTD === 'function' ? win.__MTD() : null;
    return {
      raf: snap?.rafCount ?? -1,
      timeout: snap?.timeoutProbe ?? -1,
      hb: snap?.heartbeat ?? -1,
    };
  } catch {
    return { raf: -1, timeout: -1, hb: -1 };
  }
}

export function interpretFreezeSignals(
  prev: { raf: number; timeout: number; css: number } | null,
  next: { raf: number; timeout: number; css: number }
): Pick<FreezeSignalSnapshot, 'rafAlive' | 'timeoutAlive' | 'cssAlive' | 'interpretation'> {
  const rafAlive = prev == null || next.raf > prev.raf;
  const timeoutAlive = prev == null || next.timeout > prev.timeout;
  const cssAlive = prev == null || next.css > prev.css;

  let interpretation = 'Monitoring…';
  if (prev != null) {
    if (!rafAlive && !timeoutAlive && cssAlive) {
      interpretation = 'JS main thread blocked (RAF + timeout stopped; CSS continues)';
    } else if (!rafAlive && !timeoutAlive && !cssAlive) {
      interpretation = 'Full stall — rendering/compositor or tab frozen (all three stopped)';
    } else if (!rafAlive && timeoutAlive) {
      interpretation = 'Rendering loop failure (RAF stopped; timeout continues)';
    } else if (rafAlive && timeoutAlive && !cssAlive) {
      interpretation = 'CSS/compositor issue (JS heartbeats continue)';
    } else if (rafAlive && timeoutAlive && cssAlive) {
      interpretation = 'All signals alive — not a main-thread freeze';
    }
  }

  return { rafAlive, timeoutAlive, cssAlive, interpretation };
}

export function sampleFreezeSignals(
  prev: { raf: number; timeout: number; css: number } | null
): { snapshot: FreezeSignalSnapshot; prev: { raf: number; timeout: number; css: number } } {
  const mtd = readMtdCounts();
  const css = cssPulseCount;
  const signal = interpretFreezeSignals(prev, { raf: mtd.raf, timeout: mtd.timeout, css });
  const snapshot: FreezeSignalSnapshot = {
    rafCount: mtd.raf,
    timeoutCount: mtd.timeout,
    cssPulseCount: css,
    ...signal,
    capturedAt: Date.now(),
  };
  return {
    snapshot,
    prev: { raf: mtd.raf, timeout: mtd.timeout, css },
  };
}

export function getCssPulseMeta(): { count: number; lastAt: number } {
  return { count: cssPulseCount, lastAt: lastCssPulseAt };
}
