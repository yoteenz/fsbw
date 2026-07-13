/**
 * Founder Render™ — full-room photoreal preview generation via FAL NBP.
 */
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import type { ConstructionPlan } from '../../src/studio-os-core/blueprint-author/construction-plan-schema.js';
import {
  buildFounderFullRoomPreviewPrompt,
  resolveBrandMaterialPackage,
  resolveFounderRenderModelRoute,
  runFounderRenderPreflight,
} from './creativeProduction/studio-os-server.bundle.js';
import {
  finalizeStudioBuilderFromFalUrl,
  fetchStudioBuilderFalResult,
  pollStudioBuilderFalQueue,
  submitStudioBuilderFalQueue,
  STUDIO_BUILDER_BUCKET,
  type StudioBuilderGenerateInput,
} from './studioBuilderGeneration.js';

export const FOUNDER_RENDER_STORAGE_PREFIX = 'studio-assets/founder-render';

function repoRoot(): string {
  return process.cwd();
}

async function uploadBrandRefsToFal(refs: string[]): Promise<string[]> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const { resolveSiteOrigin } = await import('./email/brandAssets.js');
  const origin = resolveSiteOrigin();
  const urls: string[] = [];
  for (const ref of refs) {
    if (ref.startsWith('http')) {
      urls.push(ref);
      continue;
    }
    const localPath = join(repoRoot(), 'public', ref.replace(/^\//, ''));
    if (existsSync(localPath)) {
      const bytes = readFileSync(localPath);
      const name = localPath.split('/').pop() || 'ref.png';
      urls.push(await fal.storage.upload(new File([bytes], name, { type: 'image/png' })));
    } else {
      const assetPath = ref.replace(/^\//, '');
      urls.push(`${origin}/${assetPath.startsWith('assets/') ? assetPath : `assets/${assetPath}`}`);
    }
  }
  return urls;
}

export type FounderRenderGenerateInput = {
  plan: ConstructionPlan;
  actorId: string;
  revisionNote?: string | null;
};

export type FounderRenderGenerateResult =
  | {
      ok: true;
      providerRequestId: string;
      model: string;
      promptVersion: string;
      promptHash: string;
      effectivePrompt: string;
      referenceCount: number;
      brandMaterialRefs: string[];
      imageUrls: string[];
    }
  | { ok: false; code: string; error: string; missingRole?: string };

export async function prepareFounderRenderDispatch(
  input: FounderRenderGenerateInput
): Promise<FounderRenderGenerateResult> {
  const preflight = runFounderRenderPreflight(input.plan);
  if (!preflight.ok) {
    return { ok: false, code: preflight.code, error: preflight.message, missingRole: preflight.missingRole };
  }

  const brandPkg = resolveBrandMaterialPackage({
    organizationId: input.plan.metadata.organizationId,
    materialRequests: [
      { slot: 'floor', requestedMaterial: 'white polished marble', brandRole: 'primary-marble-texture', required: true },
    ],
  });
  if ('code' in brandPkg) {
    return { ok: false, code: brandPkg.code, error: brandPkg.message, missingRole: brandPkg.missingRole };
  }

  const promptBundle = buildFounderFullRoomPreviewPrompt({
    plan: input.plan,
    brandPackage: brandPkg,
    founderRevisionNote: input.revisionNote,
  });

  const route = resolveFounderRenderModelRoute('16:9');
  let imageUrls: string[] = [];
  try {
    imageUrls = await uploadBrandRefsToFal(preflight.brandReferenceUrls);
  } catch (e) {
    return { ok: false, code: 'BRAND_REFERENCE_UPLOAD_FAILED', error: e instanceof Error ? e.message : 'Brand ref upload failed' };
  }

  const builderInput: StudioBuilderGenerateInput = {
    departmentId: input.plan.metadata.organizationId,
    packageId: 'founder-render',
    projectId: input.plan.planId,
    productionGroupId: `founder-render-${input.plan.room.roomId}`,
    heroAssetId: 'full-room-preview',
    prompt: promptBundle.prompt,
    negativePrompt: promptBundle.negativePrompt,
    aspectRatio: route.aspectRatio,
    outputFormat: route.outputFormat,
    brandReferenceUrls: imageUrls,
    organizationId: input.plan.metadata.organizationId,
    textToImageOnly: false,
    providerModel: route.providerModel,
  };

  const submit = await submitStudioBuilderFalQueue(builderInput, imageUrls, route.providerModel);
  if (!submit.ok) {
    return { ok: false, code: 'PROVIDER_DISPATCH_FAILED', error: submit.error };
  }

  return {
    ok: true,
    providerRequestId: submit.providerRequestId,
    model: submit.model,
    promptVersion: promptBundle.promptVersion,
    promptHash: promptBundle.promptHash,
    effectivePrompt: promptBundle.prompt,
    referenceCount: imageUrls.length,
    brandMaterialRefs: imageUrls,
    imageUrls,
  };
}

export async function pollFounderRenderToCompletion(
  model: string,
  providerRequestId: string,
  plan: ConstructionPlan,
  maxWaitMs = 110_000
): Promise<{ ok: true; publicUrl: string; storagePath: string; model: string } | { ok: false; error: string }> {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    const { status } = await pollStudioBuilderFalQueue(model, providerRequestId);
    if (status === 'COMPLETED') {
      const imageUrl = await fetchStudioBuilderFalResult(model, providerRequestId);
      if (!imageUrl) return { ok: false, error: 'Provider completed without image URL' };
      const route = resolveFounderRenderModelRoute('16:9');
      const builderInput: StudioBuilderGenerateInput = {
        departmentId: plan.metadata.organizationId,
        packageId: 'founder-render',
        projectId: plan.planId,
        productionGroupId: `founder-render-${plan.room.roomId}`,
        heroAssetId: 'full-room-preview',
        prompt: 'founder-render',
        aspectRatio: route.aspectRatio,
        outputFormat: route.outputFormat,
        organizationId: plan.metadata.organizationId,
      };
      const finalized = await finalizeStudioBuilderFromFalUrl(builderInput, imageUrl, model);
      if (!finalized.ok || !finalized.publicUrl) {
        return { ok: false, error: finalized.error ?? 'Failed to persist founder render' };
      }
      return {
        ok: true,
        publicUrl: finalized.publicUrl,
        storagePath: finalized.storagePath ?? '',
        model: finalized.model ?? model,
      };
    }
    if (status === 'FAILED') {
      return { ok: false, error: 'FAL provider job failed' };
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return { ok: false, error: 'Founder render timed out waiting for provider completion' };
}

export { STUDIO_BUILDER_BUCKET, FOUNDER_RENDER_STORAGE_PREFIX as FOUNDER_RENDER_PREFIX };
