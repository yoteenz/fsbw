# World Fabrication Engine V1 — Repository Discovery + Reuse Report

**Sprint:** `P0.STUDIOOS.WORLD-FABRICATION-ENGINE.V1-PRODUCTION-CONTRACT-AND-PIPELINE-FOUNDATION1`  
**Date:** 2026-10-08

## Summary

World Fabrication Engine V1 is implemented as **`src/studio-os-core/world-fabrication-engine/`** extending existing Studio OS production primitives — **not** a parallel product or new public surface.

## Systems reused

| Area | Existing module / docs | Reuse in WFE V1 |
|------|------------------------|-----------------|
| Production governance | `src/studio-os-core/production-governance/` | Cost caps, org isolation, usage ledger alignment (`mapProductionBudgetToFabricationCap`) |
| Governed async jobs | `src/studio-os-core/creative-production/governed-generation-job.ts` | Pattern reference for job lifecycle (WFE uses domain-specific manifest + stages) |
| Asset intelligence | `docs/studio-os/engines/studio-asset-registry/` | Lineage tiers map to registry artifact plane; binary refs not embedded in intelligence records |
| Asset compiler | `docs/studio-os/engines/studio-asset-compiler/` | Provider abstraction + modular GLB doctrine |
| SDK asset standard | `docs/studio-os/sdk/06_ASSET_STANDARD.md` | Anti-flattened-scene rules |
| Studio World governance | `docs/studio-os/STUDIO_WORLD_PRODUCTION_GOVERNANCE.md` | Operator ≠ billing owner; append-only usage |
| SITE 00 | `src/site00/`, `docs/site00/` | BLDR → WORLD commercial path; Build Object POC represented in example manifest |
| Astréa context | `astra-context/`, `docs` in MEMORY | Threshold test spec — implementation lives primarily in SITE00 repo |
| Studio World residents | `src/studio-os-core/studio-world-residents/` | Character fabrication **separate** from spatial world fabrication (no canon changes) |
| NDXBOOK production | `src/studio-os-core/ndxbook/` | Optional `ndxbookProductionId` on `WorldProjectRef` |

## Not found in fsbw (verified)

- Dedicated `world-fabrication-engine` module (created in this sprint)
- In-repo Artlist/Rodin execution adapters (massing adapter is contract-only)
- Astréa runtime TypeScript under `src/` (external SITE00)
- Shadow PC / Blender / Unreal remote execution hooks (capability flags only)

## Workspace integration (no UI changes)

Placement is **documented** only — no eighth nav tab, no shell redesign:

| Workspace area | WFE concern |
|----------------|-------------|
| DESIGN | Visual authority + reference views |
| EXPERIENCE | Worlds, zones, fabrication progress |
| LIBRARY | Sources, masters, exports, lineage |
| INBOX | Founder approval gates |
| ACTIVITY | Stage transitions + lineage events |
| HUB | Job status summaries |

## Database

**No new Supabase tables** in this sprint — manifests, lineage, and budgets are typed in-memory/JSON contracts ready for persistence via existing governance + future migrations.
