export type DesktopShoppingBagRegionId =
  | 'curatorTablet'
  | 'collectionHeader'
  | 'cartGallery'
  | 'acquisitionSummary'
  | 'emptyCollectionCta';

export type DesktopShoppingBagPercentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DesktopShoppingBagLayout = {
  rects: Record<DesktopShoppingBagRegionId, DesktopShoppingBagPercentRect>;
};
