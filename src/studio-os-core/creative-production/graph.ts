/**
 * Production graph facade — orchestrates graph contracts without owning stores.
 */

import { validateAuthorizationStructure, authorizationPermitsIntent } from './authorization';
import { enforceCieOnMaterialPath } from './cie-enforcement';
import { buildSourceLineage } from './lineage';
import { assertMaterialInitiativeReady, validateCreativeInitiative } from './initiative-model';
import type {
  AssetIntent,
  CreativeInitiative,
  GovernedGenerationAudit,
  GovernedGenerationRequest,
  GovernedGenerationResult,
  ManufacturingJob,
  ProductionAuthorization,
} from './types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type RepresentGenerationRequestInput = {
  authorization: ProductionAuthorization;
  initiative: CreativeInitiative;
  request: GovernedGenerationRequest;
};

/** Represent one governed generation request through the canonical production graph. */
export function representGovernedGenerationRequest(
  input: RepresentGenerationRequestInput
): GovernedGenerationResult {
  const { authorization, initiative, request } = input;

  const initiativeCheck = validateCreativeInitiative(initiative);
  if (!initiativeCheck.ok) {
    return {
      ok: false,
      code: 'INITIATIVE_INVALID',
      error: initiativeCheck.errors.join('; '),
    };
  }

  if (request.assetIntent.outputClass === 'material') {
    const materialReady = assertMaterialInitiativeReady(initiative);
    if (!materialReady.ok) {
      return { ok: false, code: 'INITIATIVE_NOT_READY', error: materialReady.errors.join('; ') };
    }
  }

  const authStructure = validateAuthorizationStructure(authorization);
  if (!authStructure.ok) {
    return { ok: false, code: authStructure.code, error: authStructure.error };
  }

  if (authorization.initiativeId !== initiative.id) {
    return {
      ok: false,
      code: 'AUTH_INITIATIVE_MISMATCH',
      error: 'ProductionAuthorization initiativeId does not match CreativeInitiative',
    };
  }

  const assetIntentId = request.assetIntent.id ?? uid('intent');
  const authScope = authorizationPermitsIntent(
    authorization,
    request.assetIntent.touchpoint,
    assetIntentId
  );
  if (!authScope.ok) {
    return { ok: false, code: authScope.code, error: authScope.error };
  }

  const cie = enforceCieOnMaterialPath(request);
  if (!cie.ok) {
    return { ok: false, code: cie.code, error: cie.error };
  }

  const audit: GovernedGenerationAudit = {
    gatewayVersion: 'phase-1',
    sourceRoute: request.sourceRoute,
    sourceSystem: request.sourceSystem,
    initiativeId: initiative.id,
    productionAuthorizationId: authorization.id,
    assetIntentId,
    genomeRefs: authorization.genomeRefs,
    rightsState: authorization.rightsState,
    approvalState: authorization.approvalState,
    outputClass: request.assetIntent.outputClass,
    expressionLineage: request.assetIntent.expressionLineage ?? buildSourceLineage(initiative.id),
    legacyCompat: authorization.issuedBy.role === 'compat-legacy',
    recordedAt: new Date().toISOString(),
  };

  const compiledRecipe = {
    intentId: assetIntentId,
    provider: 'fal',
    model: String(request.execution.model ?? 'fal-ai/nano-banana-pro/edit'),
    parameters: request.execution,
    recipeVersionHash: `phase1-${request.assetIntent.recipeSlug}`,
  };

  const manufacturingJob: ManufacturingJob = {
    id: uid('job'),
    productionAuthorizationId: authorization.id,
    assetIntentId,
    compiledRecipe,
    status: 'queued',
    audit,
  };

  return {
    ok: true,
    audit,
    manufacturingJob,
  };
}

export function buildAssetIntentFromRequest(
  request: GovernedGenerationRequest,
  initiativeId: string
): AssetIntent {
  return {
    id: request.assetIntent.id ?? uid('intent'),
    productionAuthorizationId: request.productionAuthorizationId,
    initiativeId,
    touchpoint: request.assetIntent.touchpoint,
    discipline: request.assetIntent.discipline,
    recipeSlug: request.assetIntent.recipeSlug,
    inputRefs: request.assetIntent.inputRefs ?? [],
    rightsRequirements: request.assetIntent.rightsRequirements ?? [],
    qualityGates: request.assetIntent.qualityGates ?? [],
    expressionLineage: request.assetIntent.expressionLineage ?? buildSourceLineage(initiativeId),
    outputClass: request.assetIntent.outputClass,
  };
}

/** Graph edge validation — Initiative → Authorization → Intent. */
export function validateGraphEdgeChain(input: {
  initiative: CreativeInitiative;
  authorization: ProductionAuthorization;
  intent: AssetIntent;
}): GovernedGenerationResult {
  if (input.authorization.initiativeId !== input.initiative.id) {
    return {
      ok: false,
      code: 'GRAPH_EDGE_INITIATIVE',
      error: 'Initiative → Authorization edge broken: initiativeId mismatch',
    };
  }
  if (input.intent.productionAuthorizationId !== input.authorization.id) {
    return {
      ok: false,
      code: 'GRAPH_EDGE_AUTHORIZATION',
      error: 'Authorization → Intent edge broken: productionAuthorizationId mismatch',
    };
  }
  if (input.intent.initiativeId !== input.initiative.id) {
    return {
      ok: false,
      code: 'GRAPH_EDGE_INTENT',
      error: 'Initiative → Intent edge broken: initiativeId mismatch',
    };
  }
  return representGovernedGenerationRequest({
    authorization: input.authorization,
    initiative: input.initiative,
    request: {
      productionAuthorizationId: input.authorization.id,
      assetIntent: input.intent,
      orgId: input.initiative.tenantId,
      sourceRoute: '/generation-gateway',
      sourceSystem: 'generation-gateway',
      execution: {},
    },
  });
}
