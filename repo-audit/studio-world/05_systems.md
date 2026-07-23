# Studio World — Systems Inventory

For each system: **purpose**, **implementation location**, **dependencies**, **completion level** (observed UI/nav/runtime only), **technical health** (from code presence + KNOWN_BLOCKERS, not fixes).

---

## Platform shell

| System | Purpose | Implementation | Dependencies | Completion | Health |
| --- | --- | --- | --- | --- | --- |
| **Organization HQ router** | Mount 262+ department pages | `App.tsx`, `pages/admin/studio/` | Guards, WorkspaceProvider | High (routes exist) | Stable routing; large surface |
| **Studio Administration** | Portfolio control plane | `studio-os/*`, `application/routes.ts` | Owner guard | Medium | Functional paths |
| **Workspace tenancy** | Org config + state | `workspaces/*`, `WorkspaceProvider`, `studio-workspace-state` API | Supabase | Medium | Cloud sync present |
| **Studio navigation registry** | Module metadata, breadcrumbs | `adminStudioNavigation.ts` | Core module ids | High | UI-only registry |
| **World route registry** | Legacy ↔ `/world/*` mapping | `studio-world/route-registry.ts` | Types in `studio-world/types` | Partial | Migration statuses vary (`immersive-partial`, `standard-room`) |
| **Studio boot / suspense** | Load sequencing | `studio-boot/` | Lazy pages | Medium | Boot gate for Experience Lab |
| **Immersion + Orb** | HQ presence UX | `immersion/`, `studio-orb/` | Global experience provider | Demo-heavy | UI rich; backend varies |

---

## Genesis & experience

| System | Purpose | Implementation | Dependencies | Completion | Health |
| --- | --- | --- | --- | --- | --- |
| **Genesis™** | Source kernel, object model | `studio-os-core/genesis/` + UI `genesis/` | Docs `docs/studio-os/genesis*` | Medium–high (nav: live) | Large codebase |
| **Experience Engine** | Experience definition/compile input | `genesis/experience-engine/` | Genesis | Medium | Core logic present |
| **Experience Runtime** | Assemble/run experiences | `genesis/experience-runtime/` | Scene assemblers | Medium | Runtime boot validators |
| **Experience Lab** | Validation UI + creative studio | `features/studio-world/experience-lab-v2|v3`, `components/admin/studio/experience-lab/`, route `/experience-lab*` | World compiler, generation APIs | Medium | **Blockers:** B1-Layer1, B1-E2E (KNOWN_BLOCKERS) |
| **Narrative Intelligence** | Campaign/episode generators | `genesis/narrative-intelligence/` | Genesis pipelines | Medium | Engine files + seeds |
| **Live Validation System** | Founder validation metrics | `genesis/live-validation-system/` | Persistence layer | Medium | Dashboard engines |
| **Founder Acceptance Testing (FAT)** | Graduation/evidence tests | `genesis/founder-acceptance-testing/` | FAT persistence | Medium | Test engines present |
| **Experience Lab render runtime** | Client render path | `experience-lab-runtime/` (per CODEBASE) | Compiler output | Medium | Tied to compiler investigations |

---

## Scene Stack & World Compiler

| System | Purpose | Implementation | Dependencies | Completion | Health |
| --- | --- | --- | --- | --- | --- |
| **Scene Stack** | Scene composition pipeline | `studio-os-core/scene-stack/` | Genesis, assets | Medium | Active development |
| **World Compiler** | Compile world/scenes | `scene-stack/world-compiler/` | Diagnostics | Medium | Debug route `/__world-compiler-investigation` |
| **Asset compiler** | Asset compilation | `asset-compiler/` | Registry | Lower–medium | Supporting |

---

## Creative Direction Studio (CDS)

| System | Purpose | Implementation | Dependencies | Completion | Health |
| --- | --- | --- | --- | --- | --- |
| **CDS** | Company creative direction workspace | `studio-os-core/creative-direction-studio/`, `components/admin/studio-os/creative-direction-studio/` | Scene Stack viewport, stack auth API | Medium | Authorization via `creative-studio-stack-authorization` |
| **NDXbook** | Newsroom/production UI | `ndxbook-*` components, routes | CDS | Demo–medium | UI modules |
| **Company routes** | Per-company HQ | `company-routes/`, `companies/:slug/*` | Workspace | Medium | Shell present |

---

## AI & generation

| System | Purpose | Implementation | Dependencies | Completion | Health |
| --- | --- | --- | --- | --- | --- |
| **Governed generation jobs** | Async image/asset jobs | `studio_governed_generation_jobs`, `async-governed-generation.ts` | FAL, Supabase | Medium | B0 cleared; parity issues B1-Parity |
| **Generation gateway** | Central server gateway | `generation-gateway.ts`, `studio-os-server.bundle.js` | Pre-bundled server | Medium | Bundle repair shipped |
| **Studio Builder** | Layer 1 landmark generation | `api/admin/studio-builder-generate.ts`, `studioBuilderGeneration.ts` | FAL NBP edit | Medium | Used by Experience Lab |
| **Studio Foundry** | Foundry pipeline | `studio-foundry-generate.ts` | Gateway | Lower–medium | API exists |
| **Studio generate asset** | Asset generation entry | `studio-generate-asset.ts` | Registry | Medium | |
| **Model orchestrator UI** | Model selection UI | `pages/admin/studio/model-orchestrator/` | APIs | Demo–medium | |
| **Creative intelligence** | Decisions + learning | `studio_creative_intelligence_*` tables, API | Generation | Lower–medium | DB + API |
| **Founder render jobs** | Full-room photoreal preview | `studio_founder_render_jobs`, founder-render APIs | FAL, B1-FounderRender | Medium | Verify pending |
| **Canonical department generator** | Department blueprints/renders | `canonical-department-generation.ts`, `studio_world_canonical_departments*` | Canonical world | Medium | Schema extensive |
| **Environment packages** | Environment asset packages for CDS | `studio_environment_*`, `environment-package-*` APIs | Worker, promote | Medium | Pipeline tables |

---

## Content, campaign, production (UI modules)

| System | Purpose | Implementation | Completion | Health |
| --- | --- | --- | --- | --- |
| **Creative Director** | Creative direction dept UI | pages + components | Demo–medium | UI |
| **Content brain / packs** | Content planning | pages + `AdminStudioContent*` | Demo | UI |
| **AI production engine** | Run monitor UI | `AdminStudioAiProduction*` | Demo | UI |
| **Show bible / shows / lot / casting** | Production dept cards | pages + cards | Demo | UI |
| **Distribution / publishing** | Channels + queue | pages + social API | Medium (DB for social) | Social tables live |
| **Prompt library / registry** | Prompt management | pages + core registries | Medium | |

---

## Knowledge, research, planning

| System | Purpose | Implementation | Completion | Health |
| --- | --- | --- | --- | --- |
| **Studio Institute** | Invites, learning | `studio-institute/`, public pages, APIs | Medium | Invites table |
| **Expert capture** | Interview capture | `expert-capture/`, `api/expert-capture/*` | Medium | |
| **Knowledge vault** | Trust vault mirror | `expert-capture/trust-vault/` | Medium | Docs + core |
| **Context capsule export** | Export for external AI | `context-capsule-export/`, API `context-capsule.ts` | Medium | |
| **Knowledge registries** | Documentation/knowledge UI | routes `knowledge-registry`, `memory-bible` | Demo–medium | UI |
| **World knowledge engine** | Route + page | `world-knowledge-engine/` | Demo | UI |

---

## Governance, QA, platform registries

| System | Purpose | Implementation | Completion | Health |
| --- | --- | --- | --- | --- |
| **Headquarters principles / governance** | Constitutional UI | routes + core modules | Live (nav) | UI |
| **Platform Governance (M212)** | Spec in `docs/studio-os/master-spec/` | **No dedicated route** `platform-governance`; closest UI: governance, documentation-governance | Spec > UI | Doc-led |
| **QA / immune UI** | qa-headquarters, self-healing, regression | pages | Demo | UI |
| **System/component/asset registries** | Registry browsers | pages + `asset-registry` core | Medium | Asset registry DB live |
| **Policy / permission / event-bus engines** | Platform policy UI | pages + core stubs/engines | Mixed | Varies per module |

---

## Assets & brand (Studio)

| System | Purpose | Implementation | Completion | Health |
| --- | --- | --- | --- | --- |
| **Asset registry** | Canonical assets | DB + `studio-asset-registry.ts` API | Medium–high | Tables + API |
| **Studio World icons** | Icon system / parity | `features/studio-world/icons/`, icon QA routes | Medium | Generated JSON parity file |
| **Brand architect / design DNA** | Brand tooling in Studio | `brand-architect/`, `design-dna-canon` module | Demo–medium | Overlaps FS brand docs conceptually |

---

## Hidden / infrastructure modules

| System | Path | Notes |
| --- | --- | --- |
| **Manifest reconciliation** | `manifest-reconciliation/` | Compares manifest bundles |
| **Architecture law 001** | `architecture-law-001/`, `studio_department_ui_sockets` | UI socket schema |
| **Boot registry** | `boot-registry/` | Boot metadata |
| **Diagnostic flight recorder** | `src/studio-os/diagnostics/` | Black box entries |

---

## Completion level legend (this audit)

| Label | Meaning |
| --- | --- |
| **High** | Routes + core + DB/API consistently present |
| **Medium** | Partial backend or verify-pending blockers |
| **Demo** | Nav status `demo` or placeholder-heavy UI |
| **Lower** | API or schema only, thin UI |

Technical health cites **KNOWN_BLOCKERS** for Experience Lab / generation—not a performance audit.
