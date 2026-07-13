import type { FounderCreatedModRecord, FounderModPublicationStatus } from './contract';
import { getRoyaltyPolicy } from './royalty-policy';
import { buildBrandNeutralMarketplacePackage, validateNeutralPackage } from './marketplace-neutral-package';

export type ModCertificationCheck = {
  checkId: string;
  passed: boolean;
  note: string;
};

export type ModCertificationResult = {
  modId: string;
  outcome: FounderModPublicationStatus;
  checks: ModCertificationCheck[];
};

export function runModCertification(mod: FounderCreatedModRecord): ModCertificationResult {
  const checks: ModCertificationCheck[] = [
    { checkId: 'creator-ownership', passed: Boolean(mod.creatorOrganizationId), note: 'Creator ownership verified.' },
    { checkId: 'private-data-scan', passed: mod.privateStatus, note: 'Private data scan required before publish.' },
    {
      checkId: 'brand-neutralization',
      passed: validateNeutralPackage(buildBrandNeutralMarketplacePackage(mod)).ok,
      note: 'Brand-neutral marketplace package required.',
    },
    {
      checkId: 'royalty-policy',
      passed: !mod.royaltyPolicyId || Boolean(getRoyaltyPolicy(mod.royaltyPolicyId)),
      note: 'Royalty policy must be configured when royalty-bearing.',
    },
    { checkId: 'ip-rights', passed: mod.rightsRestrictions.length > 0, note: 'Rights restrictions documented.' },
    { checkId: 'dependency-audit', passed: Boolean(mod.sourceIndustryPackId), note: 'Compatible base pack lineage required.' },
  ];

  const failed = checks.filter((c) => !c.passed);
  let outcome: FounderModPublicationStatus = 'CERTIFIED';
  if (failed.some((c) => c.checkId === 'creator-ownership')) outcome = 'REJECTED';
  else if (failed.length > 0) outcome = 'REVISION_REQUIRED';
  else if (!mod.marketplaceEligibility) outcome = 'PRIVATE_ONLY';

  return { modId: mod.customSceneId, outcome, checks };
}
