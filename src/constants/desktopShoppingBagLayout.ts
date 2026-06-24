import type {
  DesktopShoppingBagLayout,
  DesktopShoppingBagPercentRect,
  DesktopShoppingBagRegionId,
} from '../types/desktopShoppingBagLayout';

/**
 * Default alignment for shopping bag interactive regions on the Curator hero.
 * Tune with Mansion Debug (press D) on `/desktop/shopping-bag`.
 */
export const DESKTOP_SHOPPING_BAG_LAYOUT_SEED: DesktopShoppingBagLayout = {
  rects: {
    curatorTablet: { x: 19.8, y: 9.2, width: 60.4, height: 82.4 },
    collectionHeader: { x: 24, y: 12, width: 52, height: 11 },
    cartGallery: { x: 22, y: 24, width: 56, height: 46 },
    acquisitionSummary: { x: 22, y: 73, width: 56, height: 14 },
    emptyCollectionCta: { x: 32, y: 40, width: 36, height: 18 },
  },
};

export function getDesktopShoppingBagRect(
  layout: DesktopShoppingBagLayout,
  id: DesktopShoppingBagRegionId,
): DesktopShoppingBagPercentRect {
  return layout.rects[id] ?? DESKTOP_SHOPPING_BAG_LAYOUT_SEED.rects[id];
}

export function desktopShoppingBagRectToImageRect(rect: DesktopShoppingBagPercentRect) {
  return {
    left: rect.x / 100,
    top: rect.y / 100,
    width: rect.width / 100,
    height: rect.height / 100,
  };
}
