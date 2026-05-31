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
  dispatchViewedUpdated();
}

/** Admin re-enabled *NEW* — allow badge/blur to show again on the lounge TV. */
export function clearLoungeTvTileViewed(tileId: string): void {
  if (!tileId) return;
  const ids = loadViewedTileIdSet();
  if (!ids.delete(tileId)) return;
  saveViewedTileIdSet(ids);
  dispatchViewedUpdated();
}

type AdminNewItem = { id: string; isNew?: boolean };

/** After admin save: any tile marked new should not stay in the "already viewed" list. */
export function resetLoungeTvViewedForNewAdminItems(items: AdminNewItem[]): void {
  const ids = loadViewedTileIdSet();
  let changed = false;
  for (const item of items) {
    if (item.isNew && ids.delete(item.id)) changed = true;
  }
  if (!changed) return;
  saveViewedTileIdSet(ids);
  dispatchViewedUpdated();
}

function dispatchViewedUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOUNGE_TV_VIEWED_UPDATED_EVENT));
  }
}
