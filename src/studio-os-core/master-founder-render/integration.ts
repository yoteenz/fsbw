import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type {
  ApprovedMasterRenderHandoff,
  BrandAssetLockBundle,
  CompositionPack,
} from './contract';
import { buildBlueprintCompositionMetadata } from './blueprint-composition-metadata';
import { buildDefaultCompositionPack, lockCompositionPack } from './composition-pack';
import type { MasterFounderRender, MasterPortraitRender } from './contract';
import { approveMasterLandscape } from './master-landscape';
import { approveMasterPortrait } from './master-portrait';
import { validatePortraitLandscapeParity } from './quality-guard-composition';
import {
  validateFounderRenderBeforeApproval,
  type RenderUiInspectionInput,
} from '../immune-system/architecture-law-validation';

export function buildBrandAssetLockBundle(input: {
  landscape: MasterFounderRender;
  plan: ConstructionPlan;
  brandVaultId?: string;
}): BrandAssetLockBundle {
  return {
    masterLandscapeUrl: input.landscape.artifactUrl!,
    materialLibraryId: input.plan.materialSet.materialSetId,
    brandVaultId: input.brandVaultId ?? input.plan.metadata.organizationId,
    marbleProfileId: 'founder-marble-profile',
    glassProfileId: 'founder-glass-profile',
    acrylicProfileId: 'founder-acrylic-profile',
    lightingProfileId: input.plan.lightingProfile.profileId,
    furnitureSetId: input.plan.furnitureSet.setId,
  };
}

export function buildApprovedMasterRenderHandoff(input: {
  landscape: MasterFounderRender;
  portrait: MasterPortraitRender | null;
  compositionPack: CompositionPack;
  plan: ConstructionPlan;
  approvedBy: string;
  brandVaultId?: string;
}): ApprovedMasterRenderHandoff {
  const landscape = approveMasterLandscape(input.landscape, input.approvedBy);
  const portrait = input.portrait ? approveMasterPortrait(input.portrait, input.approvedBy) : null;
  const lockedPack = lockCompositionPack(input.compositionPack);

  return {
    handoffVersion: 'approved-master-render-handoff.v1',
    organizationId: landscape.organizationId,
    masterLandscape: landscape,
    masterPortrait: portrait,
    compositionPack: lockedPack,
    blueprintComposition: buildBlueprintCompositionMetadata(input.plan),
    brandLock: buildBrandAssetLockBundle({
      landscape,
      plan: input.plan,
      brandVaultId: input.brandVaultId,
    }),
    departmentRegistryId: landscape.departmentRegistryId,
    approvedAt: new Date().toISOString(),
    approvedBy: input.approvedBy,
  };
}

/** Architecture Law #001 — reject founder render approval if AI generated production UI. */
export function validateMasterLandscapeApprovalGate(input: RenderUiInspectionInput) {
  return validateFounderRenderBeforeApproval(input);
}

/** CDS receives masters + composition pack — nothing regenerated. */
export function validateCdsMasterRenderEntry(handoff: ApprovedMasterRenderHandoff | null) {
  if (!handoff) {
    return { ok: false as const, code: 'HANDOFF_MISSING', message: 'CDS requires approved Master Render handoff.' };
  }
  if (handoff.masterLandscape.status !== 'approved') {
    return { ok: false as const, code: 'LANDSCAPE_NOT_APPROVED', message: 'Master Landscape must be approved.' };
  }
  if (!handoff.compositionPack.locked) {
    return { ok: false as const, code: 'COMPOSITION_PACK_UNLOCKED', message: 'Composition pack must be locked.' };
  }
  if (handoff.masterPortrait) {
    const parity = validatePortraitLandscapeParity({
      landscape: handoff.masterLandscape,
      portrait: handoff.masterPortrait,
      revisions: handoff.masterLandscape.revisions,
      brandLock: handoff.brandLock,
    });
    if (!parity.ok) return parity;
  }
  return { ok: true as const };
}

/** Construction Mode references master renders — not device-specific rooms. */
export const CONSTRUCTION_MODE_USES_MASTER_RENDERS = true;

/** Experience Lab displays both masters + composition pack in Founder Review. */
export const EXPERIENCE_LAB_FOUNDER_REVIEW_SHOWS_COMPOSITION_PACK = true;

export function initializeCompositionPackForLandscape(landscape: MasterFounderRender): CompositionPack {
  return buildDefaultCompositionPack({
    packId: `composition-pack.${landscape.renderId}`,
    masterLandscapeRenderId: landscape.renderId,
  });
}

export function attachPortraitToCompositionPack(
  pack: CompositionPack,
  portrait: MasterPortraitRender
): CompositionPack {
  if (pack.locked) throw new Error('Cannot attach portrait — composition pack is locked.');
  return { ...pack, masterPortraitRenderId: portrait.portraitId };
}
