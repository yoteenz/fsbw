/**
 * Studio Warehouse™ — physical manifestation of Asset Registry™.
 * Not folders. Not a file explorer. Living warehouse districts.
 */

export const WAREHOUSE_DISTRICT_IDS = [
  'environment-gallery',
  'lighting-gallery',
  'furniture-hall',
  'materials-library',
  'atmosphere-lab',
  'hero-object-vault',
  'motion-sound-wing',
  'texture-archive',
] as const;

export type WarehouseDistrictId = (typeof WAREHOUSE_DISTRICT_IDS)[number];

export type WarehouseAssetCategory =
  | 'environment-shell'
  | 'lighting-pack'
  | 'furniture'
  | 'architecture'
  | 'materials'
  | 'hero-object'
  | 'particles'
  | 'atmosphere'
  | 'runtime-fx'
  | 'animation'
  | 'audio'
  | 'icon'
  | 'texture';

export type WarehouseMarketplaceStatus = 'owned' | 'imported' | 'marketplace-listed' | 'not-listed';

export type WarehouseAsset = {
  id: string;
  name: string;
  version: string;
  category: WarehouseAssetCategory;
  districtId: WarehouseDistrictId;
  department: string;
  workspace: string;
  generationDate: string;
  generationCostUsd: number;
  provider: string;
  usageCount: number;
  reuseCount: number;
  marketplaceStatus: WarehouseMarketplaceStatus;
  genomeCompatibilityPct: number;
  previewGradient: string;
  previewUrl?: string;
  tags: string[];
  similarAssetIds: string[];
  compatibleScenePackIds: string[];
  goldenBuildCount: number;
  archived: boolean;
  favorite: boolean;
  registryAssetId?: string;
};

export type WarehouseSceneRecipeIngredient = {
  role: string;
  assetId: string;
  assetName: string;
  version: string;
};

export type WarehouseSceneRecipe = {
  workspaceId: string;
  workspaceName: string;
  department: string;
  ingredients: WarehouseSceneRecipeIngredient[];
};

export type WarehouseRecommendation = {
  assetId: string;
  reasons: string[];
  savingsPct: number;
  compatibilityPct: number;
};

export type WarehouseSearchResult = {
  asset: WarehouseAsset;
  score: number;
  matchedTerms: string[];
};

export type WarehouseReplaceContext = {
  workspaceId: string;
  workspaceName: string;
  slotRole: string;
  currentAssetId: string;
};

export type WarehouseViewMode = 'districts' | 'recipe' | 'marketplace' | 'search';
