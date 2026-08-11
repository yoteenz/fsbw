/** Persists Lounge TV open + browse tab across refresh on the lounge slide only (tab session). */
const LOUNGE_TV_SESSION_OPEN_KEY = 'loungeTvSessionOpen';
const LOUNGE_TV_SESSION_MAIN_TAB_KEY = 'loungeTvSessionMainTab';
const LOUNGE_TV_SESSION_SIDEBAR_ID_KEY = 'loungeTvSessionSidebarId';

const LOUNGE_TV_MAIN_TAB_VALUES = ['featured', 'learn', 'explore', 'live', 'library'] as const;
export type LoungeTvSessionMainTab = (typeof LOUNGE_TV_MAIN_TAB_VALUES)[number];

function isLoungeTvSessionMainTab(value: string | null): value is LoungeTvSessionMainTab {
  if (!value) return false;
  return (LOUNGE_TV_MAIN_TAB_VALUES as readonly string[]).includes(value);
}

export function readLoungeTvSessionOpen(): boolean {
  try {
    return sessionStorage.getItem(LOUNGE_TV_SESSION_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

function clearLoungeTvSessionBrowseState(): void {
  try {
    sessionStorage.removeItem(LOUNGE_TV_SESSION_MAIN_TAB_KEY);
    sessionStorage.removeItem(LOUNGE_TV_SESSION_SIDEBAR_ID_KEY);
  } catch {
    /* ignore */
  }
}

export function writeLoungeTvSessionOpen(open: boolean): void {
  try {
    if (open) sessionStorage.setItem(LOUNGE_TV_SESSION_OPEN_KEY, '1');
    else {
      sessionStorage.removeItem(LOUNGE_TV_SESSION_OPEN_KEY);
      clearLoungeTvSessionBrowseState();
    }
  } catch {
    /* ignore */
  }
}

export function readLoungeTvSessionMainTab(): LoungeTvSessionMainTab | null {
  try {
    const raw = sessionStorage.getItem(LOUNGE_TV_SESSION_MAIN_TAB_KEY);
    return isLoungeTvSessionMainTab(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function readLoungeTvSessionSidebarId(): string | null {
  try {
    return sessionStorage.getItem(LOUNGE_TV_SESSION_SIDEBAR_ID_KEY);
  } catch {
    return null;
  }
}

export function writeLoungeTvSessionBrowseState(
  mainTab: LoungeTvSessionMainTab,
  sidebarId: string
): void {
  try {
    sessionStorage.setItem(LOUNGE_TV_SESSION_MAIN_TAB_KEY, mainTab);
    if (sidebarId) sessionStorage.setItem(LOUNGE_TV_SESSION_SIDEBAR_ID_KEY, sidebarId);
    else sessionStorage.removeItem(LOUNGE_TV_SESSION_SIDEBAR_ID_KEY);
  } catch {
    /* ignore */
  }
}

/** Restore TV open on the lounge route when the session flag is set (survives refresh). */
export function readLoungeTvOpenRestoreAfterReload(onLoungeRoute: boolean): boolean {
  if (!onLoungeRoute) return false;
  return readLoungeTvSessionOpen();
}
