/**
 * Production Authorization contract — structure validation (client-safe).
 * Server HMAC verification lives in api/_lib/creativeProduction/authorization-signing.ts
 */

import type { ProductionAuthorization, VersionPin } from './types';

export type AuthorizationValidationResult =
  | { ok: true; authorization: ProductionAuthorization }
  | { ok: false; code: string; error: string };

const REQUIRED_GATE_IDS_FOR_MATERIAL = [
  'narrative-blueprint',
  'strategic-fit',
  'production-package',
  'asset-generation',
] as const;

export function isProductionAuthorization(value: unknown): value is ProductionAuthorization {
  if (!value || typeof value !== 'object') return false;
  const a = value as ProductionAuthorization;
  return (
    typeof a.id === 'string' &&
    typeof a.productionPackageId === 'string' &&
    typeof a.narrativeBlueprintId === 'string' &&
    typeof a.productionGenomeId === 'string' &&
    typeof a.initiativeId === 'string' &&
    Array.isArray(a.satisfiedGateIds) &&
    typeof a.signature === 'string' &&
    typeof a.issuedAt === 'string' &&
    a.scope &&
    typeof a.scope === 'object' &&
    a.genomeRefs &&
    typeof a.genomeRefs === 'object'
  );
}

export function validateAuthorizationStructure(
  authorization: ProductionAuthorization,
  nowMs = Date.now()
): AuthorizationValidationResult {
  if (!authorization.id.trim()) {
    return { ok: false, code: 'AUTH_INVALID', error: 'ProductionAuthorization.id is required' };
  }
  if (!authorization.signature.trim()) {
    return { ok: false, code: 'AUTH_UNSIGNED', error: 'ProductionAuthorization.signature is required' };
  }
  if (authorization.approvalState === 'rejected') {
    return { ok: false, code: 'AUTH_REJECTED', error: 'Production authorization was rejected' };
  }
  if (authorization.rightsState === 'restricted') {
    return { ok: false, code: 'AUTH_RIGHTS_RESTRICTED', error: 'Rights clearance required before manufacture' };
  }
  if (authorization.expiresAt) {
    const expires = Date.parse(authorization.expiresAt);
    if (!Number.isNaN(expires) && expires < nowMs) {
      return { ok: false, code: 'AUTH_EXPIRED', error: 'Production authorization expired' };
    }
  }
  for (const gateId of REQUIRED_GATE_IDS_FOR_MATERIAL) {
    if (!authorization.satisfiedGateIds.includes(gateId)) {
      return {
        ok: false,
        code: 'AUTH_GATE_MISSING',
        error: `Required gate not satisfied: ${gateId}`,
      };
    }
  }
  for (const pin of [
    authorization.genomeRefs.companyGenome,
    authorization.genomeRefs.brandDna,
    authorization.genomeRefs.designCanon,
  ]) {
    if (!pin.id || !pin.version) {
      return {
        ok: false,
        code: 'AUTH_GENOME_PIN',
        error: `Genome pin ${pin.system} requires id and version`,
      };
    }
  }
  return { ok: true, authorization };
}

export function authorizationPermitsIntent(
  authorization: ProductionAuthorization,
  touchpoint: string,
  assetIntentId: string
): AuthorizationValidationResult {
  const structure = validateAuthorizationStructure(authorization);
  if (!structure.ok) return structure;
  if (
    authorization.scope.touchpoints.length > 0 &&
    !authorization.scope.touchpoints.includes(touchpoint as ProductionAuthorization['scope']['touchpoints'][number])
  ) {
    return {
      ok: false,
      code: 'AUTH_SCOPE_TOUCHPOINT',
      error: `Touchpoint "${touchpoint}" not permitted by authorization scope`,
    };
  }
  if (
    authorization.scope.assetIntents.length > 0 &&
    !authorization.scope.assetIntents.includes(assetIntentId)
  ) {
    return {
      ok: false,
      code: 'AUTH_SCOPE_INTENT',
      error: `AssetIntent "${assetIntentId}" not permitted by authorization scope`,
    };
  }
  return { ok: true, authorization };
}

export function buildAuthorizationPayloadForSigning(
  authorization: Omit<ProductionAuthorization, 'signature'>
): string {
  const clone = { ...authorization, signature: undefined };
  return JSON.stringify(clone);
}

export function demoGenomePins(): ProductionAuthorization['genomeRefs'] {
  const pin = (system: VersionPin['system'], id: string): VersionPin => ({
    system,
    id,
    version: 'phase-1-demo',
  });
  return {
    companyGenome: pin('company-genome', 'demo-company-genome'),
    brandDna: pin('brand-dna', 'demo-brand-dna'),
    designCanon: pin('design-canon', 'demo-design-canon'),
  };
}
