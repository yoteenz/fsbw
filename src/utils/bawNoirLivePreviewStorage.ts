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

/** Which salon + part live preview is stored (LAYERS vs CRIMPS; **+ bangs** = BANGS combined with that salon style). */
export type BawNoirLiveStylingSalonMode =
  | 'LAYERS'
  | 'CRIMPS'
  | 'FLAT_IRON'
  | 'LAYERS_BANGS'
  | 'CRIMPS_BANGS'
  | 'FLAT_IRON_BANGS';

export type BawNoirLiveStylingEnvelope = {
  part: BawNoirLiveStylingPart;
  /** Defaults to **LAYERS** when missing (legacy JSON). */
  salonMode?: BawNoirLiveStylingSalonMode;
  urls: BawNoirLiveWigViewsTriple;
};

function parseStylingStorageRaw(raw: string | null): BawNoirLiveStylingEnvelope | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length === 3) {
      return {
        part: 'MIDDLE',
        salonMode: 'LAYERS',
        urls: [String(parsed[0]), String(parsed[1]), String(parsed[2])],
      };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const o = parsed as Record<string, unknown>;
    const part = o.part;
    const urls = o.urls;
    const sm = o.salonMode;
    if (part !== 'MIDDLE' && part !== 'LEFT' && part !== 'RIGHT') return null;
    if (!Array.isArray(urls) || urls.length !== 3) return null;
    let salonMode: BawNoirLiveStylingSalonMode = 'LAYERS';
    if (sm === 'CRIMPS') salonMode = 'CRIMPS';
    else if (sm === 'FLAT_IRON') salonMode = 'FLAT_IRON';
    else if (sm === 'LAYERS_BANGS') salonMode = 'LAYERS_BANGS';
    else if (sm === 'CRIMPS_BANGS') salonMode = 'CRIMPS_BANGS';
    else if (sm === 'FLAT_IRON_BANGS') salonMode = 'FLAT_IRON_BANGS';
    return {
      part,
      salonMode,
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
    dispatch(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT);
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
    dispatch(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT);
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

export function persistBawNoirLiveStylingWigViews(
  views: BawNoirLiveWigViewsTriple,
  part: BawNoirLiveStylingPart,
  salonMode: BawNoirLiveStylingSalonMode = 'LAYERS'
): void {
  try {
    const envelope: BawNoirLiveStylingEnvelope = { part, salonMode, urls: views };
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
 * Styling triple only when it matches **expectedPart** and **salonMode** (hub: pass `selectedPartSelection` + LAYERS vs CRIMPS).
 * Legacy array-only storage is treated as **MIDDLE** + **LAYERS**.
 */
export function readBawNoirLiveStylingWigViewsForPart(
  expectedPart: string,
  salonMode: BawNoirLiveStylingSalonMode = 'LAYERS'
): BawNoirLiveWigViewsTriple | null {
  try {
    const env = parseStylingStorageRaw(localStorage.getItem(STYLING_KEY));
    if (!env) return null;
    const want = (expectedPart || 'MIDDLE').toUpperCase();
    if (env.part !== want) return null;
    const mode = env.salonMode ?? 'LAYERS';
    if (mode !== salonMode) return null;
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

function parseStylingCsvToIds(raw: string | null): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s && s !== 'NONE');
}

/** NOIR routes: match `readEffectiveBawSalonStylingCanon` — customize draft uses `customizeSelectedHairStyling` on sub-pages. */
function readEffectiveNoirHairStylingIdsForResolve(path: string): string[] {
  const p = path.replace(/\/$/, '') || '/';
  if (p === '/build-a-wig/noir/customize') {
    return parseStylingCsvToIds(localStorage.getItem('customizeSelectedHairStyling'));
  }
  if (path.includes('/build-a-wig/noir/customize/')) {
    return parseStylingCsvToIds(
      localStorage.getItem('customizeSelectedHairStyling') || localStorage.getItem('selectedHairStyling')
    );
  }
  if (path.includes('/build-a-wig/noir/edit/')) {
    return parseStylingCsvToIds(localStorage.getItem('selectedHairStyling'));
  }
  if (path.startsWith('/build-a-wig/noir')) {
    return parseStylingCsvToIds(localStorage.getItem('selectedHairStyling'));
  }
  return parseStylingCsvToIds(localStorage.getItem('selectedHairStyling'));
}

/**
 * Canonical saved salon styling for live preview, route-aware:
 * customize/edit flows write **customizeSelectedStyling** / **editSelectedStyling**; reading **selectedStyling**
 * alone misses clears and keeps stale **LAYERS** with **selectedHairStyling**.
 */
export function readEffectiveBawSalonStylingCanon(pathname: string): string {
  try {
    const p = pathname || '';
    const pNorm = p.replace(/\/$/, '') || '/';
    if (pNorm === '/build-a-wig/noir/customize') {
      return (localStorage.getItem('customizeSelectedStyling') || 'NONE').trim().toUpperCase();
    }
    if (p.includes('/customize')) {
      const v =
        localStorage.getItem('customizeSelectedStyling') ?? localStorage.getItem('selectedStyling');
      return (v || 'NONE').trim().toUpperCase();
    }
    if (p.includes('/edit')) {
      const v = localStorage.getItem('editSelectedStyling') ?? localStorage.getItem('selectedStyling');
      return (v || 'NONE').trim().toUpperCase();
    }
    return (localStorage.getItem('selectedStyling') || 'NONE').trim().toUpperCase();
  } catch {
    return 'NONE';
  }
}

/** Session flag: shop → fresh NOIR customize — hub should clear stale fal triples on first paint. */
export const SESSION_BAW_NOIR_RESET_LIVE_ON_CUSTOMIZE = 'bawNoirResetLivePreviewOnCustomize';

/**
 * Effective NOIR hair color from localStorage for the current BAW route.
 * Used so committed fal triples are not shown when the user is back on default OFF BLACK.
 */
export function readEffectiveNoirBawHairColor(pathname: string): string {
  try {
    if (pathname.includes('/build-a-wig/noir/edit')) {
      return (
        localStorage.getItem('editSelectedColor') ||
        localStorage.getItem('selectedColor') ||
        'OFF BLACK'
      );
    }
    if (pathname.includes('/build-a-wig/noir/customize')) {
      if (isNoirBawCustomizeHubOnlyPathname(pathname)) {
        return (localStorage.getItem('customizeSelectedColor') || 'OFF BLACK').trim() || 'OFF BLACK';
      }
      // Draft color taps on `.../customize/color` only — other steps use **confirmed** `selectedColor` (hub + Confirm).
      const p = pathname.replace(/\/$/, '') || '/';
      const onColorSubPage = p.endsWith('/color');
      if (!onColorSubPage) {
        return (
          localStorage.getItem('selectedColor') ||
          localStorage.getItem('customizeSelectedColor') ||
          'OFF BLACK'
        );
      }
      return (
        localStorage.getItem('customizeSelectedColor') ||
        localStorage.getItem('selectedColor') ||
        'OFF BLACK'
      );
    }
    if (pathname.startsWith('/build-a-wig/noir')) {
      return localStorage.getItem('selectedColor') || 'OFF BLACK';
    }
  } catch {
    /* ignore */
  }
  return 'OFF BLACK';
}

/** Committed live color WebPs apply only for paid / non-default NOIR colors. */
export function shouldUseCommittedBawNoirLiveColorWigViews(pathname: string): boolean {
  const c = (readEffectiveNoirBawHairColor(pathname) || 'OFF BLACK').trim();
  return c !== '' && c !== 'OFF BLACK';
}

/**
 * Current NOIR color preview for BAW routes.
 * **Pending** triple applies only on the **color** sub-page (draft taps). After Confirm or on styling/length/etc.,
 * use **committed** `bawNoirLiveColorWigViews` only so previews match hub-confirmed color, not last in-page tap.
 */
function currentNoirColorTripleOrNull(pathname: string): BawNoirLiveWigViewsTriple | null {
  if (!shouldUseCommittedBawNoirLiveColorWigViews(pathname)) return null;
  const p = pathname.replace(/\/$/, '') || '/';
  const onNoirCustomizeColor = p.includes('/build-a-wig/noir/customize/') && p.endsWith('/color');
  if (onNoirCustomizeColor) {
    return readPendingBawNoirLiveColorWigViews() ?? readBawNoirLiveColorWigViews();
  }
  return readBawNoirLiveColorWigViews();
}

/** Exact `/build-a-wig/noir` — static mannequin PNGs only; live WebPs apply on `/build-a-wig/noir/...` sub-routes. */
export function isNoirBawProductHubPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p === '/build-a-wig/noir';
}

/**
 * Exact `/build-a-wig/noir/customize` (NOIR customize **hub** only — not `/noir/customize/color`, etc.).
 * Uses **confirmed** `customizeSelected*` for live preview resolution; draft taps stay on sub-pages.
 */
export function isNoirBawCustomizeHubOnlyPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p === '/build-a-wig/noir/customize';
}

/**
 * Live WebP hero + thumbnails on NOIR **step** routes only (`/noir/customize/<step>`, `/noir/edit/<step>`).
 * **Not** on `/build-a-wig/noir`, `/noir/customize`, or `/noir/edit` landing hubs — those stay static `/assets/` mannequins + brick.
 */
export function isNoirBawLivePreviewStepPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p.startsWith('/build-a-wig/noir/customize/') || p.startsWith('/build-a-wig/noir/edit/');
}

/**
 * Admin NOIR BAW hub: which persisted live triple to show.
 * Styling/bangs WebPs must match the **current** salon selection — do not prefer stale
 * `bawNoirLiveStylingWigViews` after the user returns to base / NONE (e.g. `selectedHairStyling` left over).
 *
 * @param pathname — pass `window.location.pathname` (or React `location.pathname`) so customize/edit keys win.
 */
export function resolveAdminNoirHubLiveWigViewsFromStorage(pathname?: string): BawNoirLiveWigViewsTriple | null {
  try {
    const path =
      typeof pathname === 'string' && pathname.length > 0
        ? pathname
        : typeof window !== 'undefined'
          ? window.location.pathname
          : '';

    if (isNoirBawProductHubPathname(path)) return null;
    if (!isNoirBawLivePreviewStepPathname(path)) return null;

    const effectiveCanon = readEffectiveBawSalonStylingCanon(path);
    if (effectiveCanon === 'NONE' || effectiveCanon === '') {
      return currentNoirColorTripleOrNull(path);
    }

    const canonIds = parseStylingCsvToIds(effectiveCanon);
    const hairIds = readEffectiveNoirHairStylingIdsForResolve(path);
    const ids = [...new Set([...canonIds, ...hairIds])];

    if (ids.length === 0) {
      return currentNoirColorTripleOrNull(path);
    }

    const hasLayers = ids.includes('LAYERS');
    const hasCrimps = ids.includes('CRIMPS');
    const hasFlatIron = ids.includes('FLAT IRON');
    const hasBangs = ids.includes('BANGS');
    const salonCount = [hasLayers, hasCrimps, hasFlatIron].filter(Boolean).length;
    const bangsOnly = hasBangs && salonCount === 0;

    if (salonCount === 1 && (hasLayers || hasCrimps || hasFlatIron)) {
      let partRaw: string | null = null;
      if (isNoirBawCustomizeHubOnlyPathname(path)) {
        partRaw = localStorage.getItem('customizeSelectedPartSelection');
      } else if (path.includes('/build-a-wig/noir/customize/')) {
        partRaw =
          localStorage.getItem('customizeSelectedPartSelection') ||
          localStorage.getItem('selectedPartSelection');
      } else if (path.includes('/build-a-wig/noir/edit/')) {
        partRaw =
          localStorage.getItem('editSelectedPartSelection') || localStorage.getItem('selectedPartSelection');
      } else {
        partRaw = localStorage.getItem('selectedPartSelection');
      }
      const partU = (partRaw || 'MIDDLE').toUpperCase();
      /** FLAT IRON + MIDDLE (no BANGS): preview = **color-tier** WebPs only — same angles as NOIR color step / base live previews, not `after-color/flat-iron-middle-part`. */
      if (hasFlatIron && !hasLayers && !hasCrimps && partU === 'MIDDLE' && !hasBangs) {
        return currentNoirColorTripleOrNull(path);
      }
      const salonMode: BawNoirLiveStylingSalonMode = hasLayers
        ? hasBangs
          ? 'LAYERS_BANGS'
          : 'LAYERS'
        : hasCrimps
          ? hasBangs
            ? 'CRIMPS_BANGS'
            : 'CRIMPS'
          : hasBangs
            ? 'FLAT_IRON_BANGS'
            : 'FLAT_IRON';
      const fromStyling = readBawNoirLiveStylingWigViewsForPart(partU, salonMode);
      if (fromStyling) return fromStyling;
    }
    if (bangsOnly) {
      const fromBangs = readBawNoirLiveBangsWigViews();
      if (fromBangs) return fromBangs;
    }
    return currentNoirColorTripleOrNull(path);
  } catch {
    return currentNoirColorTripleOrNull(
      typeof pathname === 'string' && pathname.length > 0
        ? pathname
        : typeof window !== 'undefined'
          ? window.location.pathname
          : ''
    );
  }
}
