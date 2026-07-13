# Founder Mod IP Lineage

**Version:** `founder-mods.v1`

## Immutable lineage chain

```
Studio World Industry Pack
→ Founder Pack Instance
→ Founder Customization
→ Founder-Created Mod
→ Certified Marketplace Listing
→ Buyer-Licensed Instance
```

**Never rewrite lineage** when a buyer installs a mod. The buyer owns their licensed instance per license terms but does **not** become the original creator.

## Required fields

| Field | Purpose |
|-------|---------|
| `rootTemplateId` | Source Industry Pack |
| `creatorOrganizationId` | Original creator (immutable) |
| `creatorModId` | Founder mod scene ID |
| `marketplaceListingId` | Certified listing when published |
| `licenseId` | Buyer license |
| `buyerOrganizationId` | Installing founder |
| `installedInstanceId` | Buyer workspace instance |
| `attributionRequired` | Marketplace attribution |
| `royaltyObligation` | Royalty-bearing when configured |

## Build-A-Wig Atelier™

- **Classification:** `FOUNDER_CREATED_MODDED_SCENE`
- **Creator:** Frontal Slayer (`frontal-slayer`)
- **Base pack:** `official-hair-brand` (compatible with `official-hair-salon`)
- **Default availability:** false

## Module

`src/studio-os-core/founder-mods/ip-lineage.ts`
