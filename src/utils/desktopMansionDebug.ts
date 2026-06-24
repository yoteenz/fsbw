import type {
  MansionDebugDisplayMode,
  MansionDebugFilterGroup,
  MansionDebugFilterState,
  MansionDebugPageFilter,
} from '../types/desktopMansionDebug';
import { isDesktopPreviewEnvironment } from './desktopPreview';

export const MANSION_DEBUG_ENABLED_KEY = 'mansionDebug:enabled';
export const MANSION_DEBUG_DISPLAY_MODE_KEY = 'mansionDebug:displayMode';
export const MANSION_DEBUG_PAGE_FILTER_KEY = 'mansionDebug:pageFilter';
export const MANSION_DEBUG_FILTERS_KEY = 'mansionDebug:filters';
export const MANSION_DEBUG_UPDATED_EVENT = 'mansionDebugUpdated';

import type { MansionDebugCategory } from '../types/desktopMansionDebug';

export const MANSION_DEBUG_CATEGORY_COLORS: Record<MansionDebugCategory, string> = {
  navigation: '#ef4444',
  'information-panel': '#3b82f6',
  'clickable-destination': '#22c55e',
  'elevator-control': '#a855f7',
  'room-hotspot': '#f97316',
  'rewards-economy': '#eab308',
};

export const MANSION_DEBUG_FILTER_GROUP_LABELS: Record<MansionDebugFilterGroup, string> = {
  'membership-panels': 'Membership Panels',
  'economy-panels': 'Economy Panels',
  'directory-panels': 'Directory Panels',
  'welcome-panels': 'Welcome Panels',
  'house-information-panels': 'House Information Panels',
  'elevator-areas': 'Elevator Areas',
  'room-hotspots': 'Room Hotspots',
  'navigation-areas': 'Navigation Areas',
};

export const MANSION_DEBUG_FILTER_GROUPS = Object.keys(
  MANSION_DEBUG_FILTER_GROUP_LABELS,
) as MansionDebugFilterGroup[];

export const MANSION_DEBUG_PAGE_FILTER_OPTIONS: { id: MansionDebugPageFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lobby', label: 'Lobby Only' },
  { id: 'gallery', label: 'Gallery Only' },
  { id: 'penthouse', label: 'Penthouse Only' },
  { id: 'concierge', label: 'Concierge Only' },
];

/** Local `npm run dev` or staging/preview hosts (not production custom domain). */
export function isMansionDebugAvailable(): boolean {
  if (import.meta.env.DEV) return true;
  return isDesktopPreviewEnvironment();
}

function readSession(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, value);
    window.dispatchEvent(new Event(MANSION_DEBUG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function isMansionDebugEnabled(): boolean {
  if (!isMansionDebugAvailable()) return false;
  return readSession(MANSION_DEBUG_ENABLED_KEY) === '1';
}

export function setMansionDebugEnabled(enabled: boolean): void {
  if (!isMansionDebugAvailable()) return;
  writeSession(MANSION_DEBUG_ENABLED_KEY, enabled ? '1' : '0');
}

export function toggleMansionDebugEnabled(): boolean {
  const next = !isMansionDebugEnabled();
  setMansionDebugEnabled(next);
  return next;
}

export function getMansionDebugDisplayMode(): MansionDebugDisplayMode {
  const raw = readSession(MANSION_DEBUG_DISPLAY_MODE_KEY);
  if (raw === 'labels' || raw === 'boundaries' || raw === 'full') return raw;
  return 'full';
}

export function setMansionDebugDisplayMode(mode: MansionDebugDisplayMode): void {
  if (!isMansionDebugAvailable()) return;
  writeSession(MANSION_DEBUG_DISPLAY_MODE_KEY, mode);
}

export function getMansionDebugPageFilter(): MansionDebugPageFilter {
  const raw = readSession(MANSION_DEBUG_PAGE_FILTER_KEY);
  if (!raw || raw === 'all') return 'all';
  return raw as MansionDebugPageFilter;
}

export function setMansionDebugPageFilter(filter: MansionDebugPageFilter): void {
  if (!isMansionDebugAvailable()) return;
  writeSession(MANSION_DEBUG_PAGE_FILTER_KEY, filter);
}

export function createDefaultMansionDebugFilters(): MansionDebugFilterState {
  return MANSION_DEBUG_FILTER_GROUPS.reduce(
    (acc, group) => {
      acc[group] = true;
      return acc;
    },
    {} as MansionDebugFilterState,
  );
}

export function getMansionDebugFilters(): MansionDebugFilterState {
  const defaults = createDefaultMansionDebugFilters();
  const raw = readSession(MANSION_DEBUG_FILTERS_KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<MansionDebugFilterState>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function setMansionDebugFilters(filters: MansionDebugFilterState): void {
  if (!isMansionDebugAvailable()) return;
  writeSession(MANSION_DEBUG_FILTERS_KEY, JSON.stringify(filters));
}

export function formatMansionDebugLabel(label: string): string {
  return label.trim().replace(/\s+/g, '_').toUpperCase();
}

export function shouldIgnoreMansionDebugShortcut(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

export function registerMansionDebugShortcut(handler: (event: KeyboardEvent) => void): () => void {
  if (!isMansionDebugAvailable() || typeof window === 'undefined') return () => undefined;

  const onKeyDown = (event: KeyboardEvent) => {
    if (shouldIgnoreMansionDebugShortcut(event.target)) return;
    if (event.key !== 'd' && event.key !== 'D') return;
    handler(event);
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
