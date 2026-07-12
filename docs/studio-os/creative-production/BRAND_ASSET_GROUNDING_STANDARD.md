# Brand Asset Grounding Standard™

**Version:** `brand-asset-grounding.v1`

## Principle

The contractor creates the object. The organization supplies the identity.

Generated assets must use **approved organization materials** — never invented generic substitutes when a canonical brand asset exists.

## Contract

`src/studio-os-core/creative-production/brand-asset-grounding/contract.ts`

Minimum fields per brand asset:

- `organizationId`, `assetRole`, `assetId`, `canonicalUrl`, `checksum`
- `approvedForGeneration`, `referenceStrengthPolicy`, `materialScale`

## Supported roles

- `primary-marble-texture` (Frontal Slayer: `/assets/marble-half.png`)
- `chrome-finish-reference`, `acrylic-finish-reference`
- `color-palette` (Frontal Slayer Red `#EB1C24`)
- logo, monogram, wordmark, fabric, wood, stone, pattern references

## Material resolution

Before dispatch:

```
requestedMaterial → resolvedBrandAssetId → referenceUrl + promptInstruction
```

Required material missing → `BRAND_ASSET_REQUIRED_MISSING` (generation blocked).

## Reference policy

| Allowed | Prohibited |
|---------|------------|
| material-reference | forbidden-scene-reference |
| logo-reference | full room / shell screenshot |
| color-reference | cross-organization assets |
| form-reference (non-environment) | generic marble fallback |

## Organization isolation

- Resolve by `organizationId` only
- No global marble fallback for org-specific materials
- Cross-org references blocked with `CROSS_ORG_BRAND_LEAK`

## Prompt standard (v3)

Isolated prompts include:

1. Asset identity
2. Organization material assignments
3. Exact brand-asset references
4. Forbidden material substitutions

See `ISOLATED_ASSET_PROMPT_STANDARD.md`.
