# World Fabrication — Asset Lineage V1

**Module:** `src/studio-os-core/world-fabrication-engine/lineage.ts`

## Tier hierarchy

```
ORIGINAL_REFERENCE
  → AI_MASSING_SOURCE
    → FABRICATION_SOURCE
      → APPROVED_MASTER
        → RUNTIME_EXPORT
```

Rules:

- Never overwrite `ORIGINAL_REFERENCE` files in place.
- Exported GLB is not a substitute for editable Blender source.
- Each transform records input/output asset IDs, tool/agent, config hash fields, validation, approval, supersession.

Example chain (Build Object POC):

Approved reference → Artlist massing P01 → Blender reconstruction V1/V2 → approved master → web export.
