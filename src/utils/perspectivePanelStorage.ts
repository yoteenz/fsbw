import type { PerspectivePanelId, PerspectivePanelMap, PerspectivePanelQuad } from '../types/perspectivePanel';
import { defaultPerspectivePanelQuad } from '../constants/perspectivePanelConfig';
import { clampPerspectivePanelQuad } from './perspectivePanelQuad';

export const PERSPECTIVE_PANEL_STORAGE_KEY = 'perspectivePanelMap';
export const PERSPECTIVE_PANEL_STORAGE_REVISION = 1;

type StoredPerspectivePanelMap = {
  version: number;
  revision: number;
  panels: PerspectivePanelMap;
};

function readStoredRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(PERSPECTIVE_PANEL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseStoredMap(raw: string): PerspectivePanelMap | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Record<string, unknown>;
    if (record.version === 1 && record.panels && typeof record.panels === 'object') {
      if (record.revision !== PERSPECTIVE_PANEL_STORAGE_REVISION) return null;
      return normalizePanelMap(record.panels as PerspectivePanelMap);
    }

    if ('panels' in record && typeof record.panels === 'object') {
      return normalizePanelMap(record.panels as PerspectivePanelMap);
    }

    return normalizePanelMap(record as PerspectivePanelMap);
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

export function loadPerspectivePanelOverrides(): PerspectivePanelMap {
  const raw = readStoredRaw();
  if (!raw) return {};
  return parseStoredMap(raw) ?? {};
}

export function savePerspectivePanelOverrides(map: PerspectivePanelMap): boolean {
  if (typeof window === 'undefined') return false;
  const payload: StoredPerspectivePanelMap = {
    version: 1,
    revision: PERSPECTIVE_PANEL_STORAGE_REVISION,
    panels: normalizePanelMap(map),
  };
  try {
    window.localStorage.setItem(PERSPECTIVE_PANEL_STORAGE_KEY, JSON.stringify(payload, null, 2));
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
  } catch {
    /* ignore */
  }
}

export function resolvePerspectivePanelQuad(
  id: PerspectivePanelId,
  overrides?: PerspectivePanelMap,
): PerspectivePanelQuad {
  const map = overrides ?? loadPerspectivePanelOverrides();
  return map[id] ?? defaultPerspectivePanelQuad(id);
}
