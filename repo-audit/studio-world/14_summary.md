# Studio World — Executive Summary

**Audit:** Read-only architectural inventory  
**Location:** `repo-audit/studio-world/`  
**Host:** Frontal Slayer monorepo (Vite SPA + Vercel `api/`)  
**Subsystem:** Studio World / Studio OS — organization HQ, Genesis, Experience Lab, governed AI, CDS, institute  

---

## Overall architectural maturity

Studio World presents as a **large, spec-driven platform** with **broad UI surface area** (~262 admin studio pages, ~3,177 files in `studio-os-core`) mounted inside the Frontal Slayer app. **Documentation and route registry maturity exceed** uniform backend depth across departments. The **production-critical spine** (Experience Lab + World Compiler + governed generation + Creative Direction Studio) has **substantial implementation** (APIs, migrations, bundled server) but **documented verification gates** (`KNOWN_BLOCKERS.md`) prevent treating validation runtime as fully restored.

Maturity pattern: **“platform cathedral”** — many rooms, shared chrome (layout, orb, immersion), centralized core for Genesis/scene-stack/generation, **per-module completion varies**.

---

## Biggest strengths

1. **Centralized domain core** (`studio-os-core`) separating genesis, scene-stack, registries, and institute from page shells.  
2. **Governed generation infrastructure** — job table, worker, gateway, pre-bundled server, asset registry schema.  
3. **Canonical world modeling** — route registry, department generator schema, environment package pipeline.  
4. **Rich documentation** — `docs/studio-os`, capsules, STUDIO_OS_BIBLE, master-spec.  
5. **Clear admin URL namespaces** — `/admin/studio` vs `/admin/studio-os` vs workspace guards.  
6. **Operational handoff discipline** — Context capsule + KNOWN_BLOCKERS as authority over UI labels.

---

## Biggest risks

1. **Surface area vs verified depth** — hundreds of demo-tagged modules vs blockers on core validation path.  
2. **Dual generation stacks** — Frontal Slayer customer FAL paths vs Studio governed pipeline (documented parity gap).  
3. **Parallel Experience Lab versions** — v1/v2/v3 and test routes increase continuity risk for redesign.  
4. **Legacy + world path dual navigation** — migration statuses (`immersive-partial`) incomplete.  
5. **Serverless bundle dependency** — creative production relies on committed bundle artifact.  
6. **Monolithic deploy coupling** — Studio and FS ship together; blast radius shared.  
7. **Platform Governance spec** not mapped 1:1 to a single route/module.

---

## Major architectural observations

- Studio World is **in-repo platform code**, not a separate deployable service today.  
- **Workspace tenancy** (`workspaces/*`, `studio_os_*` tables) models FS as one org among potential workspaces.  
- **Registries** (navigation, world routes, manifest reconciliation) are first-class and should be preserved in any redesign methodology.  
- **Immersive HQ UX** (orb, immersion shell) wraps many **standard-room** backends.  
- **Database migrations (202607*)** form a coherent Studio schema layer independent of customer commerce tables.

---

## Questions before redesign (no answers proposed here)

1. Which modules are **in scope** for the first production pipeline tranche vs archival/demo rooms?  
2. Is **Experience Lab v3** the sole validation target, and what is the retirement plan for v1/v2 routes?  
3. What is the **single source of truth** for module status: nav registry, master-spec, or blockers doc?  
4. Should **world canonical paths** fully replace legacy slugs before pipeline investment?  
5. What **founder-verified checklist** closes B1-Layer1, B1-E2E, B1-Parity, B1-FounderRender?  
6. Does redesign **split deploy** Studio OS from FS or remain monolith?  
7. How should **Platform Governance (M212)** map to executable modules?  
8. Which **AI/agent** surfaces are product vs spec-only (AI employee system)?  
9. What is the **minimum camera/set** equivalent for Studio World (analogous to SET-001)—one department, one lab, or full HQ?  
10. How are **duplicate canonical department tables** reconciled in operations?

---

## Deliverables in this folder

| File | Contents |
| --- | --- |
| `01_architecture.md` | High-level architecture |
| `02_folder_tree.md` | Studio folders |
| `03_routes.md` | Routes inventory |
| `04_components.md` | Components |
| `05_systems.md` | Systems |
| `06_data_flow.md` | Data flow |
| `07_database.md` | Database |
| `08_agents.md` | AI/agents |
| `09_state_management.md` | State |
| `10_assets.md` | Assets |
| `11_dependencies.md` | Dependencies |
| `12_technical_debt.md` | Debt (observed) |
| `13_completion_report.md` | Completion estimates |
| `14_summary.md` | This summary |

**Separation addendum (Founder directive):**

| File | Contents |
| --- | --- |
| `15_system_boundary.md` | SW/FS classification per system |
| `16_separation_dependency_map.md` | Cross-boundary dependencies + severity |
| `17_studio_world_ownership_inventory.md` | Future independent ownership checklist |
| `18_data_separation_inventory.md` | Data classification |
| `19_identity_and_auth_boundary.md` | Auth/session boundary |
| `20_infrastructure_boundary.md` | Shared infra |
| `21_visual_identity_boundary.md` | Visual inheritance |
| `22_separation_risk_register.md` | Detachment risks |
| `23_independent_readiness_scorecard.md` | Readiness scores + **final separation conclusion** |

**No application code was modified** during this audit.

---

## Canon references (read-only)

- `StudioOS_ContextCapsule_v0.1/CURRENT_HANDOFF.md`  
- `StudioOS_ContextCapsule_v0.1/KNOWN_BLOCKERS.md`  
- `motherboard/CODEBASE.md` (Studio sections)  
- `docs/studio-os/` · `STUDIO_OS_BIBLE/`
