// Legacy module — re-exports quad API for any stale imports.
export {
  clearShoppingBagTabletQuad as clearShoppingBagTabletPercentRect,
  copyShoppingBagTabletDebugText,
  defaultShoppingBagTabletQuad as defaultShoppingBagTabletPercentRect,
  formatShoppingBagTabletQuadForExport as formatShoppingBagTabletRectForExport,
  hasSavedShoppingBagTabletQuad as hasSavedShoppingBagTabletRect,
  loadEffectiveShoppingBagTabletQuad as loadEffectiveShoppingBagTabletPercentRect,
  loadShoppingBagTabletQuad as loadShoppingBagTabletPercentRect,
  saveShoppingBagTabletQuad as saveShoppingBagTabletPercentRect,
  SHOPPING_BAG_TABLET_LAYOUT_STORAGE_KEY as SHOPPING_BAG_TABLET_DEBUG_STORAGE_KEY,
  type ShoppingBagTabletQuad as ShoppingBagTabletPercentRect,
} from './desktopShoppingBagTabletQuad';
