import {
  DESKTOP_SHOPPING_BAG_TABLET_RECT,
} from '../constants/desktopShoppingBag';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import {
  clampPanelDebugPercentRect,
  imageRectToPercentRect,
  percentRectToImageRect,
  roundPanelDebugPercent,
} from './desktopPanelDebugMode';
import type { PanelDebugPercentRect } from '../types/desktopPanelDebug';

export type ShoppingBagTabletPercentRect = PanelDebugPercentRect;

export const SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY = 'desktopShoppingBagTabletRect';

export function defaultShoppingBagTabletPercentRect(): ShoppingBagTabletPercentRect {
  return imageRectToPercentRect(DESKTOP_SHOPPING_BAG_TABLET_RECT);
}

function readStoredRectRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      window.localStorage.getItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY) ??
      window.sessionStorage.getItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export function loadShoppingBagTabletPercentRect(): ShoppingBagTabletPercentRect | null {
  const raw = readStoredRectRaw();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ShoppingBagTabletPercentRect;
    if (
      !parsed ||
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number' ||
      typeof parsed.width !== 'number' ||
      typeof parsed.height !== 'number'
    ) {
      return null;
    }
    return clampPanelDebugPercentRect(parsed);
  } catch {
    return null;
  }
}

/** Saved layout on this device, or shipped default from `desktopShoppingBag.ts`. */
export function loadEffectiveShoppingBagTabletPercentRect(): ShoppingBagTabletPercentRect {
  return loadShoppingBagTabletPercentRect() ?? defaultShoppingBagTabletPercentRect();
}

export function hasSavedShoppingBagTabletRect(): boolean {
  return loadShoppingBagTabletPercentRect() != null;
}

export function shoppingBagTabletRectsEqual(
  a: ShoppingBagTabletPercentRect,
  b: ShoppingBagTabletPercentRect,
): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

export function saveShoppingBagTabletPercentRect(rect: ShoppingBagTabletPercentRect): boolean {
  if (typeof window === 'undefined') return false;
  const payload = JSON.stringify(clampPanelDebugPercentRect(rect), null, 2);
  try {
    window.localStorage.setItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY, payload);
    try {
      window.sessionStorage.setItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY, payload);
    } catch {
      /* session mirror optional */
    }
    return true;
  } catch {
    try {
      window.sessionStorage.setItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY, payload);
      return true;
    } catch {
      return false;
    }
  }
}

export function clearShoppingBagTabletPercentRect(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.removeItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveShoppingBagTabletImageRect(
  percent: ShoppingBagTabletPercentRect,
): FinalSceneHitRect {
  return percentRectToImageRect(clampPanelDebugPercentRect(percent));
}

export function resolveEffectiveShoppingBagTabletImageRect(): FinalSceneHitRect {
  return resolveShoppingBagTabletImageRect(loadEffectiveShoppingBagTabletPercentRect());
}

export function formatShoppingBagTabletRectForExport(rect: ShoppingBagTabletPercentRect): string {
  const image = percentRectToImageRect(clampPanelDebugPercentRect(rect));
  return `export const DESKTOP_SHOPPING_BAG_TABLET_RECT: FinalSceneHitRect = {
  left: ${roundPanelDebugPercent(image.left * 1000) / 1000},
  top: ${roundPanelDebugPercent(image.top * 1000) / 1000},
  width: ${roundPanelDebugPercent(image.width * 1000) / 1000},
  height: ${roundPanelDebugPercent(image.height * 1000) / 1000},
};`;
}

/** Clipboard with execCommand fallback for mobile Safari. */
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
