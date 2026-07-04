/** Product Asset Factory — pipeline types (Brand Assets / Photography Bible). */

import type { MasterHeroGenerationRecord } from '../productPhotographyGeneration/types.js';

export type { MasterHeroGenerationRecord };

export type ProductAssetFactoryStage =
  | 'reference-ready'
  | 'generating-master-hero'
  | 'hero-generated'
  | 'awaiting-hero-approval'
  | 'hero-approved'
  | 'removing-background'
  | 'transparent-master-generated'
  | 'generating-smart-assets'
  | 'uploading-to-supabase'
  | 'registering-assets'
  | 'ready-for-review'
  | 'published'
  | 'failed';

export type ProductAssetFactoryAction =
  | 'generate-hero'
  | 'approve-hero'
  | 'run-derivatives'
  | 'regenerate-derivative'
  | 'retry';

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
  status: 'ready-for-review' | 'approved' | 'published' | 'failed';
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
  /** Existing website product image — reference input only, never processed as master. */
  productReferenceUrl: string;
  /** Fal-generated Master Hero Portrait from Creative DNA v1.0. */
  generatedMasterHeroUrl?: string;
  /** FAL generation metadata — canonical source for preview/debug. */
  masterHeroGeneration?: MasterHeroGenerationRecord;
  heroApproved: boolean;
  /** Approved generated master used for derivative processing. */
  masterHeroUrl: string;
  transparentMasterUrl?: string;
  derivativeCount: number;
  registryEntryIds: string[];
  startedAt: string;
  lastUpdated: string;
};

export const DERIVATIVE_BLOCKED_MESSAGE =
  'Generated Master Hero required before derivative processing.';
