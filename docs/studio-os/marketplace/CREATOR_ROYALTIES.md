# Creator Royalties

**Version:** `creator-royalties.v1`

## Configurable policy

Royalty rates are **not hardcoded** in runtime. Policies are stored in `creator_royalty_policies` and referenced by `royaltyPolicyId`.

## Policy fields

- `creatorRoyaltyType` — percentage · fixed · hybrid
- `creatorRoyaltyRate` — founder-configured (null until approved)
- `fixedCreatorAmount`
- `netRevenueBasis` — sale_price_minus_platform_fee
- `refundTreatment` · `promotionalDiscountTreatment` · `affiliateTreatment`

## Ledger

Every paid installation creates a `creator_royalty_ledger` entry with separately auditable:

- `salePrice`
- `platformFee`
- `creatorRoyaltyAmount`
- `payoutStatus`

## Build-A-Wig Atelier

Policy ID: `royalty-baw-atelier-v1` — royalty rate configured by founder approval, not platform default.

## Module

`src/studio-os-core/founder-mods/royalty-policy.ts`
