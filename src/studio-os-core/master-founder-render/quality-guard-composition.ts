import type {
  BrandAssetLockBundle,
  CompositionValidationResult,
  MasterFounderRender,
  PortraitLandscapeParityInput,
} from './contract';

export function assertBrandAssetsLocked(input: {
  landscape: MasterFounderRender;
  brandLock: BrandAssetLockBundle;
}): CompositionValidationResult {
  if (!input.landscape.artifactUrl || input.landscape.artifactUrl !== input.brandLock.masterLandscapeUrl) {
    return {
      ok: false,
      code: 'BRAND_ASSET_DRIFT',
      message: 'Portrait/composition generation must reference the approved Master Landscape URL.',
    };
  }
  if (!input.landscape.organizationAssets.includes(input.brandLock.materialLibraryId)) {
    return {
      ok: false,
      code: 'MATERIAL_DRIFT',
      message: 'Material library revision does not match approved master render.',
    };
  }
  return { ok: true };
}

export function validatePortraitGenerationGate(landscape: MasterFounderRender): CompositionValidationResult {
  if (landscape.status !== 'approved') {
    return {
      ok: false,
      code: 'LANDSCAPE_NOT_APPROVED',
      message: 'Master Portrait may only generate after Master Landscape founder approval.',
    };
  }
  if (!landscape.artifactUrl?.startsWith('http')) {
    return {
      ok: false,
      code: 'MISSING_LANDSCAPE_REFERENCE',
      message: 'Approved Master Landscape artifact URL is required before portrait recomposition.',
    };
  }
  return { ok: true };
}

/**
 * Quality Guard™ — portrait must match landscape.
 * Architecture · materials · lighting · furniture · brand identical — framing only differs.
 */
export function validatePortraitLandscapeParity(input: PortraitLandscapeParityInput): CompositionValidationResult {
  const { landscape, portrait, revisions, brandLock } = input;

  const landscapeGate = validatePortraitGenerationGate(landscape);
  if (!landscapeGate.ok) return landscapeGate;

  if (portrait.masterLandscapeRenderId !== landscape.renderId) {
    return {
      ok: false,
      code: 'DIFFERENT_ROOM',
      message: 'Portrait does not reference the canonical Master Landscape render.',
    };
  }

  if (portrait.landscapeArtifactUrl !== landscape.artifactUrl) {
    return {
      ok: false,
      code: 'ARCHITECTURE_DRIFT',
      message: 'Portrait landscape reference URL does not match approved Master Landscape.',
    };
  }

  if (portrait.landscapeApprovedAt !== landscape.approvedAt) {
    return {
      ok: false,
      code: 'REVISION_MISMATCH',
      message: 'Portrait was generated against a stale landscape approval.',
    };
  }

  const brandCheck = assertBrandAssetsLocked({ landscape, brandLock });
  if (!brandCheck.ok) return brandCheck;

  if (
    landscape.revisions.blueprintRevision !== revisions.blueprintRevision ||
    landscape.revisions.materialRevision !== revisions.materialRevision ||
    landscape.revisions.lightingRevision !== revisions.lightingRevision
  ) {
    return {
      ok: false,
      code: 'REVISION_MISMATCH',
      message: 'Portrait parity check failed — revision bundle does not match approved master.',
    };
  }

  if (!portrait.artifactUrl?.startsWith('http')) {
    return {
      ok: false,
      code: 'PORTRAIT_WITHOUT_APPROVED_LANDSCAPE',
      message: 'Portrait artifact missing — cannot verify parity.',
    };
  }

  return { ok: true };
}

/** Reject known drift patterns from generation metadata (forensic layer). */
export function rejectCompositionDriftFlags(flags: {
  differentRoom?: boolean;
  differentChandelier?: boolean;
  differentMarble?: boolean;
  differentWalls?: boolean;
  differentFurniture?: boolean;
  differentLayout?: boolean;
  differentLighting?: boolean;
  differentArchitecture?: boolean;
}): CompositionValidationResult {
  if (flags.differentRoom) {
    return { ok: false, code: 'DIFFERENT_ROOM', message: 'Quality Guard rejected — different room detected.' };
  }
  if (flags.differentArchitecture || flags.differentLayout) {
    return { ok: false, code: 'ARCHITECTURE_DRIFT', message: 'Quality Guard rejected — architecture or layout drift.' };
  }
  if (flags.differentMarble) {
    return { ok: false, code: 'MATERIAL_DRIFT', message: 'Quality Guard rejected — marble/material drift.' };
  }
  if (flags.differentLighting) {
    return { ok: false, code: 'LIGHTING_DRIFT', message: 'Quality Guard rejected — lighting drift.' };
  }
  if (flags.differentFurniture) {
    return { ok: false, code: 'FURNITURE_DRIFT', message: 'Quality Guard rejected — furniture drift.' };
  }
  if (flags.differentChandelier || flags.differentWalls) {
    return { ok: false, code: 'BRAND_ASSET_DRIFT', message: 'Quality Guard rejected — brand asset drift.' };
  }
  return { ok: true };
}

export function validateCompositionPackLocked(locked: boolean): CompositionValidationResult {
  if (!locked) {
    return {
      ok: false,
      code: 'COMPOSITION_PACK_UNLOCKED',
      message: 'All compositions must be locked after founder approval.',
    };
  }
  return { ok: true };
}
