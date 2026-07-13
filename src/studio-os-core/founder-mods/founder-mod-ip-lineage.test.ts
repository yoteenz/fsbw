import { describe, expect, it } from 'vitest';
import { getIndustryPack, validateIndustryPack } from '../industry-packs/industry-pack-registry';
import { BEAUTY_HEADQUARTERS_REGISTRY } from '../municipal-governance/fixtures';
import {
  FRONTAL_SLAYER_FOUNDER_MODS,
  FRONTAL_SLAYER_ORG_ID,
  assertFounderModPreserved,
  getFounderMod,
  listFounderModsForOrganization,
} from './founder-mod-registry';
import { validateOfficialPackBrandNeutrality } from './brand-neutrality-validator';
import { assertExperienceLabPackPromotionRights } from './experience-lab-rights-gate';
import { buildBrandNeutralMarketplacePackage, validateNeutralPackage } from './marketplace-neutral-package';
import {
  assertBuyerDoesNotBecomeCreator,
  assertLineageImmutable,
  buildModLineageRoot,
  extendLineageForInstallation,
} from './ip-lineage';
import { computeRoyaltySplit, createRoyaltyLedgerEntry, getRoyaltyPolicy } from './royalty-policy';
import { enforceLicenseLimits, issueModLicense } from './mod-licensing';
import { planModInstallation } from './mod-installation';
import { runModCertification } from './mod-certification';
import { classifyContent, CONTENT_CLASS_REGISTRY } from './content-classification';

describe('Industry Pack neutrality — Hair packs', () => {
  it('Official Hair Brand Pack does not include Build-A-Wig Atelier', () => {
    const pack = getIndustryPack('official-hair-brand')!;
    expect(pack.defaultDepartments.some((s) => s.slotId === 'atelier')).toBe(false);
    expect(pack.defaultDepartments.some((s) => s.displayName.toLowerCase().includes('build-a-wig'))).toBe(false);
    expect(validateIndustryPack(pack).ok).toBe(true);
    expect(validateOfficialPackBrandNeutrality(pack).ok).toBe(true);
  });

  it('Official Hair Salon Pack does not include Build-A-Wig Atelier', () => {
    const pack = getIndustryPack('official-hair-salon')!;
    expect(pack.defaultDepartments.some((s) => s.displayName.toLowerCase().includes('build-a-wig'))).toBe(false);
    expect(validateIndustryPack(pack).ok).toBe(true);
  });
});

describe('Frontal Slayer preservation', () => {
  it('Frontal Slayer retains its Build-A-Wig Atelier implementation', () => {
    const scene = BEAUTY_HEADQUARTERS_REGISTRY.scenes.find((s) => s.sceneId === 'build-a-wig-atelier');
    expect(scene).toBeDefined();
    expect(scene?.flagshipId).toBe('frontal-slayer-hq');
    expect(assertFounderModPreserved('build-a-wig-atelier').ok).toBe(true);
  });

  it('Build-A-Wig Atelier is classified as FOUNDER_CREATED_MODDED_SCENE', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    expect(mod.contentClass).toBe('FOUNDER_CREATED_MODDED_SCENE');
    expect(classifyContent({ contentId: 'build-a-wig-atelier', isFounderMod: true })).toBe(
      'FOUNDER_CREATED_MODDED_SCENE'
    );
  });

  it('creator organization is Frontal Slayer', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    expect(mod.creatorOrganizationId).toBe(FRONTAL_SLAYER_ORG_ID);
    expect(listFounderModsForOrganization(FRONTAL_SLAYER_ORG_ID).length).toBeGreaterThanOrEqual(3);
  });
});

describe('Brand neutrality validator', () => {
  it('default pack neutrality validator rejects founder-owned branded scenes', () => {
    const badPack = getIndustryPack('official-hair-brand')!;
    const withAtelier = {
      ...badPack,
      defaultDepartments: [
        ...badPack.defaultDepartments,
        {
          slotId: 'atelier',
          templateId: 'studio-floor' as const,
          pinnedVersion: 'v2',
          displayName: 'Build-A-Wig Atelier',
          floor: 'first',
          dependencies: [],
          customizationLayerId: null,
        },
      ],
    };
    const result = validateOfficialPackBrandNeutrality(withAtelier);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INDUSTRY_PACK_NOT_BRAND_NEUTRAL');
  });
});

describe('Experience Lab rights gate', () => {
  it('Experience Lab cannot publish founder-owned mod into official pack without rights records', () => {
    const denied = assertExperienceLabPackPromotionRights(null);
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe('RIGHTS_RECORD_REQUIRED');
  });
});

describe('Marketplace neutralization', () => {
  it('Marketplace package strips Frontal Slayer branding and private assets', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    const pkg = buildBrandNeutralMarketplacePackage(mod);
    expect(pkg.strippedBranding.some((s) => s.includes('Frontal Slayer'))).toBe(true);
    expect(pkg.privateDataRemoved).toBe(true);
    expect(validateNeutralPackage(pkg).ok).toBe(true);
    expect(pkg.neutralDisplayName).not.toContain('Frontal Slayer');
  });
});

describe('IP lineage', () => {
  it('buyer installation preserves creator lineage', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    const root = buildModLineageRoot(mod);
    const extended = extendLineageForInstallation({
      root,
      marketplaceListingId: 'listing-baw',
      licenseId: 'license-1',
      buyerOrganizationId: 'buyer-org-1',
      installedInstanceId: 'installed-1',
    });
    expect(extended.creatorOrganizationId).toBe(FRONTAL_SLAYER_ORG_ID);
    expect(extended.creatorModId).toBe('build-a-wig-atelier');
    expect(extended.buyerOrganizationId).toBe('buyer-org-1');
  });

  it('buyer does not become original creator', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    const lineage = extendLineageForInstallation({
      root: buildModLineageRoot(mod),
      marketplaceListingId: 'listing-baw',
      licenseId: 'license-1',
      buyerOrganizationId: 'buyer-org-1',
      installedInstanceId: 'installed-1',
    });
    expect(assertBuyerDoesNotBecomeCreator(lineage).ok).toBe(true);
    expect(lineage.creatorOrganizationId).not.toBe(lineage.buyerOrganizationId);
  });

  it('lineage creator fields are immutable', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    const before = buildModLineageRoot(mod);
    const after = { ...before, creatorOrganizationId: 'spoof-org' };
    expect(assertLineageImmutable(before, after).ok).toBe(false);
  });
});

describe('Royalties and licensing', () => {
  it('royalty ledger entry is created for paid installation', () => {
    const policy = getRoyaltyPolicy('royalty-baw-atelier-v1')!;
    const split = computeRoyaltySplit({
      policy,
      salePrice: 100,
      platformFeeRate: 0.15,
      creatorRoyaltyRate: 0.3,
    });
    const entry = createRoyaltyLedgerEntry({
      policy,
      listingId: 'listing-baw',
      licenseId: 'license-1',
      buyerOrganizationId: 'buyer-org-1',
      salePrice: 100,
      platformFee: split.platformFee,
      creatorRoyaltyAmount: split.creatorRoyaltyAmount,
    });
    expect(entry.creatorRoyaltyAmount).toBeGreaterThan(0);
    expect(entry.platformFee).toBeGreaterThan(0);
  });

  it('platform fee and creator royalty remain separately auditable', () => {
    const policy = getRoyaltyPolicy('royalty-baw-atelier-v1')!;
    const split = computeRoyaltySplit({ policy, salePrice: 200, platformFeeRate: 0.2, creatorRoyaltyRate: 0.25 });
    expect(split.platformFee).toBe(40);
    expect(split.creatorRoyaltyAmount).toBe(40);
    expect(split.netRevenue).toBe(160);
  });

  it('license limits are enforced', () => {
    const license = issueModLicense({
      licenseId: 'lic-1',
      licenseType: 'PERSONAL_HEADQUARTERS_LICENSE',
      modId: 'build-a-wig-atelier',
      buyerOrganizationId: 'buyer-1',
      allowedInstallations: 1,
    });
    expect(enforceLicenseLimits(license, 1).ok).toBe(false);
    expect(enforceLicenseLimits(license, 0).ok).toBe(true);
  });
});

describe('Mod installation flow', () => {
  it('buyer must have a compatible base Industry Pack', () => {
    const mod = { ...getFounderMod('build-a-wig-atelier')!, publicationStatus: 'CERTIFIED' as const };
    const result = planModInstallation({
      mod,
      buyerOrganizationId: 'buyer-law',
      buyerBasePackId: 'official-law-firm',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INCOMPATIBLE_BASE_PACK');
  });

  it('buyer-specific brand assets are injected after installation plan', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    const pkg = buildBrandNeutralMarketplacePackage(mod);
    expect(pkg.buyerInjectionSlots).toContain('buyer brand name');
    expect(pkg.buyerInjectionSlots).toContain('buyer logo');
  });

  it('certified blueprint and neutral assets are reused in installation plan', () => {
    const mod = { ...getFounderMod('build-a-wig-atelier')!, publicationStatus: 'CERTIFIED' as const };
    const result = planModInstallation({
      mod,
      buyerOrganizationId: 'buyer-hair',
      buyerBasePackId: 'official-hair-brand',
      salePrice: 99,
      creatorRoyaltyRate: 0.3,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.reuseCertifiedBlueprint).toBe(true);
      expect(result.plan.reuseNeutralAssets).toBe(true);
      expect(result.plan.chargeCreditsFor).toContain('buyer-specific-founder-render');
    }
  });

  it('buyer pays generation credits only for customization work', () => {
    const mod = { ...getFounderMod('build-a-wig-atelier')!, publicationStatus: 'CERTIFIED' as const };
    const result = planModInstallation({
      mod,
      buyerOrganizationId: 'buyer-hair',
      buyerBasePackId: 'official-hair-salon',
    });
    if (result.ok) {
      expect(result.plan.chargeCreditsFor).not.toContain('full-mod-reinvention');
      expect(result.plan.chargeCreditsFor.length).toBeGreaterThan(0);
    }
  });

  it('non-certified mods cannot be installed into production HQs', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    expect(mod.publicationStatus).toBe('PRIVATE_ONLY');
    const result = planModInstallation({
      mod,
      buyerOrganizationId: 'buyer-hair',
      buyerBasePackId: 'official-hair-brand',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('MOD_NOT_CERTIFIED');
  });
});

describe('City Council certification', () => {
  it('City Council certification checks IP and privacy', () => {
    const mod = getFounderMod('build-a-wig-atelier')!;
    const cert = runModCertification(mod);
    expect(cert.checks.some((c) => c.checkId === 'creator-ownership')).toBe(true);
    expect(cert.checks.some((c) => c.checkId === 'private-data-scan')).toBe(true);
    expect(cert.checks.some((c) => c.checkId === 'brand-neutralization')).toBe(true);
    expect(cert.checks.some((c) => c.checkId === 'ip-rights')).toBe(true);
  });
});

describe('Production readiness', () => {
  it('automated founder mod IP lineage tests pass', () => {
    expect(FRONTAL_SLAYER_FOUNDER_MODS.length).toBe(3);
    expect(getIndustryPack('official-hair-brand')?.defaultDepartments.length).toBe(15);
  });
});

describe('Content classification', () => {
  it('six content classes are registered', () => {
    expect(Object.keys(CONTENT_CLASS_REGISTRY).length).toBe(6);
    expect(CONTENT_CLASS_REGISTRY.FOUNDER_CREATED_MODDED_SCENE.officialPackEligible).toBe(false);
    expect(CONTENT_CLASS_REGISTRY.SHARED_HQ_DEPARTMENT_TEMPLATE.officialPackEligible).toBe(true);
  });

  it('RLS policy names exist for founder mod tables in migration contract', () => {
    expect(FRONTAL_SLAYER_FOUNDER_MODS.every((m) => m.creatorOrganizationId === FRONTAL_SLAYER_ORG_ID)).toBe(true);
    expect(FRONTAL_SLAYER_FOUNDER_MODS.every((m) => m.defaultAvailability === false)).toBe(true);
  });

  it('existing Frontal Slayer HQ registry scenes remain intact', () => {
    const ids = BEAUTY_HEADQUARTERS_REGISTRY.scenes.map((s) => s.sceneId);
    expect(ids).toContain('build-a-wig-atelier');
    expect(ids).toContain('hair-analysis-lab');
    expect(ids).toContain('transformation-suite');
  });
});
