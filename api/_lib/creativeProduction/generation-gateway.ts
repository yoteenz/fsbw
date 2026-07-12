/**
 * Governed Generation Gateway™ — single entry for material creative generation.
 * Genesis §9B.28 Phase 1.
 */

import type { GovernedGenerationRequest, GovernedGenerationResult, GovernedGenerationAudit } from '../../../src/studio-os-core/creative-production/types.js';
import {
  representGovernedGenerationRequest,
  createDemoCreativeInitiative,
  compileAssetIntent,
} from './studio-os-server.js';
import { verifyProductionAuthorizationSignature } from './authorization-signing.js';
import { resolveLegacyCompatAuthorization } from './legacy-adapters.js';
import { registerGeneratedAssetWithLineage } from './registry-transaction.js';
import { getSupabaseAdmin } from '../supabase.js';
import { generateStudioBuilderAsset, STUDIO_BUILDER_FAL_MODEL } from '../studioBuilderGeneration.js';
import { generateStudioAssetImage } from '../studioAssetGeneration.js';
import {
  evaluateCreativeDecision,
  getPersistedDecision,
  persistCreativeDecision,
} from '../creativeIntelligenceEngine/decision-engine.js';
import type { FounderIntentInput } from '../creativeIntelligenceEngine/types.js';
import {
  createGenerationTraceId,
  logGenerationDiagnostic,
  normalizeGenerationError,
  publicMessageFromDiagnostic,
  type GenerationErrorDiagnostic,
} from './generation-error-diagnostics.js';

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
  const prompt = String(
    execution.prompt ||
      (Array.isArray(execution.promptStack) ? String(execution.promptStack[0] ?? '') : '') ||
      'studio generation'
  );
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
  request: GovernedGenerationRequest,
  traceId: string
): Promise<{ publicUrl?: string; storagePath?: string; model?: string; error?: string; diagnostic?: GenerationErrorDiagnostic }> {
  const started = Date.now();
  const e = request.execution;
  try {
    const result = await generateStudioBuilderAsset({
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
    if (!result.ok) {
      const diagnostic = normalizeGenerationError({
        err: new Error(result.error ?? 'Generation failed'),
        stage: 'generateStudioBuilderAsset',
        traceId,
        category:
          result.failureCategory === 'PROVIDER_REJECTED'
            ? 'PROVIDER_REJECTED'
            : result.failureCategory === 'PROVIDER_REQUEST_FAILED'
              ? 'PROVIDER_REQUEST_FAILED'
              : 'ORCHESTRATION_FAILED',
        provider: 'fal',
        model: STUDIO_BUILDER_FAL_MODEL,
        adapter: 'generateStudioBuilderAsset',
        elapsedMs: Date.now() - started,
        context: {
          stationId: typeof e.stationId === 'string' ? e.stationId : undefined,
          organizationId: request.orgId,
          compileRunId: request.compileRunId,
          layerId: String(e.productionGroupId || '').includes('signature-landmark')
            ? 'signature-landmark'
            : undefined,
        },
      });
      if (result.providerHttpStatus) diagnostic.providerHttpStatus = result.providerHttpStatus;
      if (result.providerResponsePreview) diagnostic.providerResponsePreview = result.providerResponsePreview;
      logGenerationDiagnostic(diagnostic);
      return { error: publicMessageFromDiagnostic(diagnostic), diagnostic };
    }
    return result;
  } catch (err) {
    const diagnostic = normalizeGenerationError({
      err,
      stage: 'generateStudioBuilderAsset',
      traceId,
      category: 'ORCHESTRATION_FAILED',
      provider: 'fal',
      model: 'fal-ai/nano-banana-pro/edit',
      adapter: 'generateStudioBuilderAsset',
      elapsedMs: Date.now() - started,
      context: {
        stationId: typeof e.stationId === 'string' ? e.stationId : undefined,
        organizationId: request.orgId,
        compileRunId: request.compileRunId,
        layerId: String(e.productionGroupId || '').includes('signature-landmark')
          ? 'signature-landmark'
          : undefined,
      },
    });
    logGenerationDiagnostic(diagnostic);
    return { error: publicMessageFromDiagnostic(diagnostic), diagnostic };
  }
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

export async function validateGovernedGenerationForExecution(
  request: GovernedGenerationRequest,
  ctx: GatewayContext
): Promise<
  | { ok: false; result: GovernedGenerationResult }
  | { ok: true; request: GovernedGenerationRequest; audit: GovernedGenerationAudit }
> {
  const authResolve = resolveLegacyCompatAuthorization({
    productionAuthorizationId: request.productionAuthorizationId,
    productionAuthorization: request.productionAuthorization,
    validationMode: request.validationMode,
    compileRunId: request.compileRunId,
    org_id: request.orgId,
    previewSessionId:
      typeof request.execution.previewSessionId === 'string'
        ? request.execution.previewSessionId
        : request.productionAuthorization?.scope.previewSessionId,
    departmentId:
      typeof request.execution.departmentId === 'string' ? request.execution.departmentId : undefined,
    stationId: typeof request.execution.stationId === 'string' ? request.execution.stationId : undefined,
    projectId: typeof request.execution.projectId === 'string' ? request.execution.projectId : undefined,
  });
  if ('error' in authResolve) {
    return { ok: false, result: { ok: false, code: authResolve.code, error: authResolve.error } };
  }

  const authorization = authResolve.authorization;
  if (!verifyProductionAuthorizationSignature(authorization)) {
    return { ok: false, result: { ok: false, code: 'AUTH_SIGNATURE_INVALID', error: 'Invalid ProductionAuthorization signature' } };
  }

  const initiative = createDemoCreativeInitiative();
  if (authorization.initiativeId !== initiative.id) {
    return {
      ok: false,
      result: {
        ok: false,
        code: 'INITIATIVE_NOT_FOUND',
        error: `Initiative ${authorization.initiativeId} not found (Phase 2 server persistence pending)`,
      },
    };
  }

  const graphResult = representGovernedGenerationRequest({
    authorization,
    initiative,
    request: { ...request, sourceRoute: ctx.sourceRoute },
  });
  if (!graphResult.ok) return { ok: false, result: graphResult };

  const cieBlock = await runCieIfRequired(request);
  if (cieBlock) return { ok: false, result: cieBlock };

  return { ok: true, request, audit: graphResult.audit };
}

export async function executeGovernedGeneration(
  request: GovernedGenerationRequest,
  ctx: GatewayContext
): Promise<GovernedGenerationResult> {
  const traceId = createGenerationTraceId('gov');
  const started = Date.now();
  try {
  const authResolve = resolveLegacyCompatAuthorization({
    productionAuthorizationId: request.productionAuthorizationId,
    productionAuthorization: request.productionAuthorization,
    validationMode: request.validationMode,
    compileRunId: request.compileRunId,
    org_id: request.orgId,
    previewSessionId:
      typeof request.execution.previewSessionId === 'string'
        ? request.execution.previewSessionId
        : request.productionAuthorization?.scope.previewSessionId,
    departmentId:
      typeof request.execution.departmentId === 'string' ? request.execution.departmentId : undefined,
    stationId: typeof request.execution.stationId === 'string' ? request.execution.stationId : undefined,
    projectId: typeof request.execution.projectId === 'string' ? request.execution.projectId : undefined,
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

  let execResult: { ok?: boolean; publicUrl?: string; storagePath?: string; model?: string; error?: string; diagnostic?: GenerationErrorDiagnostic };
  switch (request.sourceSystem) {
    case 'studio-builder':
      execResult = await executeBuilderGeneration(request, traceId);
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
      diagnostic: execResult.diagnostic ? { ...execResult.diagnostic } : undefined,
      traceId,
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
    traceId,
  };
  } catch (err) {
    const diagnostic = normalizeGenerationError({
      err,
      stage: 'executeGovernedGeneration',
      traceId,
      category: 'ORCHESTRATION_FAILED',
      elapsedMs: Date.now() - started,
      context: {
        stationId:
          typeof request.execution.stationId === 'string' ? request.execution.stationId : undefined,
        organizationId: request.orgId,
        compileRunId: request.compileRunId,
      },
    });
    logGenerationDiagnostic(diagnostic);
    return {
      ok: false,
      code: 'ORCHESTRATION_FAILED',
      error: publicMessageFromDiagnostic(diagnostic),
      diagnostic,
      traceId,
    };
  }
}

/** Phase 1 verification — represent request without provider execution. */
export function representGovernedGenerationOnly(
  request: GovernedGenerationRequest,
  ctx: GatewayContext
): GovernedGenerationResult {
  const authResolve = resolveLegacyCompatAuthorization({
    productionAuthorizationId: request.productionAuthorizationId,
    productionAuthorization: request.productionAuthorization,
    validationMode: request.validationMode,
    compileRunId: request.compileRunId,
    org_id: request.orgId,
    previewSessionId:
      typeof request.execution.previewSessionId === 'string'
        ? request.execution.previewSessionId
        : request.productionAuthorization?.scope.previewSessionId,
    departmentId:
      typeof request.execution.departmentId === 'string' ? request.execution.departmentId : undefined,
    stationId: typeof request.execution.stationId === 'string' ? request.execution.stationId : undefined,
    projectId: typeof request.execution.projectId === 'string' ? request.execution.projectId : undefined,
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
