# Material Library (Director Mode)

Centralized material inheritance. Objects reference materials; they never duplicate them.

## Organization materials (Frontal Slayer — Documented Fact)

| Material ID | Display name | Canonical source |
|-------------|--------------|------------------|
| `founder-marble` | Founder Marble | `/assets/marble-half.png` |
| `founder-glass` | Founder Glass | Organization library |
| `founder-chrome` | Founder Chrome | Organization library |
| `founder-crystal` | Founder Crystal | Organization library |
| `founder-white-acrylic` | Founder White Acrylic | Organization library |
| `founder-red-illumination` | Founder Red Illumination | `#EB1C24` |

## Planned library extensions

| Material | Domain |
|----------|--------|
| Founder Fabric | Merchandise, upholstery |
| Founder Lighting | Lighting profiles (not invented colors) |
| Founder Typography | Brand Studio text objects |
| Founder Color System | Palette tokens |
| Founder Photography | Reference photo sets |
| Founder Textures | Approved texture library |

## Inheritance model

```
Organization Material Library
    ↓ referenced by
Directable Object.materialRefs[]
    ↓ applied by
Material Worker (no AI invention)
    ↓ validated by
Organization Material Lock + Immune System
```

## Rules (Director Constitution Article VI)

- Objects reference `materialId` — never embed texture data
- AI workers receive material IDs in Render Intent — not "marble" or "stone"
- Generic material substitution triggers Immune System rebuild
- Material version bumps propagate via Change Propagation

## Cross-references

- Material Library Spec (v2): `docs/studio-os/studio-world-architecture-v2/MATERIAL_LIBRARY_SPEC.md`
- Organization Material Lock: `docs/studio-os/manufacturing-engine/ORGANIZATION_MATERIAL_LOCK.md`
- Brand Asset Grounding: `docs/studio-os/creative-production/BRAND_ASSET_GROUNDING_STANDARD.md`
