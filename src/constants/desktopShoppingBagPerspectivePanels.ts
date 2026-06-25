import { DESKTOP_SHOPPING_BAG_LAYOUT_SEED } from './desktopShoppingBagLayout';
import { SHOPPING_BAG_LEGACY_PANEL_IDS } from './perspectivePanelIds';
import type { DesktopShoppingBagPercentRect, DesktopShoppingBagRegionId } from '../types/desktopShoppingBagLayout';
import type { PerspectivePanelId, PerspectivePanelQuad } from '../types/perspectivePanel';
import { rectToPerspectivePanelQuad } from '../utils/perspectivePanelQuad';

export const SHOPPING_BAG_REGION_TO_PERSPECTIVE_PANEL: Record<
  DesktopShoppingBagRegionId,
  PerspectivePanelId
> = {
  curatorTablet: SHOPPING_BAG_LEGACY_PANEL_IDS.curatorTablet,
  collectionHeader: SHOPPING_BAG_LEGACY_PANEL_IDS.collectionHeader,
  cartGallery: SHOPPING_BAG_LEGACY_PANEL_IDS.cartGallery,
  acquisitionSummary: SHOPPING_BAG_LEGACY_PANEL_IDS.acquisitionSummary,
  emptyCollectionCta: SHOPPING_BAG_LEGACY_PANEL_IDS.emptyCollectionCta,
};

export const ACQUISITION_REGION_TO_PERSPECTIVE_PANEL: Partial<
  Record<DesktopShoppingBagRegionId, PerspectivePanelId>
> = {
  curatorTablet: SHOPPING_BAG_LEGACY_PANEL_IDS.checkoutTablet,
  cartGallery: SHOPPING_BAG_LEGACY_PANEL_IDS.acquisitionCollectionList,
  acquisitionSummary: SHOPPING_BAG_LEGACY_PANEL_IDS.acquisitionSummaryPanel,
};

export function shoppingBagPercentRectToPerspectiveQuad(
  rect: DesktopShoppingBagPercentRect,
): PerspectivePanelQuad {
  return rectToPerspectivePanelQuad({
    left: rect.x / 100,
    top: rect.y / 100,
    width: rect.width / 100,
    height: rect.height / 100,
  });
}

export function defaultShoppingBagRegionPerspectiveQuad(
  regionId: DesktopShoppingBagRegionId,
): PerspectivePanelQuad {
  const rect = DESKTOP_SHOPPING_BAG_LAYOUT_SEED.rects[regionId];
  return shoppingBagPercentRectToPerspectiveQuad(rect);
}
