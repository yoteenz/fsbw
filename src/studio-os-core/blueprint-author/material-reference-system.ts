import {
  assertMaterialLibraryOnly,
  type StudioWorldMaterialId,
  type StudioWorldMaterialEntry,
} from '../studio-world-architecture-v2/material-library';

export const MATERIAL_REFERENCE_SYSTEM_VERSION = 'material-reference-system.v1';

/** Forbidden generic material terms — models must never invent these */
export const FORBIDDEN_GENERIC_MATERIALS = [
  'marble',
  'stone',
  'glass',
  'wood',
  'chrome',
  'generic-marble',
  'generic-stone',
  'generic-glass',
  'generic-wood',
  'generic-chrome',
] as const;

export type MaterialReference = {
  materialId: StudioWorldMaterialId;
  organizationId: string;
  version: string;
  canonicalUrl: string | null;
};

export function resolveMaterialReferences(input: {
  organizationId: string;
  materialIds: StudioWorldMaterialId[];
}): { ok: true; materials: StudioWorldMaterialEntry[] } | { ok: false; code: string; missing: string[] } {
  return assertMaterialLibraryOnly({
    organizationId: input.organizationId,
    requestedMaterialIds: input.materialIds,
  });
}

export function assertNoGenericMaterialInvention(input: {
  actualMaterialLabel: string;
}): { ok: true } | { ok: false; code: string; forbidden: string } {
  const lower = input.actualMaterialLabel.toLowerCase();
  for (const forbidden of FORBIDDEN_GENERIC_MATERIALS) {
    if (lower.includes(forbidden) && !lower.includes('founder-') && !lower.includes('brand-')) {
      return { ok: false, code: 'GENERIC_MATERIAL_INVENTED', forbidden };
    }
  }
  return { ok: true };
}

export function buildMaterialSetReference(input: {
  materialSetId: string;
  version: string;
  organizationId: string;
  materialIds: StudioWorldMaterialId[];
}): { ok: true; materialSetId: string; version: string; materials: StudioWorldMaterialEntry[] } | { ok: false; code: string; missing: string[] } {
  const resolved = resolveMaterialReferences({
    organizationId: input.organizationId,
    materialIds: input.materialIds,
  });
  if (!resolved.ok) return resolved;
  return {
    ok: true,
    materialSetId: input.materialSetId,
    version: input.version,
    materials: resolved.materials,
  };
}
