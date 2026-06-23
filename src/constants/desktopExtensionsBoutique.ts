import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';

/** Extensions Boutique hero art — matches `8358D320…684.png` (1915×821). */
export const EXTENSIONS_BOUTIQUE_ART_WIDTH = 1915;
export const EXTENSIONS_BOUTIQUE_ART_HEIGHT = 821;

/**
 * Central hanging-extensions wall — image-normalized hit rect (0–1).
 * Covers the lit recess + bundles display below the red signage.
 */
export const EXTENSIONS_WALL_HOTSPOT_RECT: FinalSceneHitRect = {
  left: 0.33,
  top: 0.2,
  width: 0.34,
  height: 0.52,
};

export const EXTENSIONS_BOUTIQUE_SHOP_TABS = ['bundles', 'frontals', 'closures'] as const;
export type ExtensionsBoutiqueShopTab = (typeof EXTENSIONS_BOUTIQUE_SHOP_TABS)[number];

export const EXTENSIONS_BOUTIQUE_TAB_LABELS: Record<ExtensionsBoutiqueShopTab, string> = {
  bundles: 'BUNDLES',
  frontals: 'FRONTALS',
  closures: 'CLOSURES',
};
