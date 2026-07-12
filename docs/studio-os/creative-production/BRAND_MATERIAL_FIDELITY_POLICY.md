# Brand Material Fidelity Policy™

**Version:** `brand-material-fidelity.v1`  
**Pipeline stage:** After structure validation, before approval

## Purpose

Prevent attractive generic marble from silently replacing the organization's approved marble texture.

## Verdicts

| Verdict | May approve? |
|---------|--------------|
| `exact-brand-material-pass` | Yes |
| `acceptable-brand-material-interpretation` | Yes |
| `generic-material-substitution` | **No** |
| `wrong-brand-material` | **No** |
| `missing-required-material` | **No** |
| `low-confidence-material-match` | **No** |

## Evidence recorded

- `requiredBrandAssetIds`
- `materialSlots` / `materialMappings`
- `suppliedReferenceChecksums`
- `genericSubstitutionLikelihood`
- `wrongMarbleLikelihood`
- `finalMaterialVerdict`

## Regeneration

Material fidelity failure → regenerate with stronger grounding (max 2 provider attempts per verified pipeline policy).

## Qualification fixture

Circular crystal concierge reception desk:

- Exact Frontal Slayer marble (`primary-marble-texture`)
- Clear crystal acrylic, mirror-polished chrome
- Subtle `#EB1C24` illumination
- NB2 route with material-only references

Implementation: `brand-asset-grounding/fixtures.ts`
