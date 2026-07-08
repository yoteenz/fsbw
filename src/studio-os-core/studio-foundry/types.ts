import type { RegisteredAssetEntry } from '../asset-registry';
import type {
  AssetCompilerIntent,
  AssetCompilerPlan,
  GenerationRecipeId,
  StudioFoundryAssetClass,
} from '../asset-compiler';

export const STUDIO_FOUNDRY_VERSION = '1.0.0';
export const STUDIO_FOUNDRY_ARTICLE = 'ARTICLE-A02';

export type StudioFoundryAssetClassStatus = 'supported' | 'planned';

export type StudioFoundryAssetClassRecord = {
  id: StudioFoundryAssetClass;
  label: string;
  status: StudioFoundryAssetClassStatus;
  recipeId?: GenerationRecipeId;
  description: string;
};

export type StudioFoundryResolveRequest = {
  /**
   * Orb, Atlas, and UI should request assets by ID only. The Foundry decides
   * whether the registry can satisfy that ID or manufacturing is required.
   */
  assetId: string;
  registry: RegisteredAssetEntry[];
  regenerate?: boolean;
  manufacturingIntent?: AssetCompilerIntent;
};

export type StudioFoundryResolutionStatus = 'registry-hit' | 'manufactured' | 'regenerated';

export type StudioFoundryResolution = {
  article: typeof STUDIO_FOUNDRY_ARTICLE;
  foundryVersion: string;
  status: StudioFoundryResolutionStatus;
  cacheHit: boolean;
  assetId: string;
  registryEntry: RegisteredAssetEntry;
  updatedRegistry: RegisteredAssetEntry[];
  manufacturingPlan?: AssetCompilerPlan;
  pipeline: string[];
};
