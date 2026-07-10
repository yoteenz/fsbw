/**
 * Governed Generation Gateway™ — single entry for material creative generation.
 * Genesis §9B.28 Phase 1.
 */

import type { GovernedGenerationRequest, GovernedGenerationResult } from '../../../src/studio-os-core/creative-production/types.js';
import { representGovernedGenerationRequest } from '../../../src/studio-os-core/creative-production/graph.js';
import { createDemoCreativeInitiative } from '../../../src/studio-os-core/creative-production/demo-seed.js';
import { verifyProductionAuthorizationSignature } from './authorization-signing.js';
import { resolveLegacyCompatAuthorization } from './legacy-adapters.js';
import { registerGeneratedAssetWithLineage } from './registry-transaction.js';
import { getSupabaseAdmin } from '../supabase.js';
import { generateStudioBuilderAsset } from '../studioBuilderGeneration.js';
import { generateStudioAssetImage } from '../studioAssetGeneration.js';
import {
  evaluateCreativeDecision,
  getPersistedDecision,
  persistCreativeDecision,
} from '../creativeIntelligenceEngine/decision-engine.js';
import type { FounderIntentInput } from '../creativeIntelligenceEngine/types.js';
import { compileAssetIntent } from '../../../src/studio-os-core/asset-compiler/compiler.js';

export type GatewayContext = {
  sourceRoute: string;
};

async function runCieIfRequired(
  request: GovernedGenerationRequest
): Promise<GovernedGenerationResult | null> {
  if (request.evaluateOnly || request.assetIntent.outputClass !== 'material') {
    return null;
  }
  if (request.skipCie || request.forceGenerate) {
    return {
      ok: false,
      code: request.skipCie ? 'CIE_SKIP_FORBIDDEN' : 'CIE_FORCE_FORBIDDEN',
      error: `${request.skipCie ? 'skipCie' : 'forceGenerate'} is forbidden on material generation paths`,
    };
  }

  const execution = request.execution;
  const prompt = String(execution.prompt || execution.promptStack?.[0] || 'studio generation');
  const supabase = getSupabaseAdmin();
  const orgId = request.orgId;

  let decision = request.cieDecisionId
    ? await getPersistedDecision(supabase, orgId, request.cieDecisionId)
    : null;

  if (!decision) {
    const intent: FounderIntentInput = {
      org_id: orgId,
      raw_intent: prompt,
      category: String(execution.productionGroupId || execution.recipeId || 'studio'),
      department_id: String(execution.departmentId || 'studio-foundry'),
      workspace_id: String(execution.projectId || 'studio'),
      asset_type: 'image',
    };
    decision = await evaluateCreativeDecision(supabase, intent);
    await persistCreativeDecision(supabase, decision);
  }

  if (request.evaluateOnly) {
    return {
      ok: false,
      code: 'CIE_EVALUATE_ONLY',
      error: 'evaluateOnly — generation not executed',
      audit: undefined,
    };
  }

  const reuseOnly =
    decision.recommended_strategy === 'reuse_existing' && decision.assets_missing.length === 0;

  if (reuseOnly || !decision.should_generate) {
    return {
      ok: false,
      code: 'CIE_REUSE_RECOMMENDED',
      error: 'Creative Intelligence Engine recommends reusing existing assets — no generation required.',
    };
  }

  return null;
}

async function executeBuilderGeneration(
  request: GovernedGenerationRequest
): Promise<{ publicUrl?: string; storagePath?: string; model?: string; error?: string }> {
  const e = request.execution;
  return generateStudioBuilderAsset({
    departmentId: String(e.departmentId),
    packageId: String(e.packageId),
    projectId: String(e.projectId),
    productionGroupId: String(e.productionGroupId),
    heroAssetId: String(e.heroAssetId),
    prompt: String(e.prompt),
    aspectRatio: String(e.aspectRatio || '16:9'),
    outputFormat: e.outputFormat === 'webp' ? 'webp' : 'png',
    referenceImageUrls: Array.isArray(e.referenceImageUrls)
      ? (e.referenceImageUrls as unknown[]).filter((u): u is string => typeof u === 'string')
      : undefined,
  });
}

async function executeFoundryGeneration(
  request: GovernedGenerationRequest
): Promise<{ publicUrl?: string; storagePath?: string; model?: string; error?: string }> {
  const e = request.execution;
  const slug = String(e.slug || '');
  const recipeId = String(e.recipeId || 'hero-icon') as 'hero-icon';
  const assetName = String(e.assetName || slug.split('.').pop() || 'Foundry Asset');
  const promptOverride = String(e.prompt || '');

  const plan = compileAssetIntent({
    assetId: slug,
    assetName,
    recipeId,
    modifiers: promptOverride ? [promptOverride] : undefined,
    creator: String(e.creator || 'Studio Foundry'),
    organizationId: typeof e.organizationId === 'string' ? e.organizationId : undefined,
  });

  const safeSlug = slug.replace(/[^a-zA-Z0-9.-]/g, '_');
  return generateStudioBuilderAsset({
    departmentId: 'studio-foundry',
    packageId: recipeId,
    projectId: 'hero-icons',
    productionGroupId: safeSlug,
    heroAssetId: safeSlug,
    prompt: plan.metadata.prompt,
    aspectRatio: plan.metadata.generationParameters.aspectRatio,
    outputFormat: plan.metadata.generationParameters.outputFormat === 'webp' ? 'webp' : 'png',
  });
}

async function executeAssetDirectorGeneration(
  request: GovernedGenerationRequest
): Promise<{ ok: boolean; publicUrl?: string; storagePath?: string; model?: string; error?: string }> {
  const e = request.execution;
  return generateStudioAssetImage({
    blueprintId: String(e.blueprintId),
    blueprintName: String(e.blueprintName || e.blueprintId),
    studioId: String(e.studioId),
    variantId: String(e.variantId),
    variantName: String(e.variantName),
    promptStack: Array.isArray(e.promptStack)
      ? (e.promptStack as unknown[]).map((line) => String(line).trim()).filter(Boolean)
      : [],
    referenceImageUrl: typeof e.referenceImageUrl === 'string' ? e.referenceImageUrl : undefined,
  });
}

export async function executeGovernedGeneration(
  request: GovernedGenerationRequest,
  ctx: GatewayContext
): Promise<GovernedGenerationResult> {
  const authResolve = resolveLegacyCompatAuthorization({
    productionAuthorizationId: request.productionAuthorizationId,
  });
  if ('error' in authResolve) {
    return { ok: false, code: authResolve.code, error: authResolve.error };
  }

  const authorization = authResolve.authorization;
  if (!verifyProductionAuthorizationSignature(authorization)) {
    return { ok: false, code: 'AUTH_SIGNATURE_INVALID', error: 'Invalid ProductionAuthorization signature' };
  }

  const initiative = createDemoCreativeInitiative();
  if (authorization.initiativeId !== initiative.id) {
    return {
      ok: false,
      code: 'INITIATIVE_NOT_FOUND',
      error: `Initiative ${authorization.initiativeId} not found (Phase 2 server persistence pending)`,
    };
  }

  const graphResult = representGovernedGenerationRequest({
    authorization,
    initiative,
    request: { ...request, sourceRoute: ctx.sourceRoute },
  });
  if (!graphResult.ok) return graphResult;

  const cieBlock = await runCieIfRequired(request);
  if (cieBlock) return cieBlock;

  let execResult: { ok?: boolean; publicUrl?: string; storagePath?: string; model?: string; error?: string };
  switch (request.sourceSystem) {
    case 'studio-builder':
      execResult = await executeBuilderGeneration(request);
      break;
    case 'studio-foundry':
      execResult = await executeFoundryGeneration(request);
      break;
    case 'studio-generate-asset':
      execResult = await executeAssetDirectorGeneration(request);
      break;
    default:
      return { ok: false, code: 'UNSUPPORTED_SOURCE', error: `Unsupported sourceSystem: ${request.sourceSystem}` };
  }

  if (execResult.error || !execResult.publicUrl) {
    return {
      ok: false,
      code: 'GENERATION_FAILED',
      error: execResult.error ?? 'Generation failed',
      audit: graphResult.audit,
    };
  }

  const job = {
    ...graphResult.manufacturingJob,
    status: 'succeeded' as const,
    compiledRecipe: {
      ...graphResult.manufacturingJob.compiledRecipe,
      model: execResult.model ?? graphResult.manufacturingJob.compiledRecipe.model,
    },
  };

  let assetRegistryId: string | undefined;
  if (request.assetIntent.outputClass === 'material' && execResult.publicUrl) {
    try {
      const supabase = getSupabaseAdmin();
      const registered = await registerGeneratedAssetWithLineage({
        supabase,
        orgId: request.orgId,
        audit: graphResult.audit,
        name: String(request.execution.heroAssetId || request.execution.slug || request.execution.variantName || 'Generated Asset'),
        category: request.assetIntent.discipline,
        artifactUrl: execResult.publicUrl,
        departmentId: String(request.execution.departmentId || 'studio-foundry'),
        generationModel: execResult.model,
        metadata: { storage_path: execResult.storagePath },
      });
      assetRegistryId = registered.assetRegistryId;
      job.outputAssetRegistryId = assetRegistryId;
    } catch (err) {
      return {
        ok: false,
        code: 'REGISTRY_WRITE_FAILED',
        error: err instanceof Error ? err.message : 'Asset Registry registration failed',
        audit: graphResult.audit,
      };
    }
  }

  return {
    ok: true,
    audit: graphResult.audit,
    manufacturingJob: job,
    publicUrl: execResult.publicUrl,
    storagePath: execResult.storagePath,
    model: execResult.model,
    assetRegistryId,
  };
}

/** Phase 1 verification — represent request without provider execution. */
export function representGovernedGenerationOnly(
  request: GovernedGenerationRequest,
  ctx: GatewayContext
): GovernedGenerationResult {
  const authResolve = resolveLegacyCompatAuthorization({
    productionAuthorizationId: request.productionAuthorizationId,
  });
  if ('error' in authResolve) {
    return { ok: false, code: authResolve.code, error: authResolve.error };
  }
  const authorization = authResolve.authorization;
  if (!verifyProductionAuthorizationSignature(authorization)) {
    return { ok: false, code: 'AUTH_SIGNATURE_INVALID', error: 'Invalid ProductionAuthorization signature' };
  }
  const initiative = createDemoCreativeInitiative();
  return representGovernedGenerationRequest({
    authorization,
    initiative,
    request: { ...request, sourceRoute: ctx.sourceRoute },
  });
}
