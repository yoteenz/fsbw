import type { DesktopNotificationsLayout } from '../types/desktopNotifications';
import {
  cloneDesktopNotificationsLayout,
  DESKTOP_NOTIFICATIONS_LAYOUT_SEED,
} from '../constants/desktopNotificationsLayout';
import { DESKTOP_ALERTS_PATH } from '../constants/desktopNotifications';

const DEBUG_ENABLED_KEY = 'desktopNotificationsDebug:enabled';
const LAYOUT_OVERRIDE_KEY = 'desktopNotificationsDebug:layoutOverrides';

export const DESKTOP_NOTIFICATIONS_DEBUG_UPDATED_EVENT = 'desktopNotificationsDebugUpdated';

export function isDesktopNotificationsDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(DEBUG_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDesktopNotificationsDebugEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DEBUG_ENABLED_KEY, enabled ? '1' : '0');
    window.dispatchEvent(new Event(DESKTOP_NOTIFICATIONS_DEBUG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function toggleDesktopNotificationsDebug(): boolean {
  const next = !isDesktopNotificationsDebugEnabled();
  setDesktopNotificationsDebugEnabled(next);
  return next;
}

function readLayoutOverrides(): Partial<DesktopNotificationsLayout> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAYOUT_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DesktopNotificationsLayout>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDesktopNotificationsLayoutOverrides(layout: DesktopNotificationsLayout): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAYOUT_OVERRIDE_KEY, JSON.stringify(layout, null, 2));
    window.dispatchEvent(new Event(DESKTOP_NOTIFICATIONS_DEBUG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function clearDesktopNotificationsLayoutOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LAYOUT_OVERRIDE_KEY);
    window.dispatchEvent(new Event(DESKTOP_NOTIFICATIONS_DEBUG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function resolveDesktopNotificationsLayout(): DesktopNotificationsLayout {
  const base = cloneDesktopNotificationsLayout(DESKTOP_NOTIFICATIONS_LAYOUT_SEED);
  const overrides = readLayoutOverrides();
  if (!overrides) return base;

  return {
    rects: { ...base.rects, ...(overrides.rects ?? {}) },
  };
}

export function formatDesktopNotificationsLayoutForExport(layout: DesktopNotificationsLayout): string {
  return `// Paste into desktopNotificationsLayout.ts — DESKTOP_NOTIFICATIONS_LAYOUT_SEED
export const DESKTOP_NOTIFICATIONS_LAYOUT_SEED = ${JSON.stringify(layout, null, 2)} as const;`;
}

export async function copyDesktopNotificationsDebugText(text: string): Promise<boolean> {
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

export function registerDesktopNotificationsDebugShortcut(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onKeyDown = (event: KeyboardEvent) => {
    if (!event.ctrlKey || !event.shiftKey) return;
    if (event.key.toLowerCase() !== 'd') return;
    if (!window.location.pathname.startsWith(DESKTOP_ALERTS_PATH)) return;
    event.preventDefault();
    toggleDesktopNotificationsDebug();
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
