import type { IndustryPack } from '../industry-packs/contract';
import { getIndustryPack } from '../industry-packs/industry-pack-registry';
import type { FounderCreatedModRecord } from './contract';
import { buildModLineageRoot, extendLineageForInstallation } from './ip-lineage';
import { issueModLicense, enforceLicenseLimits } from './mod-licensing';
import { buildBrandNeutralMarketplacePackage } from './marketplace-neutral-package';
import { computeRoyaltySplit, createRoyaltyLedgerEntry, getRoyaltyPolicy } from './royalty-policy';
import { runModCertification } from './mod-certification';

export type ModInstallationPlan = {
  modId: string;
  buyerOrganizationId: string;
  basePackId: string;
  neutralPackageId: string;
  reuseCertifiedBlueprint: boolean;
  reuseNeutralAssets: boolean;
  chargeCreditsFor: string[];
  lineageRecord: ReturnType<typeof extendLineageForInstallation>;
  licenseId: string;
  ledgerEntryId: string | null;
};

export function planModInstallation(input: {
  mod: FounderCreatedModRecord;
  buyerOrganizationId: string;
  buyerBasePackId: string;
  salePrice?: number;
  platformFeeRate?: number;
  creatorRoyaltyRate?: number;
}): { ok: true; plan: ModInstallationPlan } | { ok: false; code: string; message: string } {
  const certification = runModCertification(input.mod);
  const certified =
    input.mod.publicationStatus === 'CERTIFIED' ||
    input.mod.publicationStatus === 'CERTIFIED_WITH_RESTRICTIONS' ||
    certification.outcome === 'CERTIFIED' ||
    certification.outcome === 'CERTIFIED_WITH_RESTRICTIONS';

  if (!certified || input.mod.publicationStatus === 'PRIVATE_ONLY') {
    return { ok: false, code: 'MOD_NOT_CERTIFIED', message: 'Non-certified mods cannot install into production HQs.' };
  }

  const basePack = getIndustryPack(input.buyerBasePackId);
  if (!basePack) {
    return { ok: false, code: 'BASE_PACK_MISSING', message: 'Buyer must have a compatible base Industry Pack.' };
  }

  const compatible = assertCompatibleBasePack(basePack, input.mod);
  if (!compatible.ok) return compatible;

  const license = issueModLicense({
    licenseId: `license-${input.mod.customSceneId}-${input.buyerOrganizationId}`,
    licenseType: 'PERSONAL_HEADQUARTERS_LICENSE',
    modId: input.mod.customSceneId,
    buyerOrganizationId: input.buyerOrganizationId,
  });

  const limit = enforceLicenseLimits(license, 0);
  if (!limit.ok) return limit;

  const neutralPkg = buildBrandNeutralMarketplacePackage(input.mod);
  const root = buildModLineageRoot(input.mod);
  const lineage = extendLineageForInstallation({
    root,
    marketplaceListingId: `listing-${input.mod.customSceneId}`,
    licenseId: license.licenseId,
    buyerOrganizationId: input.buyerOrganizationId,
    installedInstanceId: `installed-${input.mod.customSceneId}-${input.buyerOrganizationId}`,
  });

  let ledgerEntryId: string | null = null;
  if (input.mod.royaltyPolicyId && input.salePrice != null) {
    const policy = getRoyaltyPolicy(input.mod.royaltyPolicyId);
    if (policy) {
      const split = computeRoyaltySplit({
        policy,
        salePrice: input.salePrice,
        platformFeeRate: input.platformFeeRate ?? 0.15,
        creatorRoyaltyRate: input.creatorRoyaltyRate ?? 0.3,
      });
      const entry = createRoyaltyLedgerEntry({
        policy,
        listingId: `listing-${input.mod.customSceneId}`,
        licenseId: license.licenseId,
        buyerOrganizationId: input.buyerOrganizationId,
        salePrice: input.salePrice,
        platformFee: split.platformFee,
        creatorRoyaltyAmount: split.creatorRoyaltyAmount,
      });
      ledgerEntryId = entry.ledgerId;
    }
  }

  return {
    ok: true,
    plan: {
      modId: input.mod.customSceneId,
      buyerOrganizationId: input.buyerOrganizationId,
      basePackId: input.buyerBasePackId,
      neutralPackageId: neutralPkg.packageId,
      reuseCertifiedBlueprint: true,
      reuseNeutralAssets: true,
      chargeCreditsFor: [
        'buyer-specific-founder-render',
        'buyer-branding',
        'changed-materials',
        'changed-lighting',
        'compatibility-repairs',
      ],
      lineageRecord: lineage,
      licenseId: license.licenseId,
      ledgerEntryId,
    },
  };
}

const MOD_COMPATIBLE_PACKS: Record<string, string[]> = {
  'build-a-wig-atelier': ['official-hair-brand', 'official-hair-salon'],
  'hair-analysis-lab': ['official-hair-brand'],
  'transformation-suite': ['official-hair-salon'],
};

function assertCompatibleBasePack(
  pack: IndustryPack,
  mod: FounderCreatedModRecord
): { ok: true } | { ok: false; code: string; message: string } {
  const allowed = MOD_COMPATIBLE_PACKS[mod.customSceneId] ?? [mod.sourceIndustryPackId];
  if (!allowed.includes(pack.packId)) {
    return {
      ok: false,
      code: 'INCOMPATIBLE_BASE_PACK',
      message: `Mod ${mod.customSceneId} requires compatible base pack: ${allowed.join(' or ')}.`,
    };
  }
  return { ok: true };
}
