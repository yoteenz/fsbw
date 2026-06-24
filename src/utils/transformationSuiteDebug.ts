import type { TransformationSuiteLayout } from '../types/transformationSuite';
import {
  cloneTransformationSuiteLayout,
  TRANSFORMATION_SUITE_LAYOUT_SEED,
} from '../constants/transformationSuiteLayout';

const DEBUG_ENABLED_KEY = 'transformationSuiteDebug:enabled';
const LAYOUT_OVERRIDE_KEY = 'transformationSuiteDebug:layoutOverrides';

export const TRANSFORMATION_SUITE_DEBUG_UPDATED_EVENT = 'transformationSuiteDebugUpdated';

export function isTransformationSuiteDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(DEBUG_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setTransformationSuiteDebugEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DEBUG_ENABLED_KEY, enabled ? '1' : '0');
    window.dispatchEvent(new Event(TRANSFORMATION_SUITE_DEBUG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function toggleTransformationSuiteDebug(): boolean {
  const next = !isTransformationSuiteDebugEnabled();
  setTransformationSuiteDebugEnabled(next);
  return next;
}

function readLayoutOverrides(): Partial<TransformationSuiteLayout> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAYOUT_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TransformationSuiteLayout>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTransformationSuiteLayoutOverrides(layout: TransformationSuiteLayout): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAYOUT_OVERRIDE_KEY, JSON.stringify(layout, null, 2));
    window.dispatchEvent(new Event(TRANSFORMATION_SUITE_DEBUG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function clearTransformationSuiteLayoutOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LAYOUT_OVERRIDE_KEY);
    window.dispatchEvent(new Event(TRANSFORMATION_SUITE_DEBUG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Effective layout: seed from config + optional local debug overrides. */
export function resolveTransformationSuiteLayout(): TransformationSuiteLayout {
  const base = cloneTransformationSuiteLayout(TRANSFORMATION_SUITE_LAYOUT_SEED);
  const overrides = readLayoutOverrides();
  if (!overrides) return base;

  return {
    rects: { ...base.rects, ...(overrides.rects ?? {}) },
    circles: { ...base.circles, ...(overrides.circles ?? {}) },
  };
}

export function formatTransformationSuiteLayoutForExport(layout: TransformationSuiteLayout): string {
  return `// Paste into transformationSuiteLayout.ts — TRANSFORMATION_SUITE_LAYOUT_SEED
export const TRANSFORMATION_SUITE_LAYOUT_SEED = ${JSON.stringify(layout, null, 2)} as const;`;
}

export async function copyTransformationSuiteDebugText(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function registerTransformationSuiteDebugShortcut(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onKeyDown = (event: KeyboardEvent) => {
    if (!event.ctrlKey || !event.shiftKey) return;
    if (event.key.toLowerCase() !== 'd') return;
    if (!window.location.pathname.startsWith('/desktop/booking-suite')) return;
    event.preventDefault();
    toggleTransformationSuiteDebug();
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
