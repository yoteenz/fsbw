import type { CreatorRoyaltyPolicy, RoyaltyLedgerEntry } from './contract';

/** Configurable royalty policies — no hardcoded platform percentages in runtime. */
export const CREATOR_ROYALTY_POLICIES: CreatorRoyaltyPolicy[] = [
  {
    royaltyPolicyId: 'royalty-baw-atelier-v1',
    creatorOrganizationId: 'frontal-slayer',
    listingId: 'listing-baw-atelier-v1',
    creatorRoyaltyType: 'percentage',
    creatorRoyaltyRate: null,
    fixedCreatorAmount: null,
    netRevenueBasis: 'sale_price_minus_platform_fee',
    currency: 'USD',
    effectiveFrom: '2026-07-13T00:00:00.000Z',
    effectiveUntil: null,
    refundTreatment: 'clawback_creator_share',
    promotionalDiscountTreatment: 'proportional',
    affiliateTreatment: 'separate_from_creator_royalty',
    taxTreatment: 'founder_configured',
  },
];

export function getRoyaltyPolicy(policyId: string): CreatorRoyaltyPolicy | undefined {
  return CREATOR_ROYALTY_POLICIES.find((p) => p.royaltyPolicyId === policyId);
}

export function computeRoyaltySplit(input: {
  policy: CreatorRoyaltyPolicy;
  salePrice: number;
  platformFeeRate: number;
  creatorRoyaltyRate: number;
}): { platformFee: number; creatorRoyaltyAmount: number; netRevenue: number } {
  const platformFee = Math.round(input.salePrice * input.platformFeeRate * 100) / 100;
  const netRevenue = input.salePrice - platformFee;
  const creatorRoyaltyAmount =
    input.policy.creatorRoyaltyType === 'fixed' && input.policy.fixedCreatorAmount != null
      ? input.policy.fixedCreatorAmount
      : Math.round(netRevenue * input.creatorRoyaltyRate * 100) / 100;
  return { platformFee, creatorRoyaltyAmount, netRevenue };
}

export function createRoyaltyLedgerEntry(input: {
  policy: CreatorRoyaltyPolicy;
  listingId: string;
  licenseId: string;
  buyerOrganizationId: string;
  salePrice: number;
  platformFee: number;
  creatorRoyaltyAmount: number;
}): RoyaltyLedgerEntry {
  return {
    ledgerId: `ledger-${input.licenseId}-${Date.now()}`,
    royaltyPolicyId: input.policy.royaltyPolicyId,
    listingId: input.listingId,
    licenseId: input.licenseId,
    buyerOrganizationId: input.buyerOrganizationId,
    salePrice: input.salePrice,
    platformFee: input.platformFee,
    creatorRoyaltyAmount: input.creatorRoyaltyAmount,
    currency: input.policy.currency,
    payoutStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
}
