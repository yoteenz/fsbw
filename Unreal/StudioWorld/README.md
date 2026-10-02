# Studio World — Canonical Unreal Project (FSBW)

**Owner:** Studio World / Resident Life / UE runtime  
**Not:** SITE00 creation pipelines (those stay reference-only)

## Maps

| Map | Purpose |
|-----|---------|
| `Content/StudioWorld/Maps/ETtaTestSandbox` | Etta embodiment QA only (face, hair, cloth, anim, locomotion) |
| `Content/StudioWorld/Maps/SW_VerticalSlice_01` | Greybox vertical slice (plaza, company shell, atrium, cafe, residential edge, Etta home, understudio access) |

Create both maps in Unreal Editor after opening `StudioWorld.uproject`. This repo ships **scaffold + automation**, not binary `.umap` until migrated from SITE00 control.

## Data layers (reserve in World Partition)

- `DL_SW_PUBLIC_REALM`
- `DL_SW_COMPANY_001`
- `DL_SW_RESIDENTIAL_001`
- `DL_SW_ETTA_HOME`
- `DL_SW_INTERIORS`
- `DL_SW_UNDERSTUDIO`
- `DL_SW_DEBUG`
- `DL_SW_FUTURE_PROPERTIES`

## Operator stack

See `docs/studio-world/STUDIO_WORLD_UE_COMPOSER_OPERATOR.md`.

## SITE00 control reference

Fill `site00-external-control-manifest.template.json` with local paths — **never commit absolute founder paths** if they contain usernames; use local-only copy.
