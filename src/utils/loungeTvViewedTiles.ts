const LOUNGE_TV_VIEWED_TILE_IDS_KEY = 'loungeTvViewedTileIds';

export const LOUNGE_TV_VIEWED_UPDATED_EVENT = 'loungeTvViewedUpdated';

function loadViewedTileIdSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LOUNGE_TV_VIEWED_TILE_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

function saveViewedTileIdSet(ids: Set<string>): void {
  localStorage.setItem(LOUNGE_TV_VIEWED_TILE_IDS_KEY, JSON.stringify([...ids]));
}

export function isLoungeTvTileViewed(tileId: string): boolean {
  return loadViewedTileIdSet().has(tileId);
}

/** True when tile is marked new in config and the user has not opened it yet. */
export function loungeTvTileShowsAsNew(tile: { id: string; isNew?: boolean }): boolean {
  return Boolean(tile.isNew && !isLoungeTvTileViewed(tile.id));
}

export function markLoungeTvTileViewed(tileId: string): void {
  if (!tileId) return;
  const ids = loadViewedTileIdSet();
  if (ids.has(tileId)) return;
  ids.add(tileId);
  saveViewedTileIdSet(ids);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOUNGE_TV_VIEWED_UPDATED_EVENT));
  }
}
