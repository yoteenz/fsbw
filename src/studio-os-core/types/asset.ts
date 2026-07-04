/**
 * studio os platform asset types — industry-agnostic visual and media contracts.
 */

export type PlatformAssetCategoryId =
  | 'image'
  | 'video'
  | 'audio'
  | 'prompt'
  | 'template'
  | 'environment'
  | 'character'
  | 'product'
  | 'brand'
  | 'document';

export type PlatformAssetStatus = 'draft' | 'review' | 'approved' | 'deprecated' | 'archived';

export type PlatformAssetRecord = {
  id: string;
  title: string;
  category: PlatformAssetCategoryId;
  status: PlatformAssetStatus;
  thumbnailSrc?: string;
  accentHex?: string;
  tags?: string[];
  version?: string;
};

export type AssetFactoryViewMode = 'executive' | 'floor' | 'tour';

export type AssetFactoryProviderId =
  | 'fal'
  | 'openart'
  | 'runway'
  | 'flux'
  | 'imagen'
  | 'veo'
  | 'gpt-image'
  | 'internal';

export type AssetFactoryProviderStatus = 'connected' | 'standby' | 'disconnected';

export type AssetFactoryProvider = {
  id: AssetFactoryProviderId;
  label: string;
  status: AssetFactoryProviderStatus;
  capabilities: string[];
  note: string;
};

export type AssetDirectorStatus = 'draft' | 'review' | 'approved' | 'live' | 'archived';

export type ContentPackAssetSelection = {
  categoryId: string;
  assetId: string;
  label: string;
  thumbnailSrc?: string;
};
