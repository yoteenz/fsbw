import type { FounderCreatedModRecord } from './contract';
import { FOUNDER_MODS_VERSION } from './contract';

export const FRONTAL_SLAYER_ORG_ID = 'frontal-slayer' as const;
export const FRONTAL_SLAYER_FOUNDER_ID = 'kateena-armstrong' as const;

function mod(
  partial: Omit<FounderCreatedModRecord, 'modVersion' | 'contentClass' | 'creatorOrganizationId' | 'creatorFounderId'>
): FounderCreatedModRecord {
  return {
    modVersion: FOUNDER_MODS_VERSION,
    contentClass: 'FOUNDER_CREATED_MODDED_SCENE',
    creatorOrganizationId: FRONTAL_SLAYER_ORG_ID,
    creatorFounderId: FRONTAL_SLAYER_FOUNDER_ID,
    ...partial,
  };
}

/** Frontal Slayer founder-created mods — preserved, not official pack defaults. */
export const FRONTAL_SLAYER_FOUNDER_MODS: FounderCreatedModRecord[] = [
  mod({
    customSceneId: 'build-a-wig-atelier',
    displayName: 'Build-A-Wig Atelier™',
    protectedName: 'Build-A-Wig Atelier™',
    sourceIndustryPackId: 'official-hair-brand',
    sourceDepartmentTemplateId: 'studio-floor',
    conceptOwner: FRONTAL_SLAYER_ORG_ID,
    assetOwner: FRONTAL_SLAYER_ORG_ID,
    workflowOwner: FRONTAL_SLAYER_ORG_ID,
    blueprintOwner: FRONTAL_SLAYER_ORG_ID,
    promptOwner: FRONTAL_SLAYER_ORG_ID,
    version: '1.0.0',
    creationDate: '2025-01-01T00:00:00.000Z',
    lineage: ['official-hair-brand', 'frontal-slayer-customization', 'build-a-wig-atelier'],
    privateStatus: true,
    defaultAvailability: false,
    marketplaceEligibility: true,
    licensingStatus: 'pending',
    royaltyPolicyId: 'royalty-baw-atelier-v1',
    brandNeutralizationRequired: true,
    rightsRestrictions: ['no-redistribution-of-source-assets', 'attribution-required', 'frontal-slayer-brand-strip-on-publish'],
    publicationStatus: 'PRIVATE_ONLY',
  }),
  mod({
    customSceneId: 'hair-analysis-lab',
    displayName: 'Hair Analysis Lab™',
    protectedName: 'Hair Analysis Lab™',
    sourceIndustryPackId: 'official-hair-brand',
    sourceDepartmentTemplateId: 'treatment-room',
    conceptOwner: FRONTAL_SLAYER_ORG_ID,
    assetOwner: FRONTAL_SLAYER_ORG_ID,
    workflowOwner: FRONTAL_SLAYER_ORG_ID,
    blueprintOwner: FRONTAL_SLAYER_ORG_ID,
    promptOwner: FRONTAL_SLAYER_ORG_ID,
    version: '1.0.0',
    creationDate: '2025-03-01T00:00:00.000Z',
    lineage: ['official-hair-brand', 'frontal-slayer-customization', 'hair-analysis-lab'],
    privateStatus: true,
    defaultAvailability: false,
    marketplaceEligibility: false,
    licensingStatus: 'unlicensed',
    royaltyPolicyId: null,
    brandNeutralizationRequired: true,
    rightsRestrictions: ['private-only', 'no-marketplace-without-certification'],
    publicationStatus: 'PRIVATE_ONLY',
  }),
  mod({
    customSceneId: 'transformation-suite',
    displayName: 'Transformation Suite™',
    protectedName: 'Transformation Suite™',
    sourceIndustryPackId: 'official-hair-salon',
    sourceDepartmentTemplateId: 'treatment-room',
    conceptOwner: FRONTAL_SLAYER_ORG_ID,
    assetOwner: FRONTAL_SLAYER_ORG_ID,
    workflowOwner: FRONTAL_SLAYER_ORG_ID,
    blueprintOwner: FRONTAL_SLAYER_ORG_ID,
    promptOwner: FRONTAL_SLAYER_ORG_ID,
    version: '1.0.0',
    creationDate: '2025-02-01T00:00:00.000Z',
    lineage: ['official-hair-salon', 'frontal-slayer-customization', 'transformation-suite'],
    privateStatus: true,
    defaultAvailability: false,
    marketplaceEligibility: false,
    licensingStatus: 'unlicensed',
    royaltyPolicyId: null,
    brandNeutralizationRequired: true,
    rightsRestrictions: ['private-only'],
    publicationStatus: 'PRIVATE_ONLY',
  }),
];

export function getFounderMod(customSceneId: string): FounderCreatedModRecord | undefined {
  return FRONTAL_SLAYER_FOUNDER_MODS.find((m) => m.customSceneId === customSceneId);
}

export function listFounderModsForOrganization(organizationId: string): FounderCreatedModRecord[] {
  return FRONTAL_SLAYER_FOUNDER_MODS.filter((m) => m.creatorOrganizationId === organizationId);
}

export function assertFounderModPreserved(customSceneId: string): { ok: true; mod: FounderCreatedModRecord } | { ok: false; code: string } {
  const record = getFounderMod(customSceneId);
  if (!record) return { ok: false, code: 'MOD_NOT_FOUND' };
  return { ok: true, mod: record };
}
