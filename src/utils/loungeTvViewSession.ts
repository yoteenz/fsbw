/** Persists Lounge TV detail view + scroll across refresh while the TV session is open. */

const LOUNGE_TV_SESSION_VIEW_STATE_KEY = 'loungeTvSessionViewState';
const LOUNGE_TV_SESSION_VIEW_SCROLL_KEY = 'loungeTvSessionViewScroll';

export type LoungeTvSessionViewState =
  | { kind: 'browse' }
  | { kind: 'detail'; packId: string }
  | { kind: 'lesson'; packId: string }
  | { kind: 'video'; packId: string }
  | { kind: 'article'; packId: string }
  | { kind: 'psa-episode'; episodeId: string }
  | { kind: 'slay-tip'; tipId: string }
  | { kind: 'psa-answer'; answerId: string }
  | { kind: 'product-breakdown'; breakdownId: string }
  | { kind: 'care-lesson'; lessonId: string }
  | { kind: 'mastery'; masteryId: string }
  | { kind: 'season'; seasonId: string };

const VIEW_KINDS = [
  'browse',
  'detail',
  'lesson',
  'video',
  'article',
  'psa-episode',
  'slay-tip',
  'psa-answer',
  'product-breakdown',
  'care-lesson',
  'mastery',
  'season',
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function parseViewState(raw: unknown): LoungeTvSessionViewState | null {
  if (!raw || typeof raw !== 'object') return null;
  const kind = (raw as { kind?: unknown }).kind;
  if (typeof kind !== 'string' || !(VIEW_KINDS as readonly string[]).includes(kind)) return null;

  switch (kind) {
    case 'browse':
      return { kind: 'browse' };
    case 'detail':
    case 'lesson':
    case 'video':
    case 'article': {
      const packId = (raw as { packId?: unknown }).packId;
      return isNonEmptyString(packId) ? { kind, packId } : null;
    }
    case 'psa-episode': {
      const episodeId = (raw as { episodeId?: unknown }).episodeId;
      return isNonEmptyString(episodeId) ? { kind: 'psa-episode', episodeId } : null;
    }
    case 'slay-tip': {
      const tipId = (raw as { tipId?: unknown }).tipId;
      return isNonEmptyString(tipId) ? { kind: 'slay-tip', tipId } : null;
    }
    case 'psa-answer': {
      const answerId = (raw as { answerId?: unknown }).answerId;
      return isNonEmptyString(answerId) ? { kind: 'psa-answer', answerId } : null;
    }
    case 'product-breakdown': {
      const breakdownId = (raw as { breakdownId?: unknown }).breakdownId;
      return isNonEmptyString(breakdownId) ? { kind: 'product-breakdown', breakdownId } : null;
    }
    case 'care-lesson': {
      const lessonId = (raw as { lessonId?: unknown }).lessonId;
      return isNonEmptyString(lessonId) ? { kind: 'care-lesson', lessonId } : null;
    }
    case 'mastery': {
      const masteryId = (raw as { masteryId?: unknown }).masteryId;
      return isNonEmptyString(masteryId) ? { kind: 'mastery', masteryId } : null;
    }
    case 'season': {
      const seasonId = (raw as { seasonId?: unknown }).seasonId;
      return isNonEmptyString(seasonId) ? { kind: 'season', seasonId } : null;
    }
    default:
      return null;
  }
}

export function loungeTvViewSessionScrollKey(
  viewState: LoungeTvSessionViewState,
  mainTab?: string,
): string {
  switch (viewState.kind) {
    case 'browse':
      return `browse:${mainTab ?? 'featured'}`;
    case 'detail':
      return `detail:${viewState.packId}`;
    case 'lesson':
      return `lesson:${viewState.packId}`;
    case 'video':
      return `video:${viewState.packId}`;
    case 'article':
      return `article:${viewState.packId}`;
    case 'psa-episode':
      return `psa-episode:${viewState.episodeId}`;
    case 'slay-tip':
      return `slay-tip:${viewState.tipId}`;
    case 'psa-answer':
      return `psa-answer:${viewState.answerId}`;
    case 'product-breakdown':
      return `product-breakdown:${viewState.breakdownId}`;
    case 'care-lesson':
      return `care-lesson:${viewState.lessonId}`;
    case 'mastery':
      return `mastery:${viewState.masteryId}`;
    case 'season':
      return `season:${viewState.seasonId}`;
    default:
      return 'browse';
  }
}

export function readLoungeTvSessionViewState(): LoungeTvSessionViewState | null {
  try {
    const raw = sessionStorage.getItem(LOUNGE_TV_SESSION_VIEW_STATE_KEY);
    if (!raw) return null;
    return parseViewState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeLoungeTvSessionViewState(viewState: LoungeTvSessionViewState): void {
  try {
    sessionStorage.setItem(LOUNGE_TV_SESSION_VIEW_STATE_KEY, JSON.stringify(viewState));
  } catch {
    /* ignore */
  }
}

type LoungeTvViewScrollMap = Record<string, number>;

function readScrollMap(): LoungeTvViewScrollMap {
  try {
    const raw = sessionStorage.getItem(LOUNGE_TV_SESSION_VIEW_SCROLL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: LoungeTvViewScrollMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        out[key] = value;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writeScrollMap(map: LoungeTvViewScrollMap): void {
  try {
    sessionStorage.setItem(LOUNGE_TV_SESSION_VIEW_SCROLL_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function readLoungeTvSessionViewScroll(scrollKey: string): number | null {
  const value = readScrollMap()[scrollKey];
  return value == null ? null : value;
}

export function writeLoungeTvSessionViewScroll(scrollKey: string, scrollTop: number): void {
  if (!Number.isFinite(scrollTop) || scrollTop < 0) return;
  const map = readScrollMap();
  map[scrollKey] = Math.round(scrollTop);
  writeScrollMap(map);
}

export function clearLoungeTvViewSession(): void {
  try {
    sessionStorage.removeItem(LOUNGE_TV_SESSION_VIEW_STATE_KEY);
    sessionStorage.removeItem(LOUNGE_TV_SESSION_VIEW_SCROLL_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveLoungeTvScrollContainer(
  root: HTMLElement,
  viewState: LoungeTvSessionViewState,
): HTMLElement | null {
  if (viewState.kind !== 'browse') {
    return root.querySelector<HTMLElement>('[class*="viewer__scroll"]');
  }
  return root.querySelector<HTMLElement>('[data-scene-hit-region="lounge-tv-media-panel"]');
}

export function restoreLoungeTvScrollPosition(scroller: HTMLElement, scrollTop: number): void {
  let attempts = 0;
  const maxAttempts = 16;

  const attempt = () => {
    scroller.scrollTop = scrollTop;
    if (Math.abs(scroller.scrollTop - scrollTop) <= 2) return;
    attempts += 1;
    if (attempts < maxAttempts) requestAnimationFrame(attempt);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(attempt);
  });
}
