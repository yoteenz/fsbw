import { DESKTOP_SHOPPING_BAG_LAYOUT_SEED } from './desktopShoppingBagLayout';
import type { DesktopShoppingBagPercentRect, DesktopShoppingBagRegionId } from '../types/desktopShoppingBagLayout';
import type { PerspectivePanelId, PerspectivePanelQuad } from '../types/perspectivePanel';
import { rectToPerspectivePanelQuad } from '../utils/perspectivePanelQuad';

export const SHOPPING_BAG_REGION_TO_PERSPECTIVE_PANEL: Record<
  DesktopShoppingBagRegionId,
  PerspectivePanelId
> = {
  curatorTablet: 'curator-tablet',
  collectionHeader: 'shopping-bag-collection-header',
  cartGallery: 'shopping-bag-cart-gallery',
  acquisitionSummary: 'shopping-bag-acquisition-summary',
  emptyCollectionCta: 'shopping-bag-empty-cta',
};

export const ACQUISITION_REGION_TO_PERSPECTIVE_PANEL: Partial<
  Record<DesktopShoppingBagRegionId, PerspectivePanelId>
> = {
  curatorTablet: 'checkout-tablet',
  cartGallery: 'acquisition-collection-list',
  acquisitionSummary: 'acquisition-summary-panel',
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
