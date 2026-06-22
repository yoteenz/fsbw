import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';

/** Extensions Boutique hero art — 21:9 room environment. */
export const EXTENSIONS_BOUTIQUE_ART_WIDTH = 2560;
export const EXTENSIONS_BOUTIQUE_ART_HEIGHT = 1080;

/**
 * Hanging extensions wall — image-normalized hit rect (0–1).
 * Tuned to the left wall display in `8358D320…684.png`.
 */
export const EXTENSIONS_WALL_HOTSPOT_RECT: FinalSceneHitRect = {
  left: 0.048,
  top: 0.14,
  width: 0.175,
  height: 0.58,
};

export const EXTENSIONS_BOUTIQUE_SHOP_TABS = ['bundles', 'frontals', 'closures'] as const;
export type ExtensionsBoutiqueShopTab = (typeof EXTENSIONS_BOUTIQUE_SHOP_TABS)[number];

export const EXTENSIONS_BOUTIQUE_TAB_LABELS: Record<ExtensionsBoutiqueShopTab, string> = {
  bundles: 'BUNDLES',
  frontals: 'FRONTALS',
  closures: 'CLOSURES',
};
