import type { ModLineageRecord } from './contract';
import { FOUNDER_MODS_VERSION } from './contract';
import type { FounderCreatedModRecord } from './contract';

export function buildModLineageRoot(mod: FounderCreatedModRecord): ModLineageRecord {
  return {
    lineageVersion: FOUNDER_MODS_VERSION,
    rootTemplateId: mod.sourceIndustryPackId,
    rootTemplateVersion: '1.0.0',
    creatorOrganizationId: mod.creatorOrganizationId,
    creatorModId: mod.customSceneId,
    creatorModVersion: mod.version,
    marketplaceListingId: null,
    licenseId: null,
    buyerOrganizationId: null,
    installedInstanceId: null,
    installedAt: null,
    derivativeRevision: 0,
    attributionRequired: true,
    royaltyObligation: Boolean(mod.royaltyPolicyId),
    updateEntitlement: false,
  };
}

export function extendLineageForInstallation(input: {
  root: ModLineageRecord;
  marketplaceListingId: string;
  licenseId: string;
  buyerOrganizationId: string;
  installedInstanceId: string;
}): ModLineageRecord {
  return {
    ...input.root,
    marketplaceListingId: input.marketplaceListingId,
    licenseId: input.licenseId,
    buyerOrganizationId: input.buyerOrganizationId,
    installedInstanceId: input.installedInstanceId,
    installedAt: new Date().toISOString(),
    derivativeRevision: 1,
    attributionRequired: true,
    royaltyObligation: input.root.royaltyObligation,
    updateEntitlement: true,
  };
}

export function assertBuyerDoesNotBecomeCreator(lineage: ModLineageRecord): { ok: true } | { ok: false; code: string; message: string } {
  if (lineage.buyerOrganizationId === lineage.creatorOrganizationId) {
    return { ok: true };
  }
  if (lineage.buyerOrganizationId && lineage.buyerOrganizationId === lineage.creatorModId) {
    return { ok: false, code: 'CREATOR_SPOOF', message: 'Buyer cannot become original creator.' };
  }
  return { ok: true };
}

export function assertLineageImmutable(
  before: ModLineageRecord,
  after: ModLineageRecord
): { ok: true } | { ok: false; code: string; message: string } {
  if (before.creatorOrganizationId !== after.creatorOrganizationId) {
    return { ok: false, code: 'LINEAGE_REWRITE', message: 'Creator organization lineage is immutable.' };
  }
  if (before.creatorModId !== after.creatorModId) {
    return { ok: false, code: 'LINEAGE_REWRITE', message: 'Creator mod ID lineage is immutable.' };
  }
  return { ok: true };
}
