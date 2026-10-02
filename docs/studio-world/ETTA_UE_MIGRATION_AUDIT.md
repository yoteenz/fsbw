# Etta UE Migration Audit — Bootstrap1

**Sprint:** `P0.STUDIOWORLD.UE-COMPOSER-OPERATOR.MIGRATION-BOOTSTRAP1`  
**Date:** 2026-10-02  
**Policy:** SITE00 control preserved · FSBW becomes canonical active home · no blind file moves

---

## Executive finding

| Question | Result |
|----------|--------|
| Is there a `.uproject` in **yoteenz/SITE00** (clone at `/home/ubuntu/SITE00`)? | **NO** — `find` returned zero `.uproject` / `.uplugin` / `DefaultEngine.ini` |
| Is there a `.uproject` in **yoteenz/fsbw** before this sprint? | **NO** |
| Is “Etta Vale” named in SITE00 git? | **NO** literal `Etta` / `SW-RESIDENT-001` in SITE00 source (false positives on `setTab`, `AssetTarget`) |
| Where is Etta canon today? | **FSBW** `src/studio-os-core/studio-world-residents/` — embodiment `NOT_STARTED`, `ue_metahuman` target with empty `referenceLinks` |
| Where is SITE00 character calibration logic? | **TypeScript pipelines** under `shared/site00-studio-world-production/` (embodied character discovery, visual casting, founder crop intelligence) — **2D/reference reconstruction**, not UE map assets in repo |

**Inference (founder-confirmed intent, not git fact):** The **active Etta Unreal test** likely lives on a **founder workstation** (local UE project, MetaHuman/Fab assets, possibly synced outside git). This audit **cannot enumerate disk paths** until the founder registers them in `Unreal/StudioWorld/site00-external-control-manifest.template.json`.

---

## SITE00 in-repo components (reference only)

| Component | Source path | Role | Classification |
|-----------|-------------|------|----------------|
| Embodied character discovery | `SITE00/shared/site00-studio-world-production/embodiedCharacterDiscovery/` | Psychology, voice, style hypothesis for brand characters | **LEAVE_IN_SITE00_REFERENCE_ONLY** — connect via contracts, do not duplicate |
| Character visual casting | `SITE00/shared/site00-studio-world-production/characterVisualCasting/` | Truth snapshots, casting constants (`unreal hair` string in constants) | **CONNECT_TO_SITE00** |
| Founder crop / slot contracts | `.../founderCropIntelligence/` | 2D asset slot QA | **LEAVE_IN_SITE00_REFERENCE_ONLY** |
| P0 VR twin compile | `.../visualReconstruction/p0vrTwinV30R8M2R4/` | Mobile/web twin — **not UE** | **LEAVE_IN_SITE00_REFERENCE_ONLY** |
| NDX embodied discovery types | `site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/` | Lore/discovery runs | **CONNECT_TO_SITE00** |

**Do not delete or modify SITE00 production branches** per sprint policy.

---

## FSBW target layout (created this sprint)

```
Unreal/StudioWorld/
├── StudioWorld.uproject          # Canonical UE project root (new)
├── README.md
├── Config/                       # Engine/project config templates
├── Content/
│   StudioWorld/
│   ├── Maps/
│   │   ├── ETtaTestSandbox       # Dedicated Etta QA (create in editor)
│   │   └── SW_VerticalSlice_01   # Greybox slice (create in editor)
│   ├── Residents/
│   │   └── Etta/                 # MetaHuman + BP target path
│   └── Automation/
├── Scripts/StudioWorld/          # Python editor automation
└── site00-external-control-manifest.template.json
```

---

## Migration classification matrix

| Asset / system | SITE00 source | FSBW target | Classification | Risk | Action | Verification |
|----------------|---------------|-------------|----------------|------|--------|--------------|
| `.uproject` | **Not in git** | `Unreal/StudioWorld/StudioWorld.uproject` | **REBUILD_IN_FSBW** | Medium | Founder copies local SITE00 uproject **or** adopts FSBW scaffold | Open project in UE; same engine version |
| ETtaTestSandbox map | **External** | `Content/StudioWorld/Maps/ETtaTestSandbox` | **MIGRATE_WITH_PATH_FIX** | High | Import `.umap` + fix redirectors | Side-by-side screenshot vs SITE00 control |
| Etta MetaHuman | **External / Fab** | `Content/StudioWorld/Residents/Etta/` | **SHARED_EXTERNAL_ASSET** | High | Re-link MetaHuman DNA; no appearance change | Face/hair/cloth parity checklist |
| Animations / control rig | **External** | Same folder | **MIGRATE_AS_IS** | Medium | Content migration | Locomotion + idle in PIE |
| Blueprints (character) | **External** | `BP_Etta_Resident` (name TBD) | **MIGRATE_WITH_PATH_FIX** | Medium | Reparent to FSBW game mode | PIE + debug script |
| Game mode / input | **External** | `Config/` + BP | **MIGRATE_WITH_PATH_FIX** | Low | Enhanced Input mapping | WASD walk test |
| Plugins (MetaHuman, etc.) | **External** | `.uproject` plugins | **MIGRATE_AS_IS** | High | Match UE version | Editor loads |
| Python automation | N/A | `Scripts/StudioWorld/*.py` | **REBUILD_IN_FSBW** | Low | Composer operator stack | Run from UE output log |
| Resident canon (identity) | Already FSBW | `studio-world-residents/` | **KEEP** | None | Link `referenceLinks` when paths known | Domain tests |
| SITE00 TS calibration | SITE00 shared | FSBW docs + manifest | **LEAVE_IN_SITE00_REFERENCE_ONLY** | None | Document handoff | Read-only |

---

## Parity verification checklist (post-migration)

Run on **founder UE machine** — not verifiable in Cursor Cloud VM.

- [ ] Face fidelity vs SITE00 control capture
- [ ] Hair groom / simulation
- [ ] Clothing materials
- [ ] Body proportions
- [ ] Default lighting rig
- [ ] Third-person camera
- [ ] Locomotion + idle
- [ ] Blueprint compile clean
- [ ] Project settings (Lumen, Nanite, WP) documented

**Status at Bootstrap1 end:** **BLOCKED** — no external control project path registered; no Editor on agent VM.

---

## Blockers requiring founder input

1. **Absolute path** to SITE00 Etta `.uproject` on founder PC (fill manifest template).
2. **UE engine version** (5.3 / 5.4 / 5.5) used for calibration.
3. Whether MetaHuman is **local** or **cloud** pipeline.
4. Git LFS / binary policy for committing `.uasset` (recommend Git LFS + selective commit).

---

## Next migration sprint (recommended)

1. Founder registers control project in manifest + optional encrypted path note (local only).
2. Composer imports content into FSBW `Unreal/StudioWorld` with path fix pass.
3. Run parity checklist; freeze SITE00 UE as read-only snapshot (zip + checksum in artifacts).
