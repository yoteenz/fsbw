# Creative Direction Studio™ — Migration Audit

**Authority:** Genesis §9B.28, `genesis/articles/CREATIVE_DIRECTION_STUDIO.md`  
**Status:** Binding migration audit (post-approval)  
**Scope:** Every current implementation touching creative, campaign, asset, content,
social, marketing, email, advertising, design, or production generation.

This document is the constitutional migration report. It does not redesign
architecture. It maps current code to approved owners, violations, and required
migrations.

---

## 1. Executive summary

Studio OS has **strong constitutional skeletons** (Narrative Intelligence,
Studio Production System, Asset Compiler recipes, Supabase Asset Registry) but
**weak runtime enforcement**. Most image/video/email/social generation routes
bypass the approved production graph and write to parallel local registries.

### Constitutional production graph (target)

```text
Creative Direction Studio™
  -> Creative Operating System™
  -> Narrative Intelligence™
  -> Studio Production System™
  -> Foundry / Asset Compiler™
  -> Asset Registry™
  -> Delivery (Content Engine™ / Experience Engine™ / Runtime)
```

### Top P0 violations

| # | Violation | Primary locations |
|---|---|---|
| 1 | Direct FAL generation without Production Package authorization | `api/admin/studio-builder-generate.ts`, `api/admin/studio-generate-asset.ts`, `api/admin/studio-foundry-generate.ts`, customer FAL routes |
| 2 | Auto-approve + auto-register generated assets | `src/hooks/useSceneStack.ts` |
| 3 | CIE approval gates computed but not enforced | `api/_lib/creativeIntelligenceEngine/`, `api/admin/studio-builder-generate.ts` |
| 4 | Multiple asset truth stores | M140 registry, Studio Builder registry, Foundry registry, Product Asset Factory registry, Supabase registry |
| 5 | Standalone memory/wisdom stores (forbidden by Organizational Memory) | `memory-engine/`, `wisdom-capture/`, Creative OS creative-memory |
| 6 | Publishing bypasses Content Engine approval | `api/admin/newsletter-send.ts`, partial social pack gate in `api/admin/social-posts.ts` |
| 7 | Disabled service facades vs active APIs (dual integration layer) | `src/services/studio/*` vs `api/*` |

---

## 2. Per-system migration ledger

Legend:

- **Current owner:** what the code effectively owns today
- **Future owner:** Genesis §9B.28 owner after migration
- **Deprecated:** responsibilities to remove or demote to projection/facility
- **Missing:** responsibilities not yet implemented
- **Violations:** constitutional conflicts
- **Duplicate:** overlaps another owner

### 2.1 Creative Direction Studio™

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/creative-direction-studio/`, `src/components/admin/studio-os/creative-direction-studio/`, `src/pages/admin/studio/ndxbook/creative-direction/`, `docs/studio-os/creative-direction-studio/` |
| **Current owner** | Local project/concept/pipeline state; inspiration analysis; command engine; Future Tournament; founder notes bridge |
| **Future owner** | Creative Direction Studio — initiative workspace, direction alternatives, orchestration plan, review state, production status projection only |
| **Deprecated** | Any asset generation, approval, registry, or publishing implied by Scene Stack integration |
| **Missing** | Typed `CreativeInitiative` record; genome/brand/narrative/design-canon version pins; rights/budget/proof constraints; Production Package handoff; source/adaptation/independent lineage |
| **Violations** | Scene Stack beneath CDS auto-approves and registers assets (`useSceneStack.ts`) |
| **Duplicate** | Local creative pipeline store overlaps Studio Production package state |

### 2.2 Creative Operating System™

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/genesis/creative-operating-system/`, `genesis/articles/CREATIVE_OPERATING_SYSTEM.md` |
| **Current owner** | Executive board, council, governance, evolution, creative memory, economy registry |
| **Future owner** | Creative Operating System — initiative governance and creative council decisions |
| **Deprecated** | Standalone creative memory persistence; economy records as asset identity |
| **Missing** | Learning Ledger projection adapter; Asset Registry ID references in economy entries |
| **Violations** | `creative-memory-engine.ts` and `creative-economy-registry.ts` create parallel stores |
| **Duplicate** | Creative memory duplicates Organizational Memory; economy IDs duplicate Asset Registry |

### 2.3 Narrative Intelligence™

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/genesis/narrative-intelligence/`, `genesis/articles/NARRATIVE_INTELLIGENCE.md` |
| **Current owner** | Narrative Blueprint, Production Genome, campaign/launch/commercial/course/episode generators; production gate (client-side) |
| **Future owner** | Narrative Intelligence — narrative truth, Production Genome, briefs |
| **Deprecated** | Any rendering, media generation, or publication behavior |
| **Missing** | Server-enforced production authorization token; mandatory linkage from all material generation APIs |
| **Violations** | Generators labeled "content generation" in places; gates not consumed by FAL APIs |
| **Duplicate** | Campaign structure overlaps Campaign Engine local store (should be projection) |

### 2.4 Studio Production System™

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/genesis/studio-production-system/`, `genesis/articles/STUDIO_PRODUCTION_SYSTEM.md` |
| **Current owner** | Production packages, departments, gates, QC, asset checklist, distribution engine (local) |
| **Future owner** | Studio Production System — packages, schedule, dependencies, gates, QC |
| **Deprecated** | Local distribution engine as publishing owner; duplicate creative memory writes |
| **Missing** | Signed/immutable `ProductionAuthorization` consumed by generation APIs; canonical Asset Registry IDs on checklist items |
| **Violations** | Gates exist but generation APIs ignore them; `approveGate` lacks actor/authority provenance |
| **Duplicate** | Distribution engine overlaps Content Engine; AI Production Engine demo overlaps gate model |

### 2.5 Creative Intelligence Engine (CIE)

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/creative-intelligence-engine/`, `api/_lib/creativeIntelligenceEngine/`, `api/admin/studio-creative-intelligence.ts` |
| **Current owner** | Reuse/generation strategy, provider/model selection, cost estimate, advisory gates |
| **Future owner** | Studio Intelligence Layer — recommendation and gate *proposal* only |
| **Deprecated** | `forceGenerate`, `skipCie` as production bypass flags |
| **Missing** | Enforced gate satisfaction before Builder/Foundry execution |
| **Violations** | CIE decision treated as authorization; gates advisory only |
| **Duplicate** | Overlaps Creative Director decision package and Studio Production approval engine |

### 2.6 Creative Director (service)

| Field | Detail |
|---|---|
| **Paths** | `src/services/studio/creativeDirector/` |
| **Current owner** | Demo decision package, prompt assembly, quality gate (disabled service) |
| **Future owner** | **Production role** under Studio Production System — not a constitutional system |
| **Deprecated** | "Master prompt" as authoritative source; separate system positioning |
| **Missing** | Narrative/Production Package binding; versioned Brand/Product/Design inputs |
| **Violations** | Naming collision with Creative Direction Studio; approval treats draft as pass |
| **Duplicate** | Overlaps CIE and Narrative Intelligence |

### 2.7 Scene Stack / Studio Builder

| Field | Detail |
|---|---|
| **Paths** | `src/hooks/useSceneStack.ts`, `src/studio-os-core/studio-builder/`, `api/admin/studio-builder-generate.ts`, `api/_lib/studioBuilderGeneration.ts` |
| **Current owner** | Layer planning, prompt compile, direct FAL generation, local queue, local registry, deferred Supabase sync |
| **Future owner** | **Facility** under Foundry/Asset Compiler for exploratory drafts; material path through Production graph |
| **Deprecated** | Auto-approve; auto-validate; local registry as truth; `forceGenerate` on material regen |
| **Missing** | Non-canonical draft classification; human approval before registry; Production Authorization |
| **Violations** | **P0:** bypasses entire production graph for material assets |
| **Duplicate** | Local registry vs Supabase Asset Registry |

### 2.8 Studio Foundry / Asset Compiler

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/studio-foundry/`, `src/studio-os-core/asset-compiler/`, `src/studio/foundry/`, `api/admin/studio-foundry-generate.ts` |
| **Current owner** | Recipe resolution, manufacturing plan, hero-icon-only client execution, local registry |
| **Future owner** | Foundry/Asset Compiler — manufacturing only, post-authorization |
| **Deprecated** | Local registry; hardcoded hero-icon project; ignored recipe model |
| **Missing** | General recipe execution; canonical registry transaction; cost receipt from provider |
| **Violations** | API ignores compiled model; no Production Package check |
| **Duplicate** | Local Foundry registry vs Supabase registry |

### 2.9 Asset Registry / Asset Director

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/asset-registry/`, `api/_lib/assetRegistry/`, `api/admin/studio-asset-registry.ts`, `src/services/studio/assetDirector/` |
| **Current owner** | Supabase CRUD (canonical service); M140 local view; Builder local store; Asset Director disabled catalog |
| **Future owner** | Asset Registry — sole durable asset identity, provenance, rights, versions |
| **Deprecated** | Asset Director "visual source of truth" language; all local write-capable registries |
| **Missing** | Single ID contract; atomic upload+register; reconciliation queue; rights/approval required fields |
| **Violations** | Four+ parallel registries; silent deferred registration |
| **Duplicate** | M140, Builder, Foundry, Product Factory registries |

### 2.10 Content Brain / Content Engine

| Field | Detail |
|---|---|
| **Paths** | `src/utils/adminStudioContentBrainDemo.ts`, `src/pages/admin/studio/content-brain/`, consumer mappings in genesis SIL |
| **Current owner** | Local demo brand brain, editorial rules, campaign frameworks (disabled service) |
| **Future owner** | Content Engine — adaptation, editorial lifecycle, publishing, repurposing |
| **Deprecated** | "Single source of truth for AI generation"; local copies of Brand/Product/Narrative |
| **Missing** | Real implementation; master/derivative records; server publishing integration |
| **Violations** | Duplicates Brand DNA, Product DNA, Narrative truth |
| **Duplicate** | Distribution Engine, Campaign Engine, Content Brain all claim publishing/adaptation |

### 2.11 Campaign Engine / Campaign Orchestrator

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/campaign-engine/`, `src/services/studio/campaignEngine/`, `campaignOrchestrator/`, Narrative `campaign-generator.ts` |
| **Current owner** | Local campaign/deliverable state; launch wizard; `autoPublishEnabled` |
| **Future owner** | Narrative Intelligence (structure) + Studio Production (execution) + Content Engine (derivatives) |
| **Deprecated** | Direct publication authority; independent scheduling/publishing |
| **Missing** | Blueprint/Package IDs; master/derivative lineage |
| **Violations** | `autoPublishEnabled` bypasses approval |
| **Duplicate** | Overlaps Narrative campaign generator and Distribution Engine |

### 2.12 Distribution Engine / Network

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/distribution-engine/`, `src/services/studio/distributionEngine/`, `distributionNetwork/` |
| **Current owner** | Local adaptations, calendar, performance, lineage (disabled) |
| **Future owner** | Content Engine (adaptation/publishing); Workflow Engine (execution) |
| **Deprecated** | Constitutional engine ownership of publishing and learning |
| **Missing** | Content Engine contract; real connector execution; delivery receipts |
| **Violations** | Duplicates Content Engine and Organizational Memory |
| **Duplicate** | Content Engine, social API, newsletter API |

### 2.13 Master Content Pipeline / Content Expansion

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/content-pipeline/`, `docs/studio-os/master-content-pipeline.md` |
| **Current owner** | 17-stage legacy lifecycle mapped to 10 gates (documentation + local state) |
| **Future owner** | Studio Production System (gates) + Content Engine (expansion) |
| **Deprecated** | "Canonical 17-stage" terminology; Content Expansion as separate engine |
| **Missing** | Derivative generation engine; per-derivative approval |
| **Violations** | Stage owners list facilities as constitutional peers |
| **Duplicate** | Overlaps Studio Production gates |

### 2.14 Creative Genome / Creative Knowledge Graph

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/genesis/studio-intelligence-layer/engines/creative-knowledge-graph.ts`, SIL types/registries |
| **Current owner** | Query/explore creative nodes (local Genesis registry) |
| **Future owner** | Creative Genome — relationship graph only |
| **Deprecated** | Asset payload or memory duplication |
| **Missing** | Ingestion from production outputs; `derived_from`, `approved_for`, `published_as` links |
| **Violations** | Disconnected from canonical pipelines |
| **Duplicate** | None if limited to relationships |

### 2.15 Design Genome / Design DNA Canon

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/design-genome/`, `src/services/studio/designGenomeModule/`, `designDnaCanonModule/` |
| **Current owner** | Local design patterns; founder phrase → current version |
| **Future owner** | Company Design Canon (company-specific); Creative Genome links |
| **Deprecated** | Auto-promotion to `current` without Canon Engine decision |
| **Missing** | Canon approval record; company/tenant scope; revalidation |
| **Violations** | Confuses Studio OS Design DNA with company Design Canon |
| **Duplicate** | Local store vs Brand/Experience Design DNA |

### 2.16 Memory Engine / Wisdom Capture / Creative Memory

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/memory-engine/`, `wisdom-capture/`, Creative OS `creative-memory-engine.ts` |
| **Current owner** | Standalone organizational memory, wisdom, creative archives |
| **Future owner** | Organizational Learning Ledger projection; Studio Intelligence recall |
| **Deprecated** | All standalone canonical memory stores |
| **Missing** | Learning Ledger adapter; evidence packages; governed acceptance |
| **Violations** | **P0:** forbidden by Organizational Memory §2.2 |
| **Duplicate** | Three parallel memory systems |

### 2.17 Production facilities (Warehouse, Builder, Director Mode, Render Queue, Screening Room, AI Production Engine)

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/studio-warehouse/`, `render-queue/`, `screening-room/`, `production-studio/`, related `src/services/studio/*` |
| **Current owner** | Local simulated jobs, reviews, queue progress (mostly disabled) |
| **Future owner** | **Facilities** under Studio Production System and Workflow Engine |
| **Deprecated** | Independent workflow/approval ownership |
| **Missing** | Shared Production Package ID; durable queue; immutable review provenance |
| **Violations** | Simulated state presented as operational truth |
| **Duplicate** | Parallel stage machines vs Studio Production gates |

### 2.18 Generation Manager / Generation Pipeline (docs only)

| Field | Detail |
|---|---|
| **Paths** | `docs/studio-os/engines/generation-manager/`, `generation-pipeline/` |
| **Current owner** | Specification only — not implemented |
| **Future owner** | Workflow/Studio Production facility coordinating approved Foundry jobs |
| **Deprecated** | Implied-operational status in diagrams |
| **Missing** | Queue table, worker, retries, cost ledger, estimate lock |
| **Violations** | Docs imply central queue exists; routes bypass it |
| **Duplicate** | N/A (not built) |

### 2.19 Product Photography / Product Asset Factory

| Field | Detail |
|---|---|
| **Paths** | `api/admin/product-asset-factory-run.ts`, `api/_lib/productAssetFactory/`, `src/services/studio/brandAssetsProductAssetFactory/` |
| **Current owner** | Locked photography rules, FAL generation, operator approval, derivatives, **local product registry** |
| **Future owner** | Specialist production service under Foundry; Asset Registry for outputs |
| **Deprecated** | Product-local registry as truth; boolean-only approval |
| **Missing** | Canonical Registry upsert; approval decision record; master/derivative graph links |
| **Violations** | Uploads without clear Supabase Asset Registry registration |
| **Duplicate** | Product registry vs Asset Registry |

### 2.20 Social publishing

| Field | Detail |
|---|---|
| **Paths** | `api/admin/social-posts.ts`, `api/_lib/socialPublish.ts` |
| **Current owner** | Draft/approve/schedule/publish to platforms |
| **Future owner** | Content Engine (publication authorization); Workflow Engine (execution) |
| **Deprecated** | Caller-supplied `packApproved` |
| **Missing** | Server-derived content-pack approval; Asset/derivative lineage |
| **Violations** | Content-pack gate fails open when omitted |
| **Duplicate** | Distribution Engine local publish state |

### 2.21 Email generation / newsletter

| Field | Detail |
|---|---|
| **Paths** | `api/admin/generate-email-hero.ts`, `api/admin/newsletter-send.ts`, `api/_lib/email/` |
| **Current owner** | FAL hero generation; manifest update; direct Resend bulk send |
| **Future owner** | Foundry (hero manufacture); Content Engine (email adaptation/publish); Asset Registry (hero identity) |
| **Deprecated** | Manifest as asset identity; arbitrary HTML newsletter send |
| **Missing** | Approved content asset ID; editorial/legal gates |
| **Violations** | **P0:** newsletter bypasses Content Engine and approval |
| **Duplicate** | Email hero manifest vs Asset Registry |

### 2.22 Customer-facing image generation (Build-a-Wig, try-on, consult)

| Field | Detail |
|---|---|
| **Paths** | `api/build-a-wig-unit-image.ts`, `api/live-try-on-*.ts`, `api/wig-preview/*`, consult/hairstyle analysis routes |
| **Current owner** | Direct FAL, Supabase storage, job persistence |
| **Future owner** | Experience Runtime (ephemeral customer artifacts); specialist generation under approved policy |
| **Deprecated** | Treating personal previews as canonical creative assets |
| **Missing** | Ephemeral vs canonical classification; privacy/retention contract; promotion-to-registry workflow |
| **Violations** | Outside production graph (acceptable for ephemeral if classified) |
| **Duplicate** | None if explicitly non-canonical |

### 2.23 Video generation (scripts)

| Field | Detail |
|---|---|
| **Paths** | `scripts/bcf/pregenerate-bcf-videos.mjs`, motion recipes in `asset-compiler/recipes.ts` |
| **Current owner** | Offline batch Kling generation; manifest only |
| **Future owner** | Specialist video production under Studio Production + Foundry |
| **Deprecated** | Manifest-only asset ownership |
| **Missing** | Durable queue; screening/QC; registry versions |
| **Violations** | No production authorization in batch scripts |
| **Duplicate** | N/A |

### 2.24 Batch/manufacturing scripts (FAL)

| Field | Detail |
|---|---|
| **Paths** | `scripts/pregenerate-wig-previews.mjs`, `generate-email-hero-assets.mjs`, `lobby-bake-*`, `lounge-bake-*`, etc. |
| **Current owner** | One-off direct FAL tools |
| **Future owner** | Approved Foundry CLI adapter only |
| **Deprecated** | Scripts as systems of record |
| **Missing** | Shared compiler plan input; registry ingestion; cost receipts |
| **Violations** | Bypass production graph |
| **Duplicate** | Manifests as registries |

### 2.25 Advertising / marketing generation

| Field | Detail |
|---|---|
| **Paths** | No dedicated engine; appears in CDS expression families, MediaKitRegistry, campaign/content data |
| **Current owner** | Fragmented across campaign, content, product photography metadata |
| **Future owner** | **No new engine** — Creative Direction (direction) + Narrative + Production + Content Engine (adaptation) |
| **Deprecated** | N/A |
| **Missing** | Paid-media derivative schema; claim/disclosure review; platform policy validation |
| **Violations** | None from absence (constitutionally correct) |
| **Duplicate** | Would duplicate Content Engine if added |

### 2.26 Production Orchestrator / Production Completion (software)

| Field | Detail |
|---|---|
| **Paths** | `src/studio-os-core/production-orchestrator/`, `production-completion-system/` |
| **Current owner** | **Software feature development** orchestration, not media production |
| **Future owner** | Workflow Engine / software delivery tooling — rename to avoid collision |
| **Deprecated** | "Production Package" naming for software handoffs |
| **Missing** | Clear separation from creative Production Package |
| **Violations** | Naming collision with Studio Production System |
| **Duplicate** | Confuses creative and software production |

---

## 3. Duplicate ownership map

| Truth class | Competing implementations | Canonical owner |
|---|---|---|
| Asset identity | M140, Builder, Foundry, Product Factory, Supabase | **Asset Registry™** (Supabase service) |
| Campaign structure | Campaign Engine store, Narrative campaign-generator, Content Brain frameworks | **Narrative Intelligence™** |
| Production gates | Studio Production, CIE gates, Content Pipeline 17-stage, AI Production demo, Scene Stack auto-approve | **Studio Production System™** |
| Publishing | Distribution Engine, Campaign autoPublish, social API, newsletter API | **Content Engine™** |
| Creative memory | Memory Engine, Wisdom Capture, Creative OS memory, Studio Production memory writes | **Organizational Learning Ledger™** (projection) |
| Creative relationships | Creative Genome (local), Creative Economy, Asset relationships | **Creative Genome™** (graph only) |
| Design canon | Design Genome local, Design DNA Canon module, Experience Design DNA | **Company Design Canon** + Experience inheritance |
| Generation queue | Generation Manager (docs), Render Queue (local), Builder queue, FAL routes direct | **Workflow + Studio Production facility** (Phase 4) |

---

## 4. Migration principles (non-negotiable)

1. **No new peer creative engines.** Channels (social, email, ads, packaging) bind to
   expression families and existing owners.
2. **One asset registry.** Supabase Asset Registry service is canonical; local stores
   become read caches or are removed.
3. **Production Authorization required** for every material generation endpoint.
4. **CIE gates enforced**, not advisory.
5. **Scene Stack drafts** must be explicitly `nonCanonical` until human approval.
6. **Publishing** flows through Content Engine authorization records.
7. **Memory** flows through Learning Ledger adapter; no standalone writes.
8. **Customer runtime outputs** classified ephemeral unless promoted through graph.
9. **Service facade layer** reconciled: `src/services/studio/*` becomes thin client
   over constitutional APIs, not parallel implementations.

---

## 5. Traceability checklist (every material output)

Every migrated pipeline must pin and persist:

- [ ] `companyGenomeId` + `companyGenomeVersion`
- [ ] `brandDnaId` + version
- [ ] `narrativeBlueprintId` / `productionGenomeId`
- [ ] `designCanonId` + version
- [ ] `productionPackageId` + `productionAuthorizationId`
- [ ] `expressionLineage` (source | adaptation | independent)
- [ ] `rightsRecordId` / license references
- [ ] `approvalRecords[]` (actor, authority, decision, timestamp)
- [ ] `assetRegistryId` (post-manufacture)
- [ ] `deliveryTarget` (content | experience | ephemeral-runtime)

See `PRODUCTION_GRAPH.md` for object schemas and graph edges.
