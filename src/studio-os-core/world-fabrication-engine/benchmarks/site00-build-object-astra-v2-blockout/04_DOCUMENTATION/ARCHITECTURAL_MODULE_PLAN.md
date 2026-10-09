# Architectural module plan — build hierarchy

**Version:** `SITE00_BUILD_OBJECT_ASTRA_V2_BLOCKOUT`  
**Parent lineage:** Astra V1 preserved at `../site00-build-object-astra-v1` (read-only for glass shader notes only).

## Collection / module order (bpy)

1. **MARBLE_PLINTH** — single solid base; correct footprint before vertical build.
2. **PRIMARY_STRUCTURE** — left marble fin + central core massing (asymmetric).
3. **RED_PORTAL** — see `RED_PORTAL_PLAN.md` (interlocking planes).
4. **GLASS_VOLUMES** — see `GLASS_VOLUME_PLAN.md` (distinct boxes, not one wrapper).
5. **FLOOR_PLATES** — horizontal slabs tied to visible reference levels.
6. **INTERIOR_OPENINGS** — arches + passages (see interior plan).
7. **STRUCTURAL_SUPPORTS** — minimal white columns/partitions with spatial purpose.
8. **CAMERAS** — perspective set per camera plan.
9. **DIAGNOSTIC_MATERIALS** — flat colors / simple transparency only (no final marble polish in Stage 01).

## Explicit exclusions (Stage 01)

- Photoreal human meshes in hero renders.
- Final Cycles material polish (reuse V1 glass **later**).
- GLB optimization / web export (optional stub only if assignment extended).

## Success criteria

Founder can rotate inspection cameras and recognize **the same asymmetric massing** as the reference — not a symmetric pavilion.
