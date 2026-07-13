import {
  assertMaterialLibraryOnly,
  type StudioWorldMaterialId,
  type StudioWorldMaterialEntry,
} from '../studio-world-architecture-v2/material-library';
import { FORBIDDEN_GENERIC_MATERIALS } from '../blueprint-author/material-reference-system';

export const ORGANIZATION_MATERIAL_LOCK_VERSION = 'organization-material-lock.v1';

export type LockedMaterialRef = {
  materialId: StudioWorldMaterialId;
  displayName: string;
  organizationId: string;
  locked: true;
  canonicalUrl: string | null;
};

export function lockOrganizationMaterials(input: {
  organizationId: string;
  materialIds: StudioWorldMaterialId[];
}): { ok: true; materials: LockedMaterialRef[] } | { ok: false; code: string; missing: string[] } {
  const resolved = assertMaterialLibraryOnly({
    organizationId: input.organizationId,
    requestedMaterialIds: input.materialIds,
  });
  if (!resolved.ok) return resolved;

  const materials: LockedMaterialRef[] = resolved.materials.map((m: StudioWorldMaterialEntry) => ({
    materialId: m.materialId,
    displayName: m.displayName,
    organizationId: m.organizationId,
    locked: true,
    canonicalUrl: m.canonicalUrl,
  }));

  return { ok: true, materials };
}

export function assertNoMaterialSubstitution(input: {
  expectedMaterialId: StudioWorldMaterialId;
  actualLabel: string;
}): { ok: true } | { ok: false; code: string; forbidden: string } {
  const lower = input.actualLabel.toLowerCase();
  for (const forbidden of FORBIDDEN_GENERIC_MATERIALS) {
    if (lower.includes(forbidden) && !lower.includes('founder') && !lower.includes('brand')) {
      return { ok: false, code: 'MATERIAL_SUBSTITUTION_FORBIDDEN', forbidden };
    }
  }
  if (!lower.includes(input.expectedMaterialId.replace(/-/g, ' ')) && !lower.includes(input.expectedMaterialId)) {
    if (lower.includes('generic') || lower.includes('substitute')) {
      return { ok: false, code: 'ORGANIZATION_ASSET_DRIFT', forbidden: input.actualLabel };
    }
  }
  return { ok: true };
}
