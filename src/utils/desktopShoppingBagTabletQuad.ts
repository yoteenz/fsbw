import { DESKTOP_SHOPPING_BAG_TABLET_QUAD } from '../constants/desktopShoppingBag';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import {
  percentRectToImageRect,
  roundPanelDebugPercent,
} from './desktopPanelDebugMode';
import type { PanelDebugPercentRect } from '../types/desktopPanelDebug';
import {
  clampQuad,
  type Quad4,
  quadsEqual,
  roundQuadCoord,
} from './quadPerspectiveTransform';

export type ShoppingBagTabletQuad = Quad4;

export const SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY = 'desktopShoppingBagTabletRect';

/** Bump when hero art changes so stale debug saves are ignored. */
export const SHOPPING_BAG_TABLET_LAYOUT_REVISION = 3;

type StoredLayoutV3 = {
  version: 3;
  revision: number;
  quad: ShoppingBagTabletQuad;
};

export function rectToShoppingBagTabletQuad(rect: FinalSceneHitRect): ShoppingBagTabletQuad {
  const l = rect.left;
  const t = rect.top;
  const r = rect.left + rect.width;
  const b = rect.top + rect.height;
  return clampQuad({
    tl: { x: l, y: t },
    tr: { x: r, y: t },
    br: { x: r, y: b },
    bl: { x: l, y: b },
  });
}

export function defaultShoppingBagTabletQuad(): ShoppingBagTabletQuad {
  return clampQuad(DESKTOP_SHOPPING_BAG_TABLET_QUAD);
}

function readStoredRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      window.localStorage.getItem(SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY) ??
      window.sessionStorage.getItem(SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

function parseLegacyPercentRect(raw: PanelDebugPercentRect): ShoppingBagTabletQuad | null {
  if (
    typeof raw.x !== 'number' ||
    typeof raw.y !== 'number' ||
    typeof raw.width !== 'number' ||
    typeof raw.height !== 'number'
  ) {
    return null;
  }
  return rectToShoppingBagTabletQuad(percentRectToImageRect(raw));
}

function parseStoredQuad(raw: string): ShoppingBagTabletQuad | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Record<string, unknown>;

    if (record.version === 3 && record.quad && typeof record.quad === 'object') {
      const revision =
        typeof record.revision === 'number' ? record.revision : SHOPPING_BAG_TABLET_LAYOUT_REVISION;
      if (revision !== SHOPPING_BAG_TABLET_LAYOUT_REVISION) return null;
      const q = record.quad as ShoppingBagTabletQuad;
      if (q.tl && q.tr && q.br && q.bl) return clampQuad(q);
    }

    if (record.version === 2 && record.quad && typeof record.quad === 'object') {
      return null;
    }

    if ('tl' in record && 'tr' in record && 'br' in record && 'bl' in record) {
      return clampQuad(record as ShoppingBagTabletQuad);
    }

    if ('x' in record && 'width' in record) {
      return parseLegacyPercentRect(record as PanelDebugPercentRect);
    }

    return null;
  } catch {
    return null;
  }
}

export function loadShoppingBagTabletQuad(): ShoppingBagTabletQuad | null {
  const raw = readStoredRaw();
  if (!raw) return null;
  return parseStoredQuad(raw);
}

export function loadEffectiveShoppingBagTabletQuad(): ShoppingBagTabletQuad {
  if (typeof window !== 'undefined') {
    try {
      const debug = new URLSearchParams(window.location.search).get('shoppingBagDebug') === '1';
      if (!debug) return defaultShoppingBagTabletQuad();
    } catch {
      /* ignore */
    }
  }
  return loadShoppingBagTabletQuad() ?? defaultShoppingBagTabletQuad();
}

export function hasSavedShoppingBagTabletQuad(): boolean {
  return loadShoppingBagTabletQuad() != null;
}

export function saveShoppingBagTabletQuad(quad: ShoppingBagTabletQuad): boolean {
  if (typeof window === 'undefined') return false;
  const payload: StoredLayoutV3 = {
    version: 3,
    revision: SHOPPING_BAG_TABLET_LAYOUT_REVISION,
    quad: clampQuad(quad),
  };
  const json = JSON.stringify(payload, null, 2);
  try {
    window.localStorage.setItem(SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY, json);
    try {
      window.sessionStorage.setItem(SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY, json);
    } catch {
      /* optional mirror */
    }
    return true;
  } catch {
    try {
      window.sessionStorage.setItem(SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY, json);
      return true;
    } catch {
      return false;
    }
  }
}

export function clearShoppingBagTabletQuad(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.removeItem(SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function shoppingBagTabletQuadsEqual(a: ShoppingBagTabletQuad, b: ShoppingBagTabletQuad): boolean {
  return quadsEqual(a, b);
}

export function formatShoppingBagTabletQuadForExport(quad: ShoppingBagTabletQuad): string {
  const q = clampQuad(quad);
  const fmt = (p: { x: number; y: number }) =>
    `{ x: ${roundQuadCoord(p.x)}, y: ${roundQuadCoord(p.y)} }`;
  return `export const DESKTOP_SHOPPING_BAG_TABLET_QUAD = {
  tl: ${fmt(q.tl)},
  tr: ${fmt(q.tr)},
  br: ${fmt(q.br)},
  bl: ${fmt(q.bl)},
} as const;`;
}

/** @deprecated Legacy rect export — kept for reference when migrating old saves. */
export function formatShoppingBagTabletRectForExportFromQuad(quad: ShoppingBagTabletQuad): string {
  const xs = [quad.tl.x, quad.tr.x, quad.br.x, quad.bl.x];
  const ys = [quad.tl.y, quad.tr.y, quad.br.y, quad.bl.y];
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const width = Math.max(...xs) - left;
  const height = Math.max(...ys) - top;
  return `// Bounding rect derived from quad
export const DESKTOP_SHOPPING_BAG_TABLET_RECT: FinalSceneHitRect = {
  left: ${roundPanelDebugPercent(left * 1000) / 1000},
  top: ${roundPanelDebugPercent(top * 1000) / 1000},
  width: ${roundPanelDebugPercent(width * 1000) / 1000},
  height: ${roundPanelDebugPercent(height * 1000) / 1000},
};`;
}

export async function copyShoppingBagTabletDebugText(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}