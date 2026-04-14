/** Persist admin live NOIR preview triples (L, F, R) for Build-a-Wig hub + subpages. */

export const BAW_NOIR_LIVE_COLOR_VIEWS_EVENT = 'bawNoirLiveColorWigViewsUpdated';
export const BAW_NOIR_LIVE_STYLING_VIEWS_EVENT = 'bawNoirLiveStylingWigViewsUpdated';

const COLOR_KEY = 'bawNoirLiveColorWigViews';
const STYLING_KEY = 'bawNoirLiveStylingWigViews';

export type BawNoirLiveWigViewsTriple = [string, string, string];

function dispatch(name: string) {
  try {
    window.dispatchEvent(new CustomEvent(name));
  } catch {
    /* ignore */
  }
}

export function persistBawNoirLiveColorWigViews(views: BawNoirLiveWigViewsTriple): void {
  try {
    localStorage.setItem(COLOR_KEY, JSON.stringify(views));
    dispatch(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}

export function readBawNoirLiveColorWigViews(): BawNoirLiveWigViewsTriple | null {
  try {
    const raw = localStorage.getItem(COLOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    return [String(parsed[0]), String(parsed[1]), String(parsed[2])];
  } catch {
    return null;
  }
}

export function clearBawNoirLiveColorWigViews(): void {
  try {
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
