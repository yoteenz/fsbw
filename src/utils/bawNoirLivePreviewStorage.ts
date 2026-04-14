/** Persist admin live NOIR preview triples (L, F, R) for Build-a-Wig hub + subpages. */

export const BAW_NOIR_LIVE_COLOR_VIEWS_EVENT = 'bawNoirLiveColorWigViewsUpdated';
export const BAW_NOIR_LIVE_STYLING_VIEWS_EVENT = 'bawNoirLiveStylingWigViewsUpdated';
export const BAW_NOIR_LIVE_BANGS_VIEWS_EVENT = 'bawNoirLiveBangsWigViewsUpdated';

const COLOR_KEY = 'bawNoirLiveColorWigViews';
/** In-progress fal previews on the color sub-page only — hub reads `COLOR_KEY` after confirm. */
const COLOR_PENDING_KEY = 'bawNoirLiveColorWigViewsPending';
const STYLING_KEY = 'bawNoirLiveStylingWigViews';
const BANGS_KEY = 'bawNoirLiveBangsWigViews';

export type BawNoirLiveWigViewsTriple = [string, string, string];

function dispatch(name: string) {
  try {
    window.dispatchEvent(new CustomEvent(name));
  } catch {
    /* ignore */
  }
}

function parseTriple(raw: string | null): BawNoirLiveWigViewsTriple | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    return [String(parsed[0]), String(parsed[1]), String(parsed[2])];
  } catch {
    return null;
  }
}

/** Stash WIP live color URLs while browsing the color sub-page — does not update the main BAW hub. */
export function persistPendingBawNoirLiveColorWigViews(views: BawNoirLiveWigViewsTriple): void {
  try {
    localStorage.setItem(COLOR_PENDING_KEY, JSON.stringify(views));
  } catch {
    /* ignore */
  }
}

export function readPendingBawNoirLiveColorWigViews(): BawNoirLiveWigViewsTriple | null {
  try {
    return parseTriple(localStorage.getItem(COLOR_PENDING_KEY));
  } catch {
    return null;
  }
}

export function clearPendingBawNoirLiveColorWigViews(): void {
  try {
    localStorage.removeItem(COLOR_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** Commit live color triple to hub + cross-tab sync (call from color sub-page confirm only). */
export function persistBawNoirLiveColorWigViews(views: BawNoirLiveWigViewsTriple): void {
  try {
    clearPendingBawNoirLiveColorWigViews();
    localStorage.setItem(COLOR_KEY, JSON.stringify(views));
    dispatch(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}

export function readBawNoirLiveColorWigViews(): BawNoirLiveWigViewsTriple | null {
  try {
    return parseTriple(localStorage.getItem(COLOR_KEY));
  } catch {
    return null;
  }
}

export function clearBawNoirLiveColorWigViews(): void {
  try {
    localStorage.removeItem(COLOR_PENDING_KEY);
    localStorage.removeItem(COLOR_KEY);
    dispatch(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}

export function persistBawNoirLiveStylingWigViews(views: BawNoirLiveWigViewsTriple): void {
  try {
    localStorage.setItem(STYLING_KEY, JSON.stringify(views));
    dispatch(BAW_NOIR_LIVE_STYLING_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}

export function readBawNoirLiveStylingWigViews(): BawNoirLiveWigViewsTriple | null {
  try {
    const raw = localStorage.getItem(STYLING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    return [String(parsed[0]), String(parsed[1]), String(parsed[2])];
  } catch {
    return null;
  }
}

export function clearBawNoirLiveStylingWigViews(): void {
  try {
    localStorage.removeItem(STYLING_KEY);
    dispatch(BAW_NOIR_LIVE_STYLING_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}

export function persistBawNoirLiveBangsWigViews(views: BawNoirLiveWigViewsTriple): void {
  try {
    localStorage.setItem(BANGS_KEY, JSON.stringify(views));
    dispatch(BAW_NOIR_LIVE_BANGS_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}

export function readBawNoirLiveBangsWigViews(): BawNoirLiveWigViewsTriple | null {
  try {
    const raw = localStorage.getItem(BANGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    return [String(parsed[0]), String(parsed[1]), String(parsed[2])];
  } catch {
    return null;
  }
}

export function clearBawNoirLiveBangsWigViews(): void {
  try {
    localStorage.removeItem(BANGS_KEY);
    dispatch(BAW_NOIR_LIVE_BANGS_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}
