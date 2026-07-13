/**
 * Studio World Material Library — organization-owned materials only.
 * No AI-generated marble. No invented textures.
 */

import {
  findBrandAssetByRole,
  getOrganizationBrandVault,
  type BrandAssetRole,
} from '../creative-production/brand-asset-grounding';

export const MATERIAL_LIBRARY_VERSION = 'studio-world-material-library.v1';

export type StudioWorldMaterialId =
  | 'founder-marble'
  | 'founder-white-acrylic'
  | 'founder-crystal'
  | 'founder-chrome'
  | 'founder-glass'
  | 'founder-glass'
  | 'founder-red-illumination'
  | 'brand-metallic'
  | 'brand-frosted-acrylic'
  | 'brand-stone-library';

export type StudioWorldMaterialEntry = {
  materialId: StudioWorldMaterialId;
  displayName: string;
  version: string;
  organizationId: string;
  brandAssetRole: BrandAssetRole | null;
  canonicalUrl: string | null;
  colorToken: string | null;
  aiGenerationForbidden: true;
  approvedForApplication: boolean;
};

const FRONTAL_SLAYER_MATERIALS: StudioWorldMaterialEntry[] = [
  {
    materialId: 'founder-marble',
    displayName: 'Founder Marble',
    version: '1.0.0',
    organizationId: 'frontal-slayer',
    brandAssetRole: 'primary-marble-texture',
    canonicalUrl: '/assets/marble-half.png',
    colorToken: null,
    aiGenerationForbidden: true,
    approvedForApplication: true,
  },
  {
    materialId: 'founder-white-acrylic',
    displayName: 'Founder White Acrylic',
    version: '1.0.0',
    organizationId: 'frontal-slayer',
    brandAssetRole: null,
    canonicalUrl: null,
    colorToken: null,
    aiGenerationForbidden: true,
    approvedForApplication: true,
  },
  {
    materialId: 'founder-crystal',
    displayName: 'Founder Crystal',
    version: '1.0.0',
    organizationId: 'frontal-slayer',
    brandAssetRole: 'acrylic-finish-reference',
    canonicalUrl: null,
    colorToken: null,
    aiGenerationForbidden: true,
    approvedForApplication: true,
  },
  {
    materialId: 'founder-chrome',
    displayName: 'Founder Chrome',
    version: '1.0.0',
    organizationId: 'frontal-slayer',
    brandAssetRole: 'chrome-finish-reference',
    canonicalUrl: null,
    colorToken: null,
    aiGenerationForbidden: true,
    approvedForApplication: true,
  },
  {
    materialId: 'founder-glass',
    displayName: 'Founder Glass',
    version: '1.0.0',
    organizationId: 'frontal-slayer',
    brandAssetRole: null,
    canonicalUrl: null,
    colorToken: null,
    aiGenerationForbidden: true,
    approvedForApplication: true,
  },
  {
    materialId: 'founder-red-illumination',
    displayName: 'Founder Red Illumination',
    version: '1.0.0',
    organizationId: 'frontal-slayer',
    brandAssetRole: 'color-palette',
    canonicalUrl: null,
    colorToken: '#EB1C24',
    aiGenerationForbidden: true,
    approvedForApplication: true,
  },
];

const ORG_MATERIAL_LIBRARIES: Record<string, StudioWorldMaterialEntry[]> = {
  'frontal-slayer': FRONTAL_SLAYER_MATERIALS,
};

export function getMaterialLibrary(organizationId: string): StudioWorldMaterialEntry[] {
  return ORG_MATERIAL_LIBRARIES[organizationId] ?? [];
}

export function resolveMaterialById(
  organizationId: string,
  materialId: StudioWorldMaterialId
): StudioWorldMaterialEntry | null {
  return getMaterialLibrary(organizationId).find((m) => m.materialId === materialId) ?? null;
}

export function assertMaterialLibraryOnly(input: {
  organizationId: string;
  requestedMaterialIds: StudioWorldMaterialId[];
  allowAiInventedMaterials?: boolean;
}): { ok: true; materials: StudioWorldMaterialEntry[] } | { ok: false; code: string; missing: string[] } {
  if (input.allowAiInventedMaterials) {
    return { ok: false, code: 'AI_MATERIAL_INVENTION_FORBIDDEN', missing: [] };
  }
  const missing: string[] = [];
  const materials: StudioWorldMaterialEntry[] = [];
  for (const id of input.requestedMaterialIds) {
    const entry = resolveMaterialById(input.organizationId, id);
    if (!entry || !entry.approvedForApplication) {
      missing.push(id);
    } else {
      materials.push(entry);
    }
  }
  if (missing.length > 0) {
    return { ok: false, code: 'MATERIAL_LIBRARY_REQUIRED_MISSING', missing };
  }
  return { ok: true, materials };
}

export function verifyMaterialFromBrandVault(organizationId: string, role: BrandAssetRole): boolean {
  const vault = getOrganizationBrandVault(organizationId);
  const asset = findBrandAssetByRole(organizationId, role);
  return vault.length > 0 && asset !== null && asset.organizationId === organizationId;
}
