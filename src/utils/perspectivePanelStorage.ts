import type { PerspectivePanelId, PerspectivePanelMap, PerspectivePanelQuad } from '../types/perspectivePanel';
import { defaultPerspectivePanelQuad } from '../constants/perspectivePanelConfig';
import { clampPerspectivePanelQuad, quad4ToPerspectivePanelQuad } from './perspectivePanelQuad';
import { loadShoppingBagTabletQuad } from './desktopShoppingBagTabletQuad';
import { isPerspectivePanelDebugEnabled } from './perspectivePanelDebug';

export const PERSPECTIVE_PANEL_STORAGE_KEY = 'perspectivePanelMap';
export const PERSPECTIVE_PANEL_STORAGE_REVISION = 1;
export const PERSPECTIVE_PANEL_UPDATED_EVENT = 'perspectivePanelMapUpdated';

export type StoredPerspectivePanelPayload = {
  version: number;
  revision: number;
  panels: PerspectivePanelMap;
  updatedAt: number;
};

function readStoredRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(PERSPECTIVE_PANEL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function normalizePanelMap(map: PerspectivePanelMap): PerspectivePanelMap {
  const next: PerspectivePanelMap = {};
  for (const [id, quad] of Object.entries(map)) {
    if (!quad || typeof quad !== 'object') continue;
    const q = quad as PerspectivePanelQuad;
    if (!q.topLeft || !q.topRight || !q.bottomRight || !q.bottomLeft) continue;
    next[id as PerspectivePanelId] = clampPerspectivePanelQuad(q);
  }
  return next;
}

function migrateLegacyShoppingBagTablet(map: PerspectivePanelMap): PerspectivePanelMap {
  if (map['curator-tablet'] && map['checkout-tablet']) return map;
  const legacy = loadShoppingBagTabletQuad();
  if (!legacy) return map;
  const quad = quad4ToPerspectivePanelQuad(legacy);
  return {
    ...map,
    'curator-tablet': map['curator-tablet'] ?? quad,
    'checkout-tablet': map['checkout-tablet'] ?? quad,
  };
}

function parseStoredPayload(raw: string): StoredPerspectivePanelPayload | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Record<string, unknown>;
    let panels: PerspectivePanelMap | null = null;

    if (record.version === 1 && record.panels && typeof record.panels === 'object') {
      const revision =
        typeof record.revision === 'number' ? record.revision : PERSPECTIVE_PANEL_STORAGE_REVISION;
      if (revision !== PERSPECTIVE_PANEL_STORAGE_REVISION) return null;
      panels = normalizePanelMap(record.panels as PerspectivePanelMap);
    } else if ('panels' in record && typeof record.panels === 'object') {
      panels = normalizePanelMap(record.panels as PerspectivePanelMap);
    } else {
      panels = normalizePanelMap(record as PerspectivePanelMap);
    }

    if (!panels) return null;
    const updatedAt = typeof record.updatedAt === 'number' ? record.updatedAt : 0;
    return {
      version: 1,
      revision: PERSPECTIVE_PANEL_STORAGE_REVISION,
      panels: migrateLegacyShoppingBagTablet(panels),
      updatedAt,
    };
  } catch {
    return null;
  }
}

export function readPerspectivePanelStoragePayload(): StoredPerspectivePanelPayload | null {
  const raw = readStoredRaw();
  if (!raw) return null;
  return parseStoredPayload(raw);
}

export function mergePerspectivePanelMaps(
  local: PerspectivePanelMap,
  remote: PerspectivePanelMap,
): PerspectivePanelMap {
  return migrateLegacyShoppingBagTablet({
    ...local,
    ...remote,
  });
}

export function loadPerspectivePanelOverrides(): PerspectivePanelMap {
  if (!isPerspectivePanelDebugEnabled()) return {};
  return loadPerspectivePanelMapFromStorage();
}

/** Load saved panel quads regardless of URL debug flags (Mansion Debug bridge). */
export function loadPerspectivePanelMapFromStorage(): PerspectivePanelMap {
  const payload = readPerspectivePanelStoragePayload();
  if (!payload) return migrateLegacyShoppingBagTablet({});
  return payload.panels;
}

export function dispatchPerspectivePanelMapUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PERSPECTIVE_PANEL_UPDATED_EVENT));
}

type SaveOptions = {
  updatedAt?: number;
  syncCloud?: boolean;
  /** When true, persist without broadcasting `perspectivePanelMapUpdated` (draft drag saves). */
  silent?: boolean;
};

export function savePerspectivePanelOverrides(
  map: PerspectivePanelMap,
  options: SaveOptions = {},
): boolean {
  if (typeof window === 'undefined') return false;
  const payload: StoredPerspectivePanelPayload = {
    version: 1,
    revision: PERSPECTIVE_PANEL_STORAGE_REVISION,
    panels: migrateLegacyShoppingBagTablet(normalizePanelMap(map)),
    updatedAt: options.updatedAt ?? Date.now(),
  };
  try {
    window.localStorage.setItem(PERSPECTIVE_PANEL_STORAGE_KEY, JSON.stringify(payload, null, 2));
    if (!options.silent) {
      dispatchPerspectivePanelMapUpdated();
    }
    return true;
  } catch {
    return false;
  }
}

export function clearPerspectivePanelOverride(id: PerspectivePanelId): void {
  const current = loadPerspectivePanelOverrides();
  delete current[id];
  savePerspectivePanelOverrides(current);
}

export function clearAllPerspectivePanelOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PERSPECTIVE_PANEL_STORAGE_KEY);
    dispatchPerspectivePanelMapUpdated();
  } catch {
    /* ignore */
  }
}

export function resolvePerspectivePanelQuad(
  id: PerspectivePanelId,
  overrides?: PerspectivePanelMap,
): PerspectivePanelQuad {
  const map = migrateLegacyShoppingBagTablet(
    overrides ??
      (isPerspectivePanelDebugEnabled()
        ? loadPerspectivePanelOverrides()
        : loadPerspectivePanelMapFromStorage()),
  );
  return map[id] ?? defaultPerspectivePanelQuad(id);
}

/** Saved quad for live UI — localStorage overrides with config defaults, no debug flags required. */
export function resolveEffectivePerspectivePanelQuad(id: PerspectivePanelId): PerspectivePanelQuad {
  return resolvePerspectivePanelQuad(id);
}
