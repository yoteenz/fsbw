/**
 * Studio Foundry™ client — primary API for UI / Orb / Atlas asset consumption.
 */

import {
  applyFoundryManufacturingPlan,
  markFoundryAssetFailed,
  markFoundryAssetReady,
  queueFoundryAssetGeneration,
  requestFoundryRegeneration,
  resolveFoundryAsset,
} from './assetResolver';
import { recordFoundryAssetUsage, getFoundryAssetBySlug } from './assetRegistry';
import { callFoundryFalAdapter } from './foundryGenerationAdapter';
import { HERO_ICON_SEED_BY_SLUG } from './productLines/heroIcons';
import { compileAssetIntent } from '../../studio-os-core/asset-compiler';
import type { FoundryAsset, FoundryGenerateRequest, FoundryGenerateResult } from './foundryTypes';

export function getFoundryAsset(slug: string, usedBy?: string): FoundryAsset {
  if (usedBy) recordFoundryAssetUsage(slug, usedBy);
  return resolveFoundryAsset(slug).asset;
}

export async function generateFoundryAsset(request: FoundryGenerateRequest): Promise<FoundryGenerateResult> {
  const seed = HERO_ICON_SEED_BY_SLUG[request.slug];
  if (!seed) {
    return { ok: false, error: `Unknown Foundry slug: ${request.slug}`, adapter: 'unavailable' };
  }

  if (request.regenerate) {
    requestFoundryRegeneration(request.slug);
  } else {
    queueFoundryAssetGeneration(request.slug);
  }

  const manufacturing = applyFoundryManufacturingPlan(request.slug);
  if (!manufacturing) {
    return { ok: false, error: 'Could not prepare manufacturing plan', adapter: 'unavailable' };
  }

  const plan = compileAssetIntent({
    assetId: request.slug,
    assetName: seed.name,
    recipeId: seed.recipeId,
    modifiers: [seed.promptIntent],
    creator: request.creator ?? 'Studio Foundry',
    organizationId: request.organizationId,
  });

  const falResult = await callFoundryFalAdapter({
    ...request,
    recipeId: seed.recipeId,
    assetName: seed.name,
    prompt: plan.metadata.prompt,
  });

  if (!falResult.ok || !falResult.publicUrl) {
    markFoundryAssetFailed(request.slug, falResult.error ?? 'Generation failed');
    return {
      ok: false,
      error: falResult.error ?? 'Generation failed',
      adapter: falResult.error?.includes('FAL_KEY') ? 'unavailable' : 'local-plan-only',
    };
  }

  const ready = markFoundryAssetReady(
    request.slug,
    {
      previewUrl: falResult.publicUrl,
      sourceUrl: falResult.publicUrl,
      transparentUrl: falResult.publicUrl,
    },
    {
      actualCost: 0.08,
      provider: 'fal',
      model: falResult.model ?? plan.metadata.generationParameters.model,
      generationTimeMs: undefined,
    }
  );

  return {
    ok: true,
    asset: ready ?? undefined,
    adapter: 'fal-api',
  };
}

export function regenerateFoundryAsset(slug: string): Promise<FoundryGenerateResult> {
  return generateFoundryAsset({ slug, regenerate: true });
}

export function isFoundryAssetReady(slug: string): boolean {
  return getFoundryAssetBySlug(slug)?.status === 'ready';
}

export function isFoundryAssetGenerating(slug: string): boolean {
  const status = getFoundryAssetBySlug(slug)?.status;
  return status === 'generating' || status === 'queued';
}
