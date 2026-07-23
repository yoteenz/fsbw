# Studio World — Technical Debt (Observed)

**Audit rule:** Describe only. No fixes, no recommendations.

---

## Duplicate / parallel systems

| Observation | Evidence |
| --- | --- |
| **Experience Lab v1, v2, v3** | Separate routes and `features/studio-world/experience-lab-v2|v3` plus legacy `experience-lab/` components |
| **Mission control vs command center vs overview** | Multiple entry URLs; world registry maps legacy slugs |
| **Atlas paths** | `world-atlas`, `atlas`, world registry aliases |
| **studio-os-core mirrors UI departments** | Many similarly named folders in core and `components/admin/studio` |
| **Genesis docs** | `genesis/` repo root + `docs/studio-os/genesis*` + `studio-os-core/genesis` |

---

## Legacy implementations

| Observation | Evidence |
| --- | --- |
| **Legacy nav group** | `STUDIO_NAV_GROUPS` includes `legacy` |
| **`legacy-system` route** | Dedicated page |
| **Legacy paths in route registry** | `legacyPath`, `formerFeatureName` fields |
| **`/admin/studio/hub`** | Legacy hub route |
| **Procedural founder render** | Blockers doc: prior CSS procedural hero replaced by AI jobs—code paths may coexist in drawer vs review |

---

## Dead code / unreachable (signals only)

| Signal | Notes |
| --- | --- |
| 312 routes vs nav subset | Routes exist without featured nav entries |
| Placeholder shells | Modules using `AdminStudioPlaceholderShell` |
| No import graph run | Dead code not proven; routes still mount |

---

## Placeholder logic

| Signal | Location |
| --- | --- |
| `AdminStudioPlaceholderShell` | Shared component |
| Nav `status: 'demo'` | Static demo metrics on cards |
| `coming-soon` type | Declared in navigation types |
| `AdminStudioModulePageShell` with sparse backends | Many `*-engine` rooms |

---

## Temporary architecture

| Observation | Evidence |
| --- | --- |
| **Pre-bundled server** | `studio-os-server.bundle.js` workaround for serverless import traces (B0) |
| **Debug entry split** | `entry-dispatch` + `StudioDebugRoutes` separate from main App |
| **World path resolver** | Dual legacy + `/world/*` canonical during migration |
| **Immersion partial** | `migrationStatus: 'immersive-partial'` in route registry |

---

## TODOs / FIXMEs (counts)

| Area | Observation |
| --- | --- |
| `src/studio-os-core` | Many files; inline TODO/FIXME not exhaustively counted in this audit |
| `src/components/admin/studio` | Placeholder/demo strings in multiple workspaces |

Not individually catalogued in this audit.

---

## Unfinished features (documented authority)

From `StudioOS_ContextCapsule_v0.1/KNOWN_BLOCKERS.md` (status as of 2026-07-14 in file):

| ID | Topic |
| --- | --- |
| B1-Layer1 / B1-E2E-Completion | Experience Lab validation not declared restored without founder device proof |
| B1-FounderRender | Verify pending on mobile photoreal preview |
| B1-Parity | FS vs Studio OS generation divergence repair verify pending |
| (Additional blockers in same file below read limit) | Gate rules for CDS/Experience Lab narrative |

---

## Architectural inconsistencies

| Observation | Evidence |
| --- | --- |
| **Platform Governance spec vs routes** | M212 in master-spec; UI scattered across governance routes |
| **Demo vs live labels vs backend** | Nav `demo` modules still backed by real APIs in some cases |
| **Single repo, two generation stacks** | FS synchronous FAL vs Studio async governed pipeline (forensics doc cited in blockers) |
| **Scale mismatch** | 262 pages vs depth of backend for each module varies |
| **Spatial canon vs UI** | STUDIO_OS_BIBLE spatial rules vs hundreds of standard/demo rooms |

---

## Duplicate data models

| Observation | Tables |
| --- | --- |
| Canonical departments | `studio_canonical_departments` vs `studio_world_canonical_departments` (related migrations, different generators) |

---

## Security / ops debt (observational)

| Item | Note |
| --- | --- |
| Debug routes public | `/__studio-*`, `/studio-institute/*` on debug router—environment dependent |
| Service role workers | Workers use elevated DB access (by design) |

No penetration test performed.
