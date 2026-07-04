import type { ManualMissingTargetLog } from './types';
import { STUDIO_MANUAL_MISSING_TARGETS_KEY } from './constants';

export type ResolvedManualTarget = {
  element: HTMLElement | null;
  rect: DOMRect | null;
};

const SCROLL_OPTS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
};

type TargetStep = {
  id: string;
  moduleId: string;
  targetSelector?: string;
  animationType: string;
  spotlight: boolean;
};

export function logManualMissingTarget(entry: Omit<ManualMissingTargetLog, 'at'>): void {
  if (typeof window === 'undefined' || import.meta.env.PROD) return;
  try {
    const raw = sessionStorage.getItem(STUDIO_MANUAL_MISSING_TARGETS_KEY);
    const list: ManualMissingTargetLog[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, at: new Date().toISOString() });
    sessionStorage.setItem(STUDIO_MANUAL_MISSING_TARGETS_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    // ignore
  }
}

export function resolveManualTarget(step: TargetStep, route: string): ResolvedManualTarget {
  if (!step.targetSelector) return { element: null, rect: null };
  const element = document.querySelector(step.targetSelector) as HTMLElement | null;
  if (!element) {
    logManualMissingTarget({
      moduleId: step.moduleId,
      stepId: step.id,
      selector: step.targetSelector,
      route,
    });
    return { element: null, rect: null };
  }
  if (step.animationType === 'scroll' || step.spotlight) {
    element.scrollIntoView(SCROLL_OPTS);
  }
  return { element, rect: element.getBoundingClientRect() };
}

export function waitForManualTarget(
  step: TargetStep,
  route: string,
  maxMs = 2400,
  intervalMs = 120
): Promise<ResolvedManualTarget> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const result = resolveManualTarget(step, route);
      if (result.element || Date.now() - started >= maxMs) {
        resolve(result);
        return;
      }
      window.setTimeout(tick, intervalMs);
    };
    tick();
  });
}

export function readManualMissingTargetLogs(): ManualMissingTargetLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STUDIO_MANUAL_MISSING_TARGETS_KEY);
    return raw ? (JSON.parse(raw) as ManualMissingTargetLog[]) : [];
  } catch {
    return [];
  }
}
