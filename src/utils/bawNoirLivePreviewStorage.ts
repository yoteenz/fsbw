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

export type BawNoirLiveStylingPart = 'MIDDLE' | 'LEFT' | 'RIGHT';

export type BawNoirLiveStylingEnvelope = {
  part: BawNoirLiveStylingPart;
  urls: BawNoirLiveWigViewsTriple;
};

function parseStylingStorageRaw(raw: string | null): BawNoirLiveStylingEnvelope | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length === 3) {
      return {
        part: 'MIDDLE',
        urls: [String(parsed[0]), String(parsed[1]), String(parsed[2])],
      };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const o = parsed as Record<string, unknown>;
    const part = o.part;
    const urls = o.urls;
    if (part !== 'MIDDLE' && part !== 'LEFT' && part !== 'RIGHT') return null;
    if (!Array.isArray(urls) || urls.length !== 3) return null;
    return {
      part,
      urls: [String(urls[0]), String(urls[1]), String(urls[2])],
    };
  } catch {
    return null;
  }
}

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

export function persistBawNoirLiveStylingWigViews(views: BawNoirLiveWigViewsTriple, part: BawNoirLiveStylingPart): void {
  try {
    const envelope: BawNoirLiveStylingEnvelope = { part, urls: views };
    localStorage.setItem(STYLING_KEY, JSON.stringify(envelope));
    dispatch(BAW_NOIR_LIVE_STYLING_VIEWS_EVENT);
  } catch {
    /* ignore */
  }
}

/** Full envelope (any part). */
export function readBawNoirLiveStylingEnvelope(): BawNoirLiveStylingEnvelope | null {
  try {
    return parseStylingStorageRaw(localStorage.getItem(STYLING_KEY));
  } catch {
    return null;
  }
}

/**
 * Styling triple only when it matches **expectedPart** (hub: pass `selectedPartSelection`).
 * Legacy array-only storage is treated as **MIDDLE**.
 */
export function readBawNoirLiveStylingWigViewsForPart(expectedPart: string): BawNoirLiveWigViewsTriple | null {
  try {
    const env = parseStylingStorageRaw(localStorage.getItem(STYLING_KEY));
    if (!env) return null;
    const want = (expectedPart || 'MIDDLE').toUpperCase();
    if (env.part !== want) return null;
    return env.urls;
  } catch {
    return null;
  }
}

/** @deprecated Prefer `readBawNoirLiveStylingWigViewsForPart` or `readBawNoirLiveStylingEnvelope`. */
export function readBawNoirLiveStylingWigViews(): BawNoirLiveWigViewsTriple | null {
  return readBawNoirLiveStylingWigViewsForPart('MIDDLE');
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

/**
 * Admin NOIR BAW hub: which persisted live triple to show.
 * Styling/bangs WebPs must match the **current** salon selection — do not prefer stale
 * `bawNoirLiveStylingWigViews` after the user returns to base / NONE (e.g. `selectedHairStyling` left over).
 */
export function resolveAdminNoirHubLiveWigViewsFromStorage(): BawNoirLiveWigViewsTriple | null {
  try {
    const canon = (localStorage.getItem('selectedStyling') || 'NONE').trim().toUpperCase();
    if (canon === 'NONE' || canon === '') {
      return readBawNoirLiveColorWigViews();
    }

    const hairRaw = localStorage.getItem('selectedHairStyling');
    let ids: string[];
    if (hairRaw && hairRaw.trim()) {
      ids = hairRaw
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s && s !== 'NONE');
    } else {
      ids = canon
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s && s !== 'NONE');
    }

    if (ids.length === 0) {
      return readBawNoirLiveColorWigViews();
    }

    const hasLayers = ids.includes('LAYERS');
    const bangsOnly = ids.includes('BANGS') && !hasLayers;

    if (hasLayers) {
      const part = (localStorage.getItem('selectedPartSelection') || 'MIDDLE').toUpperCase();
      const fromStyling = readBawNoirLiveStylingWigViewsForPart(part);
      if (fromStyling) return fromStyling;
    }
    if (bangsOnly) {
      const fromBangs = readBawNoirLiveBangsWigViews();
      if (fromBangs) return fromBangs;
    }
    return readBawNoirLiveColorWigViews();
  } catch {
    return readBawNoirLiveColorWigViews();
  }
}
