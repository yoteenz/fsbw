import type { AssetCategory, RegisteredAssetEntry } from '../asset-registry';

export const ASSET_COMPILER_VERSION = '1.0.0';
export const ASSET_COMPILER_ARTICLE = 'ARTICLE-A01';

export const GENERATION_RECIPE_IDS = [
  'hero-icon',
  'environment',
  'furniture',
  'orb',
  'glass-ui',
  'room',
  'architecture',
  'material',
  'particle',
  'animation',
  'portrait',
  'brand-asset',
] as const;

export type GenerationRecipeId = (typeof GENERATION_RECIPE_IDS)[number];

export type AssetCompilerBackgroundBehavior =
  | 'transparent'
  | 'studio-world-environment'
  | 'none'
  | 'runtime-composited';

export type AssetCompilerVersioningStrategy =
  | 'semantic-version'
  | 'date-stamped-version'
  | 'immutable-generation'
  | 'surgical-regeneration';

export type AssetCompilerOutputFormat = 'png' | 'webp' | 'glb' | 'gltf' | 'json' | 'mp4';

export type AssetCompilerFalModel =
  | 'openai/gpt-image-2/edit'
  | 'fal-ai/nano-banana-pro/edit'
  | 'fal-ai/ideogram/remove-background'
  | 'fal-ai/kling-video/v3/pro/image-to-video'
  | 'deterministic-runtime';

export type GenerationRecipe = {
  id: GenerationRecipeId;
  label: string;
  falModel: AssetCompilerFalModel;
  defaultPromptPrefix: string;
  negativePrompt: string;
  resolution: string;
  aspectRatio: string;
  backgroundBehavior: AssetCompilerBackgroundBehavior;
  lightingProfile: string;
  materialProfile: string;
  outputFormat: AssetCompilerOutputFormat;
  registryDestination: AssetCategory;
  versioningStrategy: AssetCompilerVersioningStrategy;
  upscalingPipeline: string;
  metadata: {
    tags: string[];
    relatedSystems: string[];
    departmentsUsingIt: string[];
    transparentBackground: boolean;
    registryLibrary: string;
  };
};

export type AssetCompilerIntent = {
  assetName: string;
  recipeId: GenerationRecipeId;
  modifiers?: string[];
  creator?: string;
  organizationId?: string;
  targetDepartments?: string[];
  dependencies?: string[];
};

export type AssetCompilerFalRequest = {
  model: AssetCompilerFalModel;
  input: Record<string, string | number | boolean | string[]>;
};

export type CompiledAssetMetadata = {
  assetId: string;
  recipe: GenerationRecipeId;
  version: string;
  prompt: string;
  generationParameters: {
    model: AssetCompilerFalModel;
    resolution: string;
    aspectRatio: string;
    outputFormat: AssetCompilerOutputFormat;
    backgroundBehavior: AssetCompilerBackgroundBehavior;
    lightingProfile: string;
    materialProfile: string;
    negativePrompt: string;
  };
  dependencies: string[];
  tags: string[];
  departmentsUsingIt: string[];
  creator: string;
  createdDate: string;
  preview: string;
  relationships: string[];
  registryDestination: AssetCategory;
  registryLibrary: string;
  storagePath: string;
};

export type AssetCompilerPlan = {
  compilerVersion: string;
  article: typeof ASSET_COMPILER_ARTICLE;
  intent: AssetCompilerIntent;
  recipe: GenerationRecipe;
  falRequest: AssetCompilerFalRequest;
  metadata: CompiledAssetMetadata;
  registryEntry: RegisteredAssetEntry;
};
