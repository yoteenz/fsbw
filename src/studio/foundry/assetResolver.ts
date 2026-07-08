/**
 * Foundry asset resolver — cache-first lookup with optional manufacturing queue.
 */

import { compileAssetIntent } from '../../studio-os-core/asset-compiler';
import {
  getFoundryAssetBySlug,
  updateFoundryAssetStatus,
  upsertFoundryAsset,
} from './assetRegistry';
import { HERO_ICON_SEED_BY_SLUG } from './productLines/heroIcons';
import type { FoundryAsset, FoundryAssetSeed, FoundryResolveResult } from './foundryTypes';

function seedForSlug(slug: string): FoundryAssetSeed | undefined {
  return HERO_ICON_SEED_BY_SLUG[slug];
}

function missingAssetFromSeed(seed: FoundryAssetSeed): FoundryAsset {
  const existing = getFoundryAssetBySlug(seed.slug);
  if (existing) return existing;

  const ts = new Date().toISOString();
  const asset: FoundryAsset = {
    assetId: seed.slug,
    slug: seed.slug,
    name: seed.name,
    assetClass: seed.assetClass,
    recipeId: seed.recipeId,
    version: '0.0.0',
    status: 'missing',
    metadata: {
      description: seed.description,
      promptIntent: seed.promptIntent,
      defaultUsage: seed.defaultUsage,
      registryDestination: seed.registryDestination,
    },
    tags: seed.tags,
    createdAt: ts,
    updatedAt: ts,
    usedBy: seed.defaultUsage,
    worldGraphRefs: {
      usedByDepartments: [],
      usedByScenes: [],
      usedByComponents: seed.defaultUsage,
      originRecipe: seed.recipeId,
      relatedAssets: [],
    },
  };
  return upsertFoundryAsset(asset);
}

export function resolveFoundryAsset(slug: string): FoundryResolveResult {
  const existing = getFoundryAssetBySlug(slug);
  if (existing && existing.status === 'ready') {
    return { asset: existing, cacheHit: true, queued: false };
  }
  if (existing && (existing.status === 'queued' || existing.status === 'generating')) {
    return { asset: existing, cacheHit: false, queued: true };
  }

  const seed = seedForSlug(slug);
  if (!seed) {
    const fallback = missingAssetFromSeed(
      HERO_ICON_SEED_BY_SLUG['hero-icon.dormant']!
    );
    return { asset: fallback, cacheHit: false, queued: false };
  }

  const asset = existing ?? missingAssetFromSeed(seed);
  return { asset, cacheHit: false, queued: false };
}

export function queueFoundryAssetGeneration(slug: string): FoundryAsset | null {
  const seed = seedForSlug(slug);
  if (!seed) return null;

  const resolved = resolveFoundryAsset(slug);
  if (resolved.asset.status === 'ready' || resolved.asset.status === 'generating') {
    return resolved.asset;
  }

  return updateFoundryAssetStatus(slug, 'queued') ?? missingAssetFromSeed(seed);
}

export function applyFoundryManufacturingPlan(slug: string): FoundryAsset | null {
  const seed = seedForSlug(slug);
  if (!seed) return null;

  const plan = compileAssetIntent({
    assetId: slug,
    assetName: seed.name,
    recipeId: seed.recipeId,
    modifiers: [seed.promptIntent],
    creator: 'Studio Foundry',
  });

  const ts = new Date().toISOString();
  const asset: FoundryAsset = {
    assetId: slug,
    slug,
    name: seed.name,
    assetClass: seed.assetClass,
    recipeId: seed.recipeId,
    version: plan.metadata.version,
    status: 'generating',
    metadata: {
      description: seed.description,
      promptIntent: seed.promptIntent,
      defaultUsage: seed.defaultUsage,
      registryDestination: seed.registryDestination ?? plan.metadata.registryDestination,
      generationCost: {
        estimatedCost: 0.08,
        provider: 'fal',
        model: plan.metadata.generationParameters.model,
      },
      compilerPlan: {
        prompt: plan.metadata.prompt,
        storagePath: plan.metadata.storagePath,
      },
    },
    tags: plan.metadata.tags,
    createdAt: ts,
    updatedAt: ts,
    usedBy: seed.defaultUsage,
    worldGraphRefs: {
      usedByDepartments: [],
      usedByScenes: [],
      usedByComponents: seed.defaultUsage,
      originRecipe: seed.recipeId,
      relatedAssets: plan.metadata.relationships,
    },
  };

  return upsertFoundryAsset(asset);
}

export function markFoundryAssetReady(
  slug: string,
  urls: { previewUrl: string; sourceUrl?: string; transparentUrl?: string },
  costPatch?: FoundryAsset['metadata']['generationCost']
): FoundryAsset | null {
  const existing = getFoundryAssetBySlug(slug);
  if (!existing) return null;

  return upsertFoundryAsset({
    ...existing,
    status: 'ready',
    previewUrl: urls.previewUrl,
    sourceUrl: urls.sourceUrl ?? urls.previewUrl,
    transparentUrl: urls.transparentUrl ?? urls.previewUrl,
    version: bumpVersion(existing.version),
    metadata: {
      ...existing.metadata,
      generationCost: {
        ...existing.metadata.generationCost,
        ...costPatch,
      },
    },
  });
}

export function markFoundryAssetFailed(slug: string, error: string): FoundryAsset | null {
  const existing = getFoundryAssetBySlug(slug);
  if (!existing) return null;
  return upsertFoundryAsset({
    ...existing,
    status: 'failed',
    metadata: { ...existing.metadata, lastError: error },
  });
}

function bumpVersion(version: string): string {
  const parts = version.split('.').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return '1.0.0';
  parts[2] += 1;
  return parts.join('.');
}

export function requestFoundryRegeneration(slug: string): FoundryAsset | null {
  const existing = getFoundryAssetBySlug(slug);
  if (!existing) return queueFoundryAssetGeneration(slug);

  return upsertFoundryAsset({
    ...existing,
    status: 'queued',
    metadata: {
      ...existing.metadata,
      regenerationRequestedAt: new Date().toISOString(),
    },
  });
}
