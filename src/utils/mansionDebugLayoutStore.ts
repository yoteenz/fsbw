import type { DesktopGrandLobbyPanelRegionId, DesktopGrandLobbyPercentRect } from '../types/desktopGrandLobby';
import type { DesktopShoppingBagRegionId, DesktopShoppingBagPercentRect } from '../types/desktopShoppingBagLayout';
import type { MansionDebugBounds, MansionDebugRegion } from '../types/desktopMansionDebug';
import { DESKTOP_GRAND_LOBBY_LAYOUT_SEED } from '../constants/desktopGrandLobbyLayout';
import { DESKTOP_SHOPPING_BAG_LAYOUT_SEED } from '../constants/desktopShoppingBagLayout';
import { imageRectToPercentRect } from './desktopPanelDebugMode';

export const MANSION_DEBUG_LAYOUT_OVERRIDE_KEY = 'mansionDebug:layoutOverrides';
export const MANSION_DEBUG_LAYOUT_UPDATED_EVENT = 'mansionDebugLayoutUpdated';

export const GRAND_LOBBY_LAYOUT_KEY_TO_DEBUG_ID: Record<DesktopGrandLobbyPanelRegionId, string> = {
  membershipAccess: 'membership-access-panel',
  mansionEconomy: 'mansion-economy-panel',
  mansionDirectory: 'mansion-directory-panel',
  welcomeMansion: 'welcome-to-mansion-panel',
  houseInformation: 'house-information-panel',
};

export const SHOPPING_BAG_LAYOUT_KEY_TO_DEBUG_ID: Record<DesktopShoppingBagRegionId, string> = {
  curatorTablet: 'curator-tablet-screen',
  collectionHeader: 'collection-header',
  cartGallery: 'cart-gallery',
  acquisitionSummary: 'acquisition-summary',
  emptyCollectionCta: 'empty-collection-cta',
};

export type MansionDebugLayoutOverrides = {
  regions: Record<string, MansionDebugBounds>;
};

export function createEmptyMansionDebugLayoutOverrides(): MansionDebugLayoutOverrides {
  return { regions: {} };
}

function dispatchLayoutUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(MANSION_DEBUG_LAYOUT_UPDATED_EVENT));
}

export function readMansionDebugLayoutOverrides(): MansionDebugLayoutOverrides {
  if (typeof window === 'undefined') return createEmptyMansionDebugLayoutOverrides();
  try {
    const raw = window.localStorage.getItem(MANSION_DEBUG_LAYOUT_OVERRIDE_KEY);
    if (!raw) return createEmptyMansionDebugLayoutOverrides();
    const parsed = JSON.parse(raw) as MansionDebugLayoutOverrides;
    if (!parsed || typeof parsed !== 'object' || !parsed.regions) {
      return createEmptyMansionDebugLayoutOverrides();
    }
    return parsed;
  } catch {
    return createEmptyMansionDebugLayoutOverrides();
  }
}

export function writeMansionDebugLayoutOverrides(overrides: MansionDebugLayoutOverrides): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MANSION_DEBUG_LAYOUT_OVERRIDE_KEY, JSON.stringify(overrides, null, 2));
    dispatchLayoutUpdated();
  } catch {
    /* ignore */
  }
}

export function clearMansionDebugLayoutOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(MANSION_DEBUG_LAYOUT_OVERRIDE_KEY);
    dispatchLayoutUpdated();
  } catch {
    /* ignore */
  }
}

export function resolveMansionDebugRegionBounds(
  region: MansionDebugRegion,
  overrides: MansionDebugLayoutOverrides = readMansionDebugLayoutOverrides(),
): MansionDebugBounds {
  return overrides.regions[region.id] ?? region.bounds;
}

export function resolveMansionDebugRegion(
  region: MansionDebugRegion,
  overrides: MansionDebugLayoutOverrides = readMansionDebugLayoutOverrides(),
): MansionDebugRegion {
  const bounds = resolveMansionDebugRegionBounds(region, overrides);
  if (bounds === region.bounds) return region;
  return { ...region, bounds };
}

export function resolveGrandLobbyPercentRect(
  regionId: DesktopGrandLobbyPanelRegionId,
  overrides: MansionDebugLayoutOverrides = readMansionDebugLayoutOverrides(),
): DesktopGrandLobbyPercentRect {
  const debugId = GRAND_LOBBY_LAYOUT_KEY_TO_DEBUG_ID[regionId];
  const override = debugId ? overrides.regions[debugId] : undefined;
  if (override) {
    return imageRectToPercentRect(override.imageRect) as DesktopGrandLobbyPercentRect;
  }
  return DESKTOP_GRAND_LOBBY_LAYOUT_SEED.rects[regionId];
}

export function formatGrandLobbyLayoutExport(
  overrides: MansionDebugLayoutOverrides,
): string {
  const rects = { ...DESKTOP_GRAND_LOBBY_LAYOUT_SEED.rects };

  for (const [regionId, debugId] of Object.entries(GRAND_LOBBY_LAYOUT_KEY_TO_DEBUG_ID) as [
    DesktopGrandLobbyPanelRegionId,
    string,
  ][]) {
    const override = overrides.regions[debugId];
    if (override) {
      rects[regionId] = imageRectToPercentRect(override.imageRect) as DesktopGrandLobbyPercentRect;
    }
  }

  return `// Paste into desktopGrandLobbyLayout.ts — DESKTOP_GRAND_LOBBY_LAYOUT_SEED
export const DESKTOP_GRAND_LOBBY_LAYOUT_SEED: DesktopGrandLobbyLayout = {
  rects: ${JSON.stringify(rects, null, 2)},
};`;
}

export function formatShoppingBagLayoutExport(
  overrides: MansionDebugLayoutOverrides,
): string {
  const rects = { ...DESKTOP_SHOPPING_BAG_LAYOUT_SEED.rects };

  for (const [regionId, debugId] of Object.entries(SHOPPING_BAG_LAYOUT_KEY_TO_DEBUG_ID) as [
    DesktopShoppingBagRegionId,
    string,
  ][]) {
    const override = overrides.regions[debugId];
    if (override) {
      rects[regionId] = imageRectToPercentRect(override.imageRect) as DesktopShoppingBagPercentRect;
    }
  }

  return `// Paste into desktopShoppingBagLayout.ts — DESKTOP_SHOPPING_BAG_LAYOUT_SEED
export const DESKTOP_SHOPPING_BAG_LAYOUT_SEED: DesktopShoppingBagLayout = {
  rects: ${JSON.stringify(rects, null, 2)},
};`;
}

export function formatMansionDebugLayoutExportForPage(
  page: string,
  overrides: MansionDebugLayoutOverrides,
): string {
  if (page === 'shopping-bag') return formatShoppingBagLayoutExport(overrides);
  return formatGrandLobbyLayoutExport(overrides);
}

export async function copyMansionDebugText(text: string): Promise<boolean> {
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
