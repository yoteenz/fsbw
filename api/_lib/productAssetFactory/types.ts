/** Product Asset Factory — pipeline types (Brand Assets / Photography Bible). */

export type ProductAssetFactoryStage =
  | 'waiting'
  | 'removing-background'
  | 'generating-transparent-master'
  | 'generating-derivatives'
  | 'uploading-to-supabase'
  | 'registering-assets'
  | 'ready-for-review'
  | 'published'
  | 'failed';

export type ProductAssetFactoryAssetType =
  | 'master-white'
  | 'master-transparent'
  | 'wishlist'
  | 'cart'
  | 'checkout'
  | 'product-card'
  | 'product-page'
  | 'collection-grid'
  | 'search-result'
  | 'email'
  | 'desktop'
  | 'mobile'
  | 'studio-preview'
  | 'thumbnail';

export type ProductAssetRegistryEntry = {
  id: string;
  product: string;
  productSlug: string;
  collectionNumber: string;
  version: string;
  assetType: ProductAssetFactoryAssetType;
  cropTemplateId: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  transparency: boolean;
  supabaseUrl: string;
  storagePath: string;
  createdDate: string;
  lastUpdated: string;
  status: 'ready-for-review' | 'published' | 'failed';
};

export type ProductAssetFactoryLogEntry = {
  id: string;
  timestamp: string;
  stage: ProductAssetFactoryStage;
  message: string;
  level: 'info' | 'warn' | 'error';
};

export type ProductAssetFactoryJob = {
  id: string;
  unitSlug: string;
  productLabel: string;
  collectionNumber: string;
  version: string;
  stage: ProductAssetFactoryStage;
  failedStage?: ProductAssetFactoryStage;
  error?: string;
  masterHeroUrl: string;
  transparentMasterUrl?: string;
  derivativeCount: number;
  registryEntryIds: string[];
  startedAt: string;
  lastUpdated: string;
};
