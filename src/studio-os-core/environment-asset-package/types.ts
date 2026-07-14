/**
 * Environment Asset Package — canonical Studio World production object.
 * One environment · many deliverables · unified multi-platform pipeline.
 */

import type { CanonicalMainDepartmentId } from '../canonical-studio-world/canonical-department-registry';

export const ENVIRONMENT_PACKAGE_SCHEMA_VERSION = 'studio.environment-package.v1' as const;

/** Exactly six architectural directions per environment (not crops or camera angles). */
export const ENVIRONMENT_VARIANT_IDS = [
  'light-01',
  'light-02',
  'light-03',
  'dark-01',
  'dark-02',
  'dark-03',
] as const;

export type EnvironmentVariantId = (typeof ENVIRONMENT_VARIANT_IDS)[number];

export type EnvironmentVariantTheme = 'light' | 'dark';

export type EnvironmentPackageStatus =
  | 'generating'
  | 'review'
  | 'approved'
  | 'canonical'
  | 'archived'
  | 'deprecated'
  | 'superseded'
  | 'marketplace-ready'
  | 'production-ready'
  | 'failed';

export type EnvironmentGenerationStage = 'concept-preview' | 'production-package';

/** Responsive outputs derived from ONE approved variant — not separate designs. */
export type EnvironmentOutputFormatId =
  | 'desktop-21-9'
  | 'mobile-9-16'
  | 'tablet-4-3'
  | 'hero-landscape'
  | 'hero-portrait'
  | 'thumbnail-square'
  | 'thumbnail-wide'
  | 'preview-card'
  | 'studio-preview'
  | 'depth-map'
  | 'mask'
  | 'vision-pro'
  | 'apple-tv'
  | 'desktop-ultra-wide'
  | 'social-story'
  | 'marketplace-card'
  | 'animated-preview';

export type EnvironmentOutputStatus = 'pending' | 'generating' | 'ready' | 'failed' | 'cached';

export type EnvironmentOutputRecord = {
  formatId: EnvironmentOutputFormatId;
  aspectRatio: string;
  status: EnvironmentOutputStatus;
  url: string | null;
  width: number | null;
  height: number | null;
  byteSize: number | null;
  generatedAt: string | null;
  provider: string | null;
  lazy: boolean;
};

export type EnvironmentProductionAssetKind =
  | 'blueprint'
  | 'construction-plan'
  | 'lighting-profile'
  | 'materials-profile'
  | 'asset-manifest'
  | 'prompt-archive'
  | 'seed-archive'
  | 'revision-history';

export type EnvironmentProductionAssetRecord = {
  kind: EnvironmentProductionAssetKind;
  status: EnvironmentOutputStatus;
  revision: number;
  url: string | null;
  summary: string | null;
};

export type EnvironmentVariantRecord = {
  id: EnvironmentVariantId;
  name: string;
  theme: EnvironmentVariantTheme;
  stage: EnvironmentGenerationStage;
  architecturalSummary: string;
  promptHash: string;
  promptRevision: number;
  seed: string;
  provider: string;
  model: string;
  estimatedCostUsd: number;
  generatedAt: string;
  approvalStatus: EnvironmentPackageStatus;
  vaultStatus: 'active' | 'archived' | 'marketplace-ready';
  outputs: EnvironmentOutputRecord[];
  productionAssets: EnvironmentProductionAssetRecord[];
};

export type EnvironmentPackageMetadata = {
  environmentId: string;
  departmentId: CanonicalMainDepartmentId;
  displayName: string;
  revision: number;
  prompt: string;
  promptVersion: string;
  provider: string;
  model: string;
  seed: string;
  costUsd: number;
  generationTimeMs: number | null;
  approvalDate: string | null;
  founderNotes: string | null;
  variantNotes: Partial<Record<EnvironmentVariantId, string>>;
  materialSetId: string | null;
  lightingProfileId: string | null;
  constructionProfileId: string | null;
  blueprintProfileId: string | null;
};

export type EnvironmentPackageRevisionEntry = {
  revision: number;
  promotedVariantId: EnvironmentVariantId | null;
  status: EnvironmentPackageStatus;
  changedAt: string;
  reason: string;
};

export type EnvironmentAssetPackage = {
  schemaVersion: typeof ENVIRONMENT_PACKAGE_SCHEMA_VERSION;
  packageId: string;
  status: EnvironmentPackageStatus;
  stage: EnvironmentGenerationStage;
  metadata: EnvironmentPackageMetadata;
  variants: EnvironmentVariantRecord[];
  promotedVariantId: EnvironmentVariantId | null;
  revisionHistory: EnvironmentPackageRevisionEntry[];
  cacheKey: string;
  marketplaceReady: boolean;
};

export type EnvironmentPackageCacheLookup = {
  departmentId: CanonicalMainDepartmentId;
  environmentId: string;
  revision: number;
  promptHash: string;
  seed: string;
  provider: string;
};

export type EnvironmentPackageRegenerationRequest = {
  reason:
    | 'founder-request'
    | 'prompt-changed'
    | 'department-bible-changed'
    | 'revision-increment'
    | 'canonical-environment-changed'
    | 'provider-changed'
    | 'seed-changed';
  force: boolean;
};

export type EnvironmentPackageLazyLoadRequest = {
  packageId: string;
  variantId: EnvironmentVariantId;
  formatId: EnvironmentOutputFormatId;
};

export type EnvironmentPackageConsumerRef = {
  packageId: string;
  variantId?: EnvironmentVariantId;
  outputFormatId?: EnvironmentOutputFormatId;
  productionAssetKind?: EnvironmentProductionAssetKind;
};

export type EnvironmentPackageDrawerModel = {
  environmentName: string;
  variantName: string;
  variantId: EnvironmentVariantId;
  packageStatus: EnvironmentPackageStatus;
  desktopPreviewUrl: string | null;
  mobilePreviewUrl: string | null;
  tabletPreviewUrl: string | null;
  outputsGenerated: number;
  outputsPending: number;
  assetCount: number;
  generationCostUsd: number;
  provider: string;
  seed: string;
  promptVersion: string;
  blueprintReady: boolean;
  constructionReady: boolean;
  lightingReady: boolean;
  materialReady: boolean;
  marketplaceReady: boolean;
};
