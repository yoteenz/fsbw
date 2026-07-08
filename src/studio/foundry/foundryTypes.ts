/**
 * Studio Foundry™ — universal asset manufacturing types.
 * UI / Orb / Atlas consume assets by ID only; they never see generation details.
 */

import type { GenerationRecipeId, StudioFoundryAssetClass } from '../../studio-os-core/asset-compiler';

export const FOUNDRY_REGISTRY_VERSION = '1.0.0';
export const FOUNDRY_REGISTRY_STORAGE_KEY = 'studioFoundryAssetRegistry_v1';
export const FOUNDRY_REGISTRY_UPDATED_EVENT = 'studio-foundry-registry-updated';

export const FOUNDRY_ASSET_STATUSES = [
  'missing',
  'queued',
  'generating',
  'ready',
  'failed',
  'archived',
  'superseded',
] as const;

export type FoundryAssetStatus = (typeof FOUNDRY_ASSET_STATUSES)[number];

export type FoundryGenerationCost = {
  estimatedCost?: number;
  actualCost?: number;
  provider?: string;
  model?: string;
  generationTimeMs?: number;
  reuseSavings?: number;
};

export type FoundryWorldGraphRefs = {
  usedByDepartments: string[];
  usedByScenes: string[];
  usedByComponents: string[];
  originRecipe: GenerationRecipeId;
  relatedAssets: string[];
  supersedes?: string;
  supersededBy?: string;
};

export type FoundryAssetMetadata = {
  description?: string;
  promptIntent?: string;
  defaultUsage?: string[];
  registryDestination?: string;
  generationCost?: FoundryGenerationCost;
  worldGraph?: FoundryWorldGraphRefs;
  [key: string]: unknown;
};

/** Canonical manufactured asset record — stored in Foundry Asset Registry™. */
export type FoundryAsset = {
  assetId: string;
  slug: string;
  name: string;
  assetClass: StudioFoundryAssetClass;
  recipeId: GenerationRecipeId;
  version: string;
  status: FoundryAssetStatus;
  previewUrl?: string;
  sourceUrl?: string;
  transparentUrl?: string;
  metadata: FoundryAssetMetadata;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  usedBy: string[];
  worldGraphRefs: FoundryWorldGraphRefs;
};

export type FoundryAssetSeed = {
  slug: string;
  name: string;
  assetClass: StudioFoundryAssetClass;
  recipeId: GenerationRecipeId;
  description: string;
  promptIntent: string;
  tags: string[];
  defaultUsage: string[];
  registryDestination?: string;
};

export type FoundryAssetVersionRecord = {
  version: string;
  asset: FoundryAsset;
  archivedAt?: string;
};

export type FoundryAssetRegistryStore = {
  version: string;
  assets: Record<string, FoundryAsset>;
  versionHistory: Record<string, FoundryAssetVersionRecord[]>;
  updatedAt: string;
};

export type FoundryGenerateRequest = {
  slug: string;
  regenerate?: boolean;
  creator?: string;
  organizationId?: string;
};

export type FoundryGenerateResult = {
  ok: boolean;
  asset?: FoundryAsset;
  error?: string;
  adapter: 'fal-api' | 'local-plan-only' | 'unavailable';
};

export type FoundryResolveResult = {
  asset: FoundryAsset;
  cacheHit: boolean;
  queued: boolean;
};
