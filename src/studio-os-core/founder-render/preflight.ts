import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import {
  isBrandAssetResolutionError,
  resolveBrandMaterialPackage,
} from '../creative-production/brand-asset-grounding';
import { validatorExistsForIntent } from '../creative-production/artifact-intent';
import { FOUNDER_RENDER_ARTIFACT_INTENT } from './contract';
import { resolveFounderRenderModelRoute } from './model-route';
import { resolveFounderRenderBrandOrganizationId } from './brand-organization';

export type FounderRenderPreflightResult =
  | { ok: true; brandReferenceUrls: string[]; materialSetId: string; brandVaultOrganizationId: string }
  | { ok: false; code: string; message: string; missingRole?: string };

export function runFounderRenderPreflight(plan: ConstructionPlan): FounderRenderPreflightResult {
  if (!validatorExistsForIntent('founder-full-room-preview')) {
    return { ok: false, code: 'NO_VALIDATOR_FOR_ARTIFACT_INTENT', message: 'Founder render validator missing.' };
  }

  const route = resolveFounderRenderModelRoute('16:9');
  if (!route.providerModel) {
    return { ok: false, code: 'MODEL_ROUTE_UNAVAILABLE', message: 'Founder render model route unavailable.' };
  }

  const brandVaultOrganizationId = resolveFounderRenderBrandOrganizationId(plan);

  const brandResult = resolveBrandMaterialPackage({
    organizationId: brandVaultOrganizationId,
    organizationName: plan.metadata.organizationId,
    materialRequests: [
      { slot: 'floor', requestedMaterial: 'white polished marble', brandRole: 'primary-marble-texture', required: true },
      { slot: 'desk', requestedMaterial: 'mirror-polished chrome', brandRole: 'chrome-finish-reference', required: false },
      { slot: 'accent', requestedMaterial: 'subtle crimson illumination', brandRole: 'approved-lighting-reference', required: false },
    ],
  });

  if (isBrandAssetResolutionError(brandResult)) {
    const planOrg = plan.metadata.organizationId;
    const message =
      brandVaultOrganizationId !== planOrg
        ? `${brandResult.message} (plan org: ${planOrg}, brand vault: ${brandVaultOrganizationId})`
        : brandResult.message;
    return {
      ok: false,
      code: brandResult.code,
      message,
      missingRole: brandResult.missingRole,
    };
  }

  const refs = brandResult.referenceUrls.filter((u) => u.length > 0);
  if (refs.length === 0) {
    return {
      ok: false,
      code: 'BRAND_ASSET_REQUIRED_MISSING',
      message: 'Required brand material references missing for founder render.',
      missingRole: 'primary-marble-texture',
    };
  }

  return {
    ok: true,
    brandReferenceUrls: refs,
    materialSetId: plan.materialSet.materialSetId,
    brandVaultOrganizationId,
  };
}

export function founderRenderArtifactIntentLabel(): string {
  return FOUNDER_RENDER_ARTIFACT_INTENT;
}
