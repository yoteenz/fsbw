import type { BrandAssetRecord } from './contract';

/** Simple stable checksum for brand asset identity (browser + server safe). */
export function brandAssetChecksum(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `ba-${(h >>> 0).toString(16).padStart(8, '0')}`;
}

const FRONTAL_SLAYER_MARBLE_PATH = '/assets/marble-half.png';
const FRONTAL_SLAYER_RED = '#EB1C24';

const FRONTAL_SLAYER_VAULT: BrandAssetRecord[] = [
  {
    organizationId: 'frontal-slayer',
    brandProfileId: 'frontal-slayer-brand-v1',
    brandAssetSetId: 'frontal-slayer-materials-v1',
    assetRole: 'primary-marble-texture',
    assetId: 'fs-primary-marble-half',
    assetType: 'texture',
    canonicalUrl: FRONTAL_SLAYER_MARBLE_PATH,
    storagePath: 'public/assets/marble-half.png',
    checksum: brandAssetChecksum('frontal-slayer:primary-marble-texture:marble-half.png'),
    mimeType: 'image/png',
    width: 2048,
    height: 2048,
    colorSpace: 'sRGB',
    repeatPolicy: 'tile',
    cropPolicy: 'full',
    referenceStrengthPolicy: 'strong-material',
    materialScale: 'architectural-surface',
    materialOrientation: 'horizontal-vein',
    approvedForGeneration: true,
    approvedForPublicOutput: true,
    sensitivity: 'public',
    active: true,
    version: '1.0.0',
    updatedAt: '2026-07-12T00:00:00.000Z',
  },
  {
    organizationId: 'frontal-slayer',
    brandProfileId: 'frontal-slayer-brand-v1',
    brandAssetSetId: 'frontal-slayer-materials-v1',
    assetRole: 'color-palette',
    assetId: 'fs-brand-red',
    assetType: 'palette',
    canonicalUrl: '',
    storagePath: '',
    checksum: brandAssetChecksum(`frontal-slayer:color:${FRONTAL_SLAYER_RED}`),
    mimeType: 'application/json',
    width: 0,
    height: 0,
    colorSpace: 'sRGB',
    repeatPolicy: 'none',
    cropPolicy: 'none',
    referenceStrengthPolicy: 'strong-material',
    materialScale: 'accent-illumination',
    materialOrientation: 'n/a',
    approvedForGeneration: true,
    approvedForPublicOutput: true,
    sensitivity: 'public',
    active: true,
    version: '1.0.0',
    updatedAt: '2026-07-12T00:00:00.000Z',
  },
];

/** Canonical finish policies — platform-neutral material language without invented textures. */
export const CANONICAL_FINISH_POLICIES: Record<string, { promptInstruction: string; useMode: 'finish-policy' }> = {
  'clear-crystal-acrylic': {
    promptInstruction:
      'Clear crystal acrylic panels — optical clarity, subtle internal refraction, premium glass-like acrylic without yellowing.',
    useMode: 'finish-policy',
  },
  'mirror-polished-chrome': {
    promptInstruction:
      'Mirror-polished chrome trim — high reflectivity, crisp specular highlights, luxury metal edge treatment.',
    useMode: 'finish-policy',
  },
  'subtle-crimson-illumination': {
    promptInstruction: `Subtle crimson accent illumination using exact Frontal Slayer Red ${FRONTAL_SLAYER_RED} — restrained glow, not oversaturated.`,
    useMode: 'finish-policy',
  },
};

const ORGANIZATION_VAULTS: Record<string, BrandAssetRecord[]> = {
  'frontal-slayer': FRONTAL_SLAYER_VAULT,
};

export function getOrganizationBrandVault(organizationId: string): BrandAssetRecord[] {
  return ORGANIZATION_VAULTS[organizationId] ?? [];
}

export function findBrandAssetByRole(
  organizationId: string,
  role: import('./contract.js').BrandAssetRole
): BrandAssetRecord | null {
  const vault = getOrganizationBrandVault(organizationId);
  return (
    vault.find((a) => a.assetRole === role && a.active && a.approvedForGeneration) ?? null
  );
}

export function assertOrganizationOwnership(
  asset: BrandAssetRecord,
  organizationId: string
): boolean {
  return asset.organizationId === organizationId && asset.active;
}

export function getFrontalSlayerRedToken(): string {
  return FRONTAL_SLAYER_RED;
}
