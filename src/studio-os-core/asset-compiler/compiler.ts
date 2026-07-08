import type { RegisteredAssetEntry } from '../asset-registry';
import { getGenerationRecipe } from './recipes';
import {
  ASSET_COMPILER_ARTICLE,
  ASSET_COMPILER_VERSION,
  type AssetCompilerFalRequest,
  type AssetCompilerIntent,
  type AssetCompilerPlan,
  type CompiledAssetMetadata,
  type GenerationRecipe,
} from './types';

function slugify(value: string): string {
  return value
    .trim()
    .replace(/™/g, '')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function dateStamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function semanticVersionFor(recipe: GenerationRecipe): string {
  if (recipe.versioningStrategy === 'date-stamped-version') return `${dateStamp(new Date())}.1`;
  return '1.0.0';
}

export function buildAssetCompilerPrompt(intent: AssetCompilerIntent, recipe: GenerationRecipe): string {
  const modifiers = intent.modifiers?.map((m) => m.trim()).filter(Boolean) ?? [];
  return [
    recipe.defaultPromptPrefix,
    `ASSET NAME: ${intent.assetName}.`,
    modifiers.length ? `OPTIONAL MODIFIERS: ${modifiers.join(' · ')}.` : '',
    `LIGHTING PROFILE: ${recipe.lightingProfile}.`,
    `MATERIAL PROFILE: ${recipe.materialProfile}.`,
    `BACKGROUND BEHAVIOR: ${recipe.backgroundBehavior}.`,
    `OUTPUT: ${recipe.outputFormat.toUpperCase()} · ${recipe.aspectRatio} · ${recipe.resolution}.`,
    'Studio World asset compiler output only — reusable asset, registry-ready, versioned, metadata-safe.',
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildFalGenerationRequest(
  intent: AssetCompilerIntent,
  recipe: GenerationRecipe
): AssetCompilerFalRequest {
  const prompt = buildAssetCompilerPrompt(intent, recipe);

  if (recipe.falModel === 'deterministic-runtime') {
    return {
      model: recipe.falModel,
      input: {
        prompt,
        recipe: recipe.id,
        output_format: recipe.outputFormat,
      },
    };
  }

  return {
    model: recipe.falModel,
    input: {
      prompt,
      negative_prompt: recipe.negativePrompt,
      num_images: 1,
      aspect_ratio: recipe.aspectRatio,
      output_format: recipe.outputFormat,
      resolution: recipe.resolution,
      transparent_background: recipe.metadata.transparentBackground,
    },
  };
}

export function buildCompiledAssetMetadata(
  intent: AssetCompilerIntent,
  recipe: GenerationRecipe,
  falRequest: AssetCompilerFalRequest,
  createdAt = new Date()
): CompiledAssetMetadata {
  const safeName = slugify(intent.assetName || recipe.label);
  const assetId = intent.assetId?.trim() || `asset-${recipe.id}-${safeName}`;
  const version = semanticVersionFor(recipe);
  const ext = recipe.outputFormat;
  const organization = slugify(intent.organizationId || 'studio-world');
  const storagePath = `asset-compiler/${organization}/${recipe.id}/${safeName}/v${version}/${assetId}.${ext}`;

  return {
    assetId,
    recipe: recipe.id,
    version,
    prompt: String(falRequest.input.prompt || ''),
    generationParameters: {
      model: falRequest.model,
      resolution: recipe.resolution,
      aspectRatio: recipe.aspectRatio,
      outputFormat: recipe.outputFormat,
      backgroundBehavior: recipe.backgroundBehavior,
      lightingProfile: recipe.lightingProfile,
      materialProfile: recipe.materialProfile,
      negativePrompt: recipe.negativePrompt,
    },
    dependencies: intent.dependencies ?? [],
    tags: Array.from(new Set([...recipe.metadata.tags, ...(intent.modifiers ?? []).map(slugify)])),
    departmentsUsingIt: intent.targetDepartments?.length
      ? intent.targetDepartments
      : recipe.metadata.departmentsUsingIt,
    creator: intent.creator || 'Founder',
    createdDate: createdAt.toISOString(),
    preview: storagePath,
    relationships: recipe.metadata.relatedSystems,
    registryDestination: recipe.registryDestination,
    foundryAssetClass: recipe.metadata.foundryAssetClass,
    storagePath,
  };
}

export function buildAssetRegistryEntry(metadata: CompiledAssetMetadata): RegisteredAssetEntry {
  return {
    assetId: metadata.assetId,
    name: metadata.assetId
      .replace(/^asset-/, '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    category: metadata.registryDestination,
    owner: metadata.creator,
    department: metadata.departmentsUsingIt[0] ?? 'Studio World',
    version: metadata.version,
    tags: metadata.tags,
    description: `${metadata.foundryAssetClass} asset manufactured by Studio Foundry™ using the ${metadata.recipe} Generation Recipe™.`,
    relatedSystems: metadata.relationships,
    lastModified: metadata.createdDate,
    usageCount: 0,
    status: 'active',
  };
}

export function compileAssetIntent(intent: AssetCompilerIntent): AssetCompilerPlan {
  const recipe = getGenerationRecipe(intent.recipeId);
  const falRequest = buildFalGenerationRequest(intent, recipe);
  const metadata = buildCompiledAssetMetadata(intent, recipe, falRequest);
  const registryEntry = buildAssetRegistryEntry(metadata);

  return {
    compilerVersion: ASSET_COMPILER_VERSION,
    article: ASSET_COMPILER_ARTICLE,
    intent,
    recipe,
    falRequest,
    metadata,
    registryEntry,
  };
}
