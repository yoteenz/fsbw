/**
 * Legacy API compatibility adapters — Phase 1 transitional wrappers.
 * Injects demo/compat ProductionAuthorization when legacy callers omit ID.
 */

import type { GovernedGenerationRequest } from '../../../src/studio-os-core/creative-production/types.js';
import {
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  DEMO_AUTHORIZATION_ID,
} from '../../../src/studio-os-core/creative-production/demo-seed.js';
import {
  isValidationEphemeralAuthorizationId,
  VALIDATION_EPHEMERAL_AUTHORIZATION_ID,
} from '../../../src/studio-os-core/creative-production/validation-authorization.js';
import {
  issueDemoProductionAuthorization,
  signProductionAuthorization,
  verifyProductionAuthorizationSignature,
} from './authorization-signing.js';
import type { ProductionAuthorization } from '../../../src/studio-os-core/creative-production/types.js';

export type LegacyBuilderBody = Record<string, unknown>;

export function legacyCompatEnabled(): boolean {
  const flag = process.env.CREATIVE_PRODUCTION_ALLOW_LEGACY_COMPAT?.trim();
  if (flag === '0' || flag === 'false') return false;
  if (flag === '1' || flag === 'true') return true;
  return process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview';
}

export function resolveProductionAuthorizationId(body: LegacyBuilderBody): string {
  const id = typeof body.productionAuthorizationId === 'string' ? body.productionAuthorizationId.trim() : '';
  return id;
}

function isValidationCompileRequest(body: LegacyBuilderBody): boolean {
  return body.validationMode === true;
}

function issueValidationEphemeralAuthorization(): ProductionAuthorization {
  const initiative = createDemoCreativeInitiative();
  const payload = createDemoProductionAuthorizationPayload(initiative);
  return signProductionAuthorization({
    ...payload,
    id: VALIDATION_EPHEMERAL_AUTHORIZATION_ID,
    issuedBy: {
      actorId: 'experience-lab-validation',
      role: 'validation-ephemeral',
      issuedVia: 'validation-compile',
    },
  });
}

function isGatewayAuthReResolve(body: LegacyBuilderBody): boolean {
  const keys = Object.keys(body);
  return keys.length === 1 && keys[0] === 'productionAuthorizationId';
}

function resolveKnownEphemeralAuthorization(
  explicitId: string,
  body: LegacyBuilderBody
): { authorization: ProductionAuthorization; legacyCompat: boolean } | { error: string; code: string } {
  if (isValidationEphemeralAuthorizationId(explicitId)) {
    if (!isValidationCompileRequest(body) && !isGatewayAuthReResolve(body)) {
      return {
        error: 'Validation ephemeral authorization requires validationMode: true',
        code: 'AUTH_VALIDATION_SCOPE',
      };
    }
    return { authorization: issueValidationEphemeralAuthorization(), legacyCompat: false };
  }

  if (explicitId === DEMO_AUTHORIZATION_ID) {
    const initiative = createDemoCreativeInitiative();
    const authorization = issueDemoProductionAuthorization(
      createDemoProductionAuthorizationPayload(initiative)
    );
    return { authorization, legacyCompat: false };
  }

  return {
    error: `Unknown productionAuthorizationId "${explicitId}" — embed signed authorization or enable legacy compat`,
    code: 'AUTH_NOT_FOUND',
  };
}

export function resolveLegacyCompatAuthorization(
  body: LegacyBuilderBody
): { authorization: ProductionAuthorization; legacyCompat: boolean } | { error: string; code: string } {
  const explicitId = resolveProductionAuthorizationId(body);
  if (explicitId) {
    if (isValidationEphemeralAuthorizationId(explicitId) || explicitId === DEMO_AUTHORIZATION_ID) {
      const known = resolveKnownEphemeralAuthorization(explicitId, body);
      if ('error' in known) return known;
      return known;
    }
    const embedded = body.productionAuthorization;
    if (embedded && typeof embedded === 'object') {
      const auth = embedded as ProductionAuthorization;
      if (!verifyProductionAuthorizationSignature(auth)) {
        return { error: 'Invalid ProductionAuthorization signature', code: 'AUTH_SIGNATURE_INVALID' };
      }
      return { authorization: auth, legacyCompat: false };
    }
    return resolveKnownEphemeralAuthorization(explicitId, body);
  }

  if (!legacyCompatEnabled()) {
    return {
      error: 'productionAuthorizationId is required on material generation routes',
      code: 'AUTH_REQUIRED',
    };
  }

  const initiative = createDemoCreativeInitiative();
  const payload = createDemoProductionAuthorizationPayload(initiative);
  const authorization = signProductionAuthorization({
    ...payload,
    issuedBy: {
      actorId: 'legacy-adapter',
      role: 'compat-legacy',
      issuedVia: 'legacy-adapter',
    },
  });
  return { authorization, legacyCompat: true };
}

export function adaptLegacyBuilderRequest(
  body: LegacyBuilderBody,
  sourceRoute: string
): GovernedGenerationRequest | { error: string; code: string } {
  const authResult = resolveLegacyCompatAuthorization(body);
  if ('error' in authResult) return authResult;

  const { authorization, legacyCompat } = authResult;
  const initiative = createDemoCreativeInitiative();
  const departmentId = String(body.departmentId || 'studio-builder');
  const packageId = String(body.packageId || 'unknown');
  const projectId = String(body.projectId || 'unknown');
  const productionGroupId = String(body.productionGroupId || 'unknown');
  const heroAssetId = String(body.heroAssetId || 'unknown');
  const prompt = String(body.prompt || '');
  const orgId = typeof body.org_id === 'string' ? body.org_id.trim() : 'frontal-slayer';

  const intent = createDemoAssetIntent(initiative.id);
  intent.id = `intent-${heroAssetId}`;
  intent.recipeSlug = `${departmentId}/${packageId}/${productionGroupId}`;
  const explicitId = resolveProductionAuthorizationId(body);
  const validationEphemeral =
    isValidationCompileRequest(body) && isValidationEphemeralAuthorizationId(explicitId);
  intent.outputClass = validationEphemeral || legacyCompat ? 'exploratory_draft' : 'material';

  return {
    productionAuthorizationId: authorization.id,
    assetIntent: intent,
    orgId,
    sourceRoute,
    sourceSystem: 'studio-builder',
    skipCie: body.skipCie === true,
    forceGenerate: body.forceGenerate === true,
    evaluateOnly: body.evaluateOnly === true,
    cieDecisionId: typeof body.cieDecisionId === 'string' ? body.cieDecisionId : undefined,
    execution: {
      departmentId,
      packageId,
      projectId,
      productionGroupId,
      heroAssetId,
      prompt,
      aspectRatio: String(body.aspectRatio || '16:9'),
      outputFormat: body.outputFormat === 'webp' ? 'webp' : 'png',
      referenceImageUrls: body.referenceImageUrls,
      model: 'fal-ai/nano-banana-pro/edit',
      legacyCompat,
    },
  };
}

export function adaptLegacyFoundryRequest(
  body: LegacyBuilderBody,
  sourceRoute: string
): GovernedGenerationRequest | { error: string; code: string } {
  const authResult = resolveLegacyCompatAuthorization(body);
  if ('error' in authResult) return authResult;

  const { authorization, legacyCompat } = authResult;
  const initiative = createDemoCreativeInitiative();
  const slug = String(body.slug || '').trim();
  const recipeId = String(body.recipeId || 'hero-icon');
  const orgId = typeof body.organizationId === 'string' ? body.organizationId : 'frontal-slayer';

  const intent = createDemoAssetIntent(initiative.id);
  intent.id = `intent-foundry-${slug || recipeId}`;
  intent.recipeSlug = recipeId;
  intent.discipline = recipeId === 'hero-icon' ? 'icon' : 'static-image';
  intent.outputClass = legacyCompat ? 'exploratory_draft' : 'material';

  return {
    productionAuthorizationId: authorization.id,
    assetIntent: intent,
    orgId,
    sourceRoute,
    sourceSystem: 'studio-foundry',
    execution: {
      slug,
      recipeId,
      assetName: String(body.assetName || slug),
      prompt: typeof body.prompt === 'string' ? body.prompt : '',
      creator: String(body.creator || 'Studio Foundry'),
      organizationId: orgId,
      legacyCompat,
    },
  };
}

export function adaptLegacyAssetDirectorRequest(
  body: LegacyBuilderBody,
  sourceRoute: string
): GovernedGenerationRequest | { error: string; code: string } {
  const authResult = resolveLegacyCompatAuthorization(body);
  if ('error' in authResult) return authResult;

  const { authorization } = authResult;
  const initiative = createDemoCreativeInitiative();
  const variantId = String(body.variantId || 'unknown');

  const intent = createDemoAssetIntent(initiative.id);
  intent.id = `intent-asset-director-${variantId}`;
  intent.recipeSlug = 'asset-director-variant';
  intent.discipline = 'static-image';
  intent.outputClass = 'ephemeral';

  return {
    productionAuthorizationId: authorization.id,
    assetIntent: intent,
    orgId: 'frontal-slayer',
    sourceRoute,
    sourceSystem: 'studio-generate-asset',
    execution: {
      blueprintId: String(body.blueprintId || ''),
      blueprintName: String(body.blueprintName || ''),
      studioId: String(body.studioId || ''),
      variantId,
      variantName: String(body.variantName || ''),
      promptStack: body.promptStack,
      referenceImageUrl: body.referenceImageUrl,
    },
  };
}

/** Map of legacy routes to replacement gateway contract. */
export const LEGACY_GENERATION_ROUTE_MAP = {
  '/api/admin/studio-builder-generate': {
    replacement: 'generation-gateway (studio-builder profile)',
    requiresProductionAuthorizationId: true,
    compatAdapter: 'adaptLegacyBuilderRequest',
  },
  '/api/admin/studio-foundry-generate': {
    replacement: 'generation-gateway (studio-foundry profile)',
    requiresProductionAuthorizationId: true,
    compatAdapter: 'adaptLegacyFoundryRequest',
  },
  '/api/admin/studio-generate-asset': {
    replacement: 'generation-gateway (ephemeral admin profile)',
    requiresProductionAuthorizationId: true,
    compatAdapter: 'adaptLegacyAssetDirectorRequest',
  },
} as const;
