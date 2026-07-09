# Creative Direction Studio™ — Implementation Roadmap

**Authority:** Genesis §9B.28  
**Status:** Binding migration plan  
**Principle:** Migrate architecture first; build pipelines incrementally.  
**Do not:** Create duplicate engines, new asset stores, or channel-specific systems.

---

## Roadmap summary

| Phase | Name | Outcome |
|---|---|---|
| **1** | Architecture migration | Contracts, gateway, deprecation, single registry policy |
| **2** | Production graph | Authorization flow wired end-to-end (one vertical slice) |
| **3** | Creative pipelines | Specialist disciplines behind Foundry |
| **4** | Asset compiler | Recipe fidelity, registry transactions, cost receipts |
| **5** | Campaign orchestration | Master/derivative Content Engine + Workflow scheduling |
| **6** | Founder-facing Creative Direction Studio™ | Universal initiative UI on production graph |

Each phase has **exit criteria** that must pass before the next phase starts.

---

## Phase 1 — Architecture migration

**Goal:** Stop constitutional bleeding. Establish contracts and a single
generation gateway without building all pipelines.

### 1.1 Deliverables

| # | Deliverable | Description |
|---|---|---|
| 1 | **Production graph types** | `CreativeInitiative`, `ProductionAuthorization`, `ExpressionLineage`, `AssetIntent`, `ManufacturingJob` — see `PRODUCTION_GRAPH.md` |
| 2 | **Generation gateway** | Single server module all material FAL/generation APIs must call; rejects requests without valid `productionAuthorizationId` |
| 3 | **Authorization verifier** | Validates signed authorization, expiry, scope, satisfied gates |
| 4 | **Registry policy** | Document + enforce: Supabase Asset Registry is sole write target; local registries become read-only caches or deleted |
| 5 | **Deprecation registry** | `docs/studio-os/creative-direction-studio/DEPRECATIONS.md` listing modules, forbidden behaviors, replacement owner |
| 6 | **Scene Stack hotfix** | Remove auto-approve/auto-register; mark outputs `nonCanonical` until explicit promotion |
| 7 | **CIE enforcement stub** | Builder/Foundry APIs reject when required CIE gates unsatisfied (no `skipCie` on material) |
| 8 | **Service facade alignment plan** | Map each `src/services/studio/*` to constitutional API client or mark deprecated |

### 1.2 Code touchpoints (minimal)

- Add: `src/studio-os-core/creative-production/` (types, authorization, graph facade)
- Add: `api/_lib/creativeProduction/generation-gateway.ts`
- Modify: `api/admin/studio-builder-generate.ts` — route through gateway
- Modify: `api/admin/studio-foundry-generate.ts` — route through gateway
- Modify: `api/admin/studio-generate-asset.ts` — route through gateway or mark admin-only ephemeral
- Modify: `src/hooks/useSceneStack.ts` — remove auto-approve/register
- Deprecate (read-only banners): local registries in Builder, Foundry, M140, Product Factory

### 1.3 Exit criteria

- [ ] No material generation API accepts requests without `productionAuthorizationId`
- [ ] Scene Stack cannot write `validated` or `approved` without promotion flow
- [ ] `skipCie` and `forceGenerate` removed or blocked on material endpoints
- [ ] Deprecation registry published and linked from Studio admin docs
- [ ] Migration audit (`MIGRATION_AUDIT.md`) referenced in `motherboard/CORE.md`

### 1.4 Duration note

Architecture-only; no new founder UI. One vertical authorization path may use
seed/demo authorization for development.

---

## Phase 2 — Production graph

**Goal:** One complete path from Initiative → Authorization → Foundry → Registry
works in dev and staging.

### 2.1 Deliverables

| # | Deliverable |
|---|---|
| 1 | **CreativeInitiative persistence** (server-backed, tenant-scoped) |
| 2 | **Narrative → Package → Authorization** server flow (not client-only gates) |
| 3 | **Signed ProductionAuthorization** issuance from Studio Production System |
| 4 | **Generation gateway** production-ready with audit log |
| 5 | **Registry transaction** — atomic upload + Asset Registry record |
| 6 | **Creative Genome ingestion** — link job → asset → initiative |

### 2.2 Vertical slice (reference)

**Hero icon generation** (existing Foundry POC):

```text
CreativeInitiative (demo)
  → Narrative Blueprint (seed)
  → Production Package (hero-icons)
  → ProductionAuthorization (signed)
  → AssetIntent (hero-icon recipe)
  → Foundry generate
  → Asset Registry record
  → Creative Genome link
```

### 2.3 Exit criteria

- [ ] End-to-end demo reproducible with pinned genome/brand versions
- [ ] Authorization cannot be forged client-side
- [ ] Failed registry write rolls back or queues for reconciliation
- [ ] Audit trail: authorization ID on every manufacturing job

---

## Phase 3 — Creative pipelines

**Goal:** Register production **disciplines** as Foundry recipe families and
specialist services—not new engines.

### 3.1 Pipeline registry

| Discipline | Current code | Migration |
|---|---|---|
| Static image / icon | Asset Compiler recipes, Studio Builder | Foundry + gateway |
| Product photography | Product Asset Factory API | Specialist service + Registry |
| Email hero | `generate-email-hero.ts` | Foundry recipe + Registry |
| Social derivative | Content Engine (to build) | Adaptation from MasterContent |
| Video / motion | BCF scripts, motion recipes | Specialist queue + Screening |
| Deck / print | None operational | New recipes + prepress gate |
| Experience compile | Experience Engine | Bind approved Asset Registry IDs |

### 3.2 Deliverables

- Pipeline catalog config (discipline → recipe → gate set → delivery target)
- Product Asset Factory migrated to canonical Registry (remove local registry)
- Email hero generation requires authorization + registry transaction
- Ephemeral customer routes classified (`runtime/ephemeral`) in gateway

### 3.3 Exit criteria

- [ ] Product photography POC writes only to Asset Registry
- [ ] Email hero path uses gateway + registry
- [ ] Customer FAL routes explicitly non-canonical with retention policy
- [ ] No new `*Engine` modules added for disciplines

---

## Phase 4 — Asset compiler

**Goal:** Compiler output is authoritative; executor honors provider/model;
cost and provenance are recorded.

### 4.1 Deliverables

| # | Deliverable |
|---|---|
| 1 | Recipe schema validation at API boundary |
| 2 | Foundry executor uses compiled provider/model (fix hero-icon mismatch) |
| 3 | `recipeVersionHash` on every job |
| 4 | Cost receipt from provider response |
| 5 | BuildReport with QC hints for Screening Room facility |
| 6 | Generation Manager queue (durable jobs, retries, idempotency) — **facility**, not peer engine |
| 7 | Budget/cost ledger integration (Assurance domain when ratified) |

### 4.2 Exit criteria

- [ ] Compiled model matches executed model (verified by test)
- [ ] Jobs survive serverless restart (durable queue table)
- [ ] Duplicate job submission is idempotent
- [ ] Every registered asset has provenance chain to authorization

---

## Phase 5 — Campaign orchestration

**Goal:** Campaigns, launches, and multi-touchpoint work as graph compositions
via Content Engine + Workflow — not Campaign Engine store.

### 5.1 Deliverables

| # | Deliverable |
|---|---|
| 1 | **MasterContent / DerivativeContent** server models |
| 2 | Content Engine publication authorization records |
| 3 | Social API: server-derived content-pack approval (fail closed) |
| 4 | Newsletter API: route through Content Engine (no arbitrary HTML send) |
| 5 | Workflow schedules for approved derivative publication |
| 6 | Campaign Engine local store → projection-only over Narrative + Content |
| 7 | Distribution Engine → deprecated; migrate UI to Content Engine views |

### 5.2 Expression coverage (incremental)

| Priority | Expression | Phase 5 milestone |
|---|---|---|
| P0 | Social post from approved derivative | Publish with lineage |
| P0 | Email campaign from approved master + heroes | Publication auth |
| P1 | Launch landing (Experience bind) | Master + Experience compile |
| P1 | Product launch bundle | Multi-derivative orchestration |
| P2 | Paid ads | Claim/legal gate + derivative |
| P2 | Investor deck | Executive family + legal gate |

### 5.3 Exit criteria

- [ ] No `autoPublishEnabled` bypass in campaign store
- [ ] Social `packApproved` fail-closed unless server verifies approved pack
- [ ] Newsletter requires `publicationAuthorizationId`
- [ ] Master → derivative lineage visible in Creative Genome

---

## Phase 6 — Founder-facing Creative Direction Studio™

**Goal:** Universal creative operating system UI for every onboarded company.

### 6.1 Deliverables

| # | Deliverable |
|---|---|
| 1 | **Initiative workspace** — create/direct/orchestrate/review from one surface |
| 2 | **Touchpoint planner** — source vs adaptation map across expression families |
| 3 | **Genome pin panel** — Company Genome, Brand DNA, Design Canon, Narrative/Production versions |
| 4 | **Production status** — live package/gate/job/registry state (read-only projections) |
| 5 | **Review & approval routing** — founder/delegated authority without self-approve |
| 6 | **Outcome learning** — link to Organizational Memory / Creative Genome (no local memory) |
| 7 | **Orb integration** — session-local briefing over approved plans (§9B.28) |
| 8 | Deprecate legacy admin paths that bypass Studio (Scene Stack material path, Content Brain SOT) |

### 6.2 UX principles (from existing CDS docs)

- Room-as-interface, Orb-as-host, movement-not-scroll
- Direction before generation prompts
- Show what was delegated, suppressed, and awaiting approval (Attention alignment)

### 6.3 Exit criteria

- [ ] Founder can initiate product launch campaign without touching raw FAL APIs
- [ ] Every material output from Studio traceable in UI to genome/brand/narrative/design/rights/approvals
- [ ] Legacy marketing-content-only framing removed from navigation copy
- [ ] Founder Acceptance Testing includes creative production graph scenarios

---

## Cross-phase dependencies

```text
Phase 1 (contracts + gateway)
  └── Phase 2 (authorization E2E)
        └── Phase 3 (pipelines)
              └── Phase 4 (compiler fidelity + queue)
                    └── Phase 5 (campaign/content orchestration)
                          └── Phase 6 (founder UI)
```

**Genesis v1 closure** (Obligation & Entity Governance, Assurance, Domain Records)
feeds legal/claim gates in Phases 4–5 but does not block Phase 1–2.

**Organizational Memory migration** (Learning Ledger adapter) runs parallel in
Phase 1–2 to retire Memory Engine / Wisdom Capture writes.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Breaking existing admin workflows | Feature flags; seed authorization for dev; phased endpoint migration |
| LocalStorage state loss | Phase 2 server persistence before Phase 6 UI |
| Supabase registry latency | Registry transaction queue with retry |
| Foundry recipe gap | Phase 3 expands recipes incrementally; don't block on full catalog |
| Dual service/API layer confusion | Phase 1 facade alignment plan; deprecate unused services |
| Customer preview regression | Explicit ephemeral classification; separate gateway path |

---

## Success definition

Studio OS becomes the **universal creative operating system** for every onboarded
company when:

1. Every material creative expression traverses the production graph.
2. One Asset Registry holds durable identity and rights.
3. Content Engine owns publication; Experience Engine owns expression compile.
4. Creative Direction Studio is the sole founder entry point for creative work.
5. No duplicate creative engines, registries, or memory stores remain in active code paths.

See `MIGRATION_AUDIT.md` for per-module status and `PRODUCTION_GRAPH.md` for
object and edge definitions.
