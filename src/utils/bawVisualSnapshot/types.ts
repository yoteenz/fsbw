/** Build-A-Wig visual snapshot statuses (Milestone 21.5). */
export type BawVisualSnapshotStatus =
  | 'READY'
  | 'MISSING'
  | 'GENERATING'
  | 'FALLBACK_USED'
  | 'NEEDS_REVIEW';

/** Surface-specific crop context for derivative / variant assets. */
export type BawVisualSnapshotContext =
  | 'cart-dropdown'
  | 'wishlist'
  | 'cart-page'
  | 'checkout'
  | 'order-confirmation'
  | 'order-history'
  | 'admin-order';

/** Asset naming suffix — `{unitSlug}_{colorSlug}_{suffix}`. */
export type BawVisualSnapshotCropSuffix =
  | 'hero'
  | 'cart'
  | 'wishlist'
  | 'checkout'
  | 'order'
  | 'admin';

export type BawVisualSnapshot = {
  baseUnitId: string;
  baseUnitLabel: string;
  colorName: string;
  colorHex: string;
  colorSlug: string;
  length?: string;
  density?: string;
  lace?: string;
  capSize?: string;
  texture?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
  assetId: string;
  url: string;
  urlsByContext?: Partial<Record<BawVisualSnapshotCropSuffix, string>>;
  status: BawVisualSnapshotStatus;
  fallbackUrl?: string;
  fallbackLabel?: string;
  generationRequestId?: string;
  preparedAt: string;
};

export type BawVisualSnapshotBuildInput = {
  productName: string;
  capSize?: string;
  length?: string;
  density?: string;
  color?: string;
  texture?: string;
  lace?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
};

/** Flattened fields stored on cart lines and persisted order line items. */
export type BawVisualSnapshotCartFields = {
  visualSnapshot?: BawVisualSnapshot;
  visualSnapshotAssetId?: string;
  visualSnapshotUrl?: string;
  visualSnapshotStatus?: BawVisualSnapshotStatus;
  baseUnitId?: string;
  selectedColorHex?: string;
};
