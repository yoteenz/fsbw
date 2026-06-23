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

export function loadShoppingBagTabletPercentRect(): ShoppingBagTabletPercentRect | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY);
    if (!raw) return null;
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

export function saveShoppingBagTabletPercentRect(rect: ShoppingBagTabletPercentRect): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY,
    JSON.stringify(clampPanelDebugPercentRect(rect), null, 2),
  );
}

export function clearShoppingBagTabletPercentRect(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY);
}

export function resolveShoppingBagTabletImageRect(
  stored: ShoppingBagTabletPercentRect | null,
): FinalSceneHitRect {
  const percent = stored ?? defaultShoppingBagTabletPercentRect();
  return percentRectToImageRect(clampPanelDebugPercentRect(percent));
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
