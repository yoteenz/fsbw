/**
 * Brand Assets Product Asset Factory — client registry mirror of server pipeline.
 */

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

export type ProductAssetFactoryAction = 'generate-hero' | 'approve-hero' | 'run-derivatives' | 'retry';

export const PRODUCT_ASSET_FACTORY_STAGES: readonly ProductAssetFactoryStage[] = [
  'reference-ready',
  'generating-master-hero',
  'hero-generated',
  'awaiting-hero-approval',
  'hero-approved',
  'removing-background',
  'transparent-master-generated',
  'generating-smart-assets',
  'uploading-to-supabase',
  'registering-assets',
  'ready-for-review',
  'published',
] as const;

export const PRODUCT_ASSET_FACTORY_STAGE_LABELS: Record<ProductAssetFactoryStage, string> = {
  'reference-ready': 'Reference Ready',
  'generating-master-hero': 'Generating Master Hero',
  'hero-generated': 'Hero Generated',
  'awaiting-hero-approval': 'Awaiting Hero Approval',
  'hero-approved': 'Hero Approved',
  'removing-background': 'Removing Background',
  'transparent-master-generated': 'Transparent Master Generated',
  'generating-smart-assets': 'Generating Smart Assets',
  'uploading-to-supabase': 'Uploading To Supabase',
  'registering-assets': 'Registering Assets',
  'ready-for-review': 'Ready For Review',
  published: 'Published',
  failed: 'Failed',
};

/** Legacy stage labels for jobs persisted before Milestone 24.2. */
const LEGACY_STAGE_LABELS: Record<string, string> = {
  waiting: 'Reference Ready',
  'generating-transparent-master': 'Transparent Master Generated',
  'generating-derivatives': 'Generating Smart Assets',
};

export function productAssetFactoryStageLabel(stage: string): string {
  return (
    PRODUCT_ASSET_FACTORY_STAGE_LABELS[stage as ProductAssetFactoryStage] ??
    LEGACY_STAGE_LABELS[stage] ??
    stage
  );
}

export const PRODUCT_ASSET_FACTORY_POC_UNIT = {
  slug: 'soft-wave' as const,
  label: 'SOFT WAVE',
  collectionNumber: '003',
  productLine: 'signature-collection',
  version: 'v1',
  /** Website product image — reference input only, not the processing master. */
  productReferenceSrc: '/assets/2D WAVY FRONT.png',
} as const;

export const DERIVATIVE_BLOCKED_MESSAGE =
  'Generated Master Hero required before derivative processing.';

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
  stage: ProductAssetFactoryStage | string;
  failedStage?: ProductAssetFactoryStage | string;
  error?: string;
  productReferenceUrl?: string;
  generatedMasterHeroUrl?: string;
  heroApproved?: boolean;
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
  stage: ProductAssetFactoryStage | string;
  message: string;
  level: 'info' | 'warn' | 'error';
};

/** Supabase folder example for docs/UI. */
export function productAssetSupabasePath(unitSlug: string, version: string, fileName: string): string {
  return `products/signature-collection/${unitSlug}/${version}/${fileName}`;
}
