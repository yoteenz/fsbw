/**
 * Brand Assets Product Asset Factory — client registry mirror of server pipeline.
 */

import { CREATIVE_DNA_BENCHMARK_OUTPUT } from './CreativeDnaRegistry';

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

export const PRODUCT_ASSET_FACTORY_STAGES: readonly ProductAssetFactoryStage[] = [
  'waiting',
  'removing-background',
  'generating-transparent-master',
  'generating-derivatives',
  'uploading-to-supabase',
  'registering-assets',
  'ready-for-review',
  'published',
] as const;

export const PRODUCT_ASSET_FACTORY_STAGE_LABELS: Record<ProductAssetFactoryStage, string> = {
  waiting: 'Waiting',
  'removing-background': 'Removing Background',
  'generating-transparent-master': 'Generating Transparent Master',
  'generating-derivatives': 'Generating Derivatives',
  'uploading-to-supabase': 'Uploading To Supabase',
  'registering-assets': 'Registering Assets',
  'ready-for-review': 'Ready For Review',
  published: 'Published',
  failed: 'Failed',
};

export const PRODUCT_ASSET_FACTORY_POC_UNIT = {
  slug: 'soft-wave' as const,
  label: 'SOFT WAVE',
  collectionNumber: '003',
  productLine: 'signature-collection',
  version: 'v1',
  masterHeroSrc: CREATIVE_DNA_BENCHMARK_OUTPUT.heroPortraitSrc,
};

export type ProductAssetRegistryRecord = {
  id: string;
  product: string;
  productSlug: string;
  collectionNumber: string;
  version: string;
  assetType: string;
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

export type ProductAssetFactoryJobRecord = {
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

export type ProductAssetFactoryLogRecord = {
  id: string;
  timestamp: string;
  stage: ProductAssetFactoryStage;
  message: string;
  level: 'info' | 'warn' | 'error';
};

/** Supabase folder example for docs/UI. */
export function productAssetSupabasePath(unitSlug: string, version: string, fileName: string): string {
  return `products/signature-collection/${unitSlug}/${version}/${fileName}`;
}
