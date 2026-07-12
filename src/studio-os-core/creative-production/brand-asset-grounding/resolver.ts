import type {
  BrandAssetResolutionError,
  BrandAssetRole,
  BrandMaterialPackage,
  BrandReferenceRole,
  MaterialSlotAssignment,
} from './contract';
import {
  CANONICAL_FINISH_POLICIES,
  findBrandAssetByRole,
  getFrontalSlayerRedToken,
  getOrganizationBrandVault,
} from './vault';

export type MaterialRequest = {
  slot: string;
  requestedMaterial: string;
  brandRole?: BrandAssetRole;
  finishPolicyKey?: string;
  required?: boolean;
  fallbackAllowed?: boolean;
};

const MATERIAL_SYNONYMS: Record<string, BrandAssetRole | string> = {
  'white polished marble': 'primary-marble-texture',
  'polished white marble': 'primary-marble-texture',
  'approved marble': 'primary-marble-texture',
  'organization marble': 'primary-marble-texture',
  'clear crystal acrylic': 'clear-crystal-acrylic',
  'crystal acrylic': 'clear-crystal-acrylic',
  'mirror-polished chrome': 'mirror-polished-chrome',
  'chrome trim': 'mirror-polished-chrome',
  'crimson illumination': 'subtle-crimson-illumination',
  'subtle crimson illumination': 'subtle-crimson-illumination',
  'subtle red illumination': 'subtle-crimson-illumination',
  'frontal slayer red': 'color-token',
};

function resolveRoleFromMaterial(requestedMaterial: string): BrandAssetRole | string | null {
  const key = requestedMaterial.trim().toLowerCase();
  return MATERIAL_SYNONYMS[key] ?? null;
}

function buildMarblePromptInstruction(orgName: string): string {
  return [
    `Use the supplied organization-approved marble texture reference exactly as the material identity for all marble surfaces belonging to ${orgName}.`,
    'Preserve its base tone, vein character, vein density, vein subtlety, tonal contrast, material scale, and clean luxury appearance.',
    'Do not replace it with Carrara, Calacatta, generic white marble, dramatic gray-veined marble, gold-veined marble, random luxury stone, or invented veining.',
    'The reference is material guidance only — not a room layout or environment photograph.',
  ].join(' ');
}

function buildForbiddenSubstitutions(): string {
  return [
    'FORBIDDEN MATERIAL SUBSTITUTIONS:',
    'Carrara marble',
    'Calacatta marble',
    'generic white marble',
    'dramatic gray-veined marble',
    'gold-veined marble',
    'random luxury stone',
    'invented veining',
    'substitute marble when approved organization marble is supplied',
    'generic marble fallback',
  ].join(' · ');
}

export function resolveBrandMaterialPackage(input: {
  organizationId: string;
  organizationName?: string;
  materialRequests: MaterialRequest[];
}): BrandMaterialPackage | BrandAssetResolutionError {
  const vault = getOrganizationBrandVault(input.organizationId);
  if (vault.length === 0 && input.materialRequests.some((r) => r.required !== false)) {
    return {
      code: 'BRAND_ASSET_REQUIRED_MISSING',
      missingRole: 'primary-marble-texture',
      organizationId: input.organizationId,
      message: `No brand vault configured for organization ${input.organizationId}.`,
    };
  }

  const orgName = input.organizationName ?? input.organizationId;
  const profile = vault[0];
  const slots: MaterialSlotAssignment[] = [];
  const referenceUrls: string[] = [];
  const referenceChecksums: string[] = [];
  const colorTokens: Record<string, string> = {};
  const materialMappings: Record<string, string> = {};

  for (const req of input.materialRequests) {
    const synonym = req.brandRole ?? resolveRoleFromMaterial(req.requestedMaterial);
    const required = req.required !== false;

    if (synonym === 'color-token' || req.requestedMaterial.toLowerCase().includes('red')) {
      const token = getFrontalSlayerRedToken();
      colorTokens.accentLighting = token;
      materialMappings[req.slot] = `Frontal Slayer Red ${token}`;
      slots.push({
        slot: req.slot,
        requestedMaterial: req.requestedMaterial,
        resolvedBrandAssetId: 'fs-brand-red',
        resolvedReferenceUrl: null,
        checksum: null,
        useMode: 'prompt-token',
        promptInstruction: CANONICAL_FINISH_POLICIES['subtle-crimson-illumination'].promptInstruction,
        required,
        fallbackAllowed: false,
        referenceRole: 'color-reference',
        referenceWeight: 1.0,
        sourceOrganizationId: input.organizationId,
        appliedToMaterialSlot: req.slot,
      });
      continue;
    }

    if (typeof synonym === 'string' && synonym in CANONICAL_FINISH_POLICIES) {
      const policy = CANONICAL_FINISH_POLICIES[synonym];
      materialMappings[req.slot] = synonym;
      slots.push({
        slot: req.slot,
        requestedMaterial: req.requestedMaterial,
        resolvedBrandAssetId: null,
        resolvedReferenceUrl: null,
        checksum: null,
        useMode: 'finish-policy',
        promptInstruction: policy.promptInstruction,
        required,
        fallbackAllowed: req.fallbackAllowed ?? false,
        referenceRole: 'material-reference',
        referenceWeight: 0.6,
        sourceOrganizationId: input.organizationId,
        appliedToMaterialSlot: req.slot,
      });
      continue;
    }

    const role = (synonym ?? req.brandRole) as BrandAssetRole | undefined;
    if (role) {
      const asset = findBrandAssetByRole(input.organizationId, role);
      if (!asset && required) {
        return {
          code: 'BRAND_ASSET_REQUIRED_MISSING',
          missingRole: role,
          organizationId: input.organizationId,
          message: `Required brand asset missing for role ${role} (organization ${input.organizationId}).`,
        };
      }
      if (asset) {
        if (asset.organizationId !== input.organizationId) {
          return {
            code: 'BRAND_ASSET_REQUIRED_MISSING',
            missingRole: role,
            organizationId: input.organizationId,
            message: `Cross-organization brand asset blocked for role ${role}.`,
          };
        }
        materialMappings[req.slot] = role;
        if (asset.canonicalUrl) {
          referenceUrls.push(asset.canonicalUrl);
          referenceChecksums.push(asset.checksum);
        }
        const promptInstruction =
          role === 'primary-marble-texture'
            ? buildMarblePromptInstruction(orgName)
            : `Use approved organization ${role} reference exactly.`;
        slots.push({
          slot: req.slot,
          requestedMaterial: req.requestedMaterial,
          resolvedBrandAssetId: asset.assetId,
          resolvedReferenceUrl: asset.canonicalUrl || null,
          checksum: asset.checksum,
          useMode: asset.canonicalUrl ? 'reference-image' : 'prompt-token',
          promptInstruction,
          required,
          fallbackAllowed: false,
          referenceRole: 'material-reference',
          referenceWeight: 0.85,
          sourceOrganizationId: input.organizationId,
          appliedToMaterialSlot: req.slot,
        });
        continue;
      }
    }

    if (required) {
      return {
        code: 'BRAND_ASSET_REQUIRED_MISSING',
        missingRole: 'primary-marble-texture',
        organizationId: input.organizationId,
        message: `Cannot resolve required material: ${req.requestedMaterial}`,
      };
    }
  }

  const assignmentLines = slots
    .map((s) => `${s.slot}: ${materialMappings[s.slot] ?? s.requestedMaterial}`)
    .join(' · ');

  const referenceLines = slots
    .filter((s) => s.resolvedReferenceUrl)
    .map(
      (s) =>
        `${s.appliedToMaterialSlot} ← ${s.resolvedBrandAssetId} (${s.referenceRole}, weight ${s.referenceWeight})`
    )
    .join(' · ');

  return {
    organizationId: input.organizationId,
    brandProfileId: profile?.brandProfileId ?? `${input.organizationId}-brand`,
    brandAssetSetId: profile?.brandAssetSetId ?? `${input.organizationId}-materials`,
    materialSlots: slots,
    referenceUrls: [...new Set(referenceUrls)],
    referenceChecksums,
    colorTokens,
    materialMappings,
    promptSections: {
      organizationMaterialAssignments: `ORGANIZATION MATERIAL ASSIGNMENTS: ${assignmentLines}`,
      exactBrandAssetReferences: referenceLines
        ? `EXACT BRAND-ASSET REFERENCES: ${referenceLines}`
        : 'EXACT BRAND-ASSET REFERENCES: finish-policy tokens only.',
      forbiddenMaterialSubstitutions: buildForbiddenSubstitutions(),
    },
  };
}

export function validateReferencePolicy(input: {
  references: Array<{ url: string; role: BrandReferenceRole; organizationId: string }>;
  targetOrganizationId: string;
}): { ok: true } | { ok: false; code: string; reason: string } {
  for (const ref of input.references) {
    if (ref.role === 'forbidden-scene-reference') {
      return {
        ok: false,
        code: 'FORBIDDEN_SCENE_REFERENCE',
        reason: 'Full-scene reference is prohibited for isolated generation.',
      };
    }
    if (ref.organizationId !== input.targetOrganizationId) {
      return {
        ok: false,
        code: 'CROSS_ORG_BRAND_LEAK',
        reason: `Reference from ${ref.organizationId} cannot be used for ${input.targetOrganizationId}.`,
      };
    }
    const lower = ref.url.toLowerCase();
    if (
      lower.includes('environment-shell') ||
      lower.includes('scene-stack') ||
      lower.includes('full-room') ||
      lower.includes('shell-screenshot')
    ) {
      return {
        ok: false,
        code: 'FORBIDDEN_SCENE_REFERENCE',
        reason: 'Unclassified full-scene image rejected for isolated generation.',
      };
    }
  }
  return { ok: true };
}

export function isBrandAssetResolutionError(
  result: BrandMaterialPackage | BrandAssetResolutionError
): result is BrandAssetResolutionError {
  return 'code' in result && result.code === 'BRAND_ASSET_REQUIRED_MISSING';
}
