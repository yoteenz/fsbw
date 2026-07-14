# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-14  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions

---

## Gate rule

**Do not** describe Creative Direction Studio or Experience Lab validation runtime as restored until:

1. **B1-Layer1** — Founder completes authenticated real-device Layer 1 verification on Mobile Safari and Mobile Chrome with `?compilerDiag=1`, **and**  
2. **B1-E2E-Completion** — Founder confirms top bar and viewport never contradict (no 100% with N/8 generating) on authenticated device.

---

## B0-PreHandler — Dispatch Office serverless bundle (CLEARED)

| Field | Detail |
|-------|--------|
| **ID** | B0-PreHandler |
| **Symptom** | Four governed routes returned HTTP 500 plain-text `FUNCTION_INVOCATION_FAILED` |
| **Repair** | Pre-bundle `studio-os-server.bundle.js` (`4ec75321f`) |
| **Verify** | `POST /api/admin/experience-lab-ephemeral-authorization` and `studio-builder-generate` return JSON |
| **Status** | **Production** — unauthenticated probe 2026-07-12: JSON 401; `studio-builder-generate` issues `traceId` |

### Documented Fact

- Pre-handler module evaluation failure was real; bundle repair addresses import trace.
- Handler and `traceId` execute on probed routes post-deploy.

---

---

---

## B1-FounderRender — True Founder Render™ photoreal preview (SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-FounderRender |
| **Symptom** | Founder Review showed procedural CSS rectangles, not photoreal room |
| **Founder decision** | Founder Review must show actual AI-generated full-room image before manufacturing |
| **Repair** | `founder-full-room-preview` artifact intent + `studio_founder_render_jobs` + FAL NBP edit + brand preflight + approval gate |
| **Model** | `fal-ai/nano-banana-pro/edit` via `nano-banana-pro-founder-full-room` |
| **Verify** | Mobile Founder Review shows real photoreal image; Approve & Build gated until READY |
| **API verify** | `POST /api/admin/founder-render-generate` must return JSON (not FUNCTION_INVOCATION_FAILED) |
| **Status** | **Verify Pending** — generate API fix shipped; founder mobile proof pending |

### Documented Fact

- Previous hero: `buildFounderRenderModel()` procedural shapes (`generationOccurred: false`).
- Engineering blueprint remains in collapsed `BlueprintDrawer` only.

---

## B1-Parity — FS vs Studio OS generation divergence (REPAIR SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Parity |
| **Symptom** | `LANDMARK_VALIDATION_FAILED` / `QUALITY_REGENERATE_REQUIRED` on opaque NB2 plates; FS color/styling completes |
| **Root cause** | Studio OS `runVerifiedAssetProductionPipeline` rejects salvageable opaque studio output before governed background removal |
| **Repair** | `salvageable-opaque.ts` + structural/quality deferral + artifact-intent routing + `FULL_SCENE_RERENDER` architecture signals |
| **Forensics** | `docs/studio-os/investigations/FS_VS_STUDIO_OS_GENERATION_PARITY.md` |
| **Mobile diag** | `?compilerDiag=1` → Generation Parity panel in Shell Foundation Black Box |
| **Verify** | Isolated layer advances to BACKGROUND_REMOVING on founder device |
| **Status** | **Verify Pending** |

### Documented Fact

- Frontal Slayer path: `POST /api/wig-preview/live-noir-color` → sync FAL → no Quality Guard.
- Studio OS path: `studio-builder-generate` → async jobs → verified-asset pipeline (divergence boundary).
- Supabase schema audit 2026-07-13: critical tables present; no migration required.

---

---

## B1-CanonicalDept-Runtime — Canonical department live render queue (SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-CanonicalDept-Runtime |
| **Symptom** | Experience Lab Program A batch panel showed cost plan but Queue button did nothing; no visible queue |
| **Repair** | `CanonicalDepartmentBatchPanel` wired to `POST /api/admin/canonical-department-generation` action `queue`; `CanonicalDepartmentQueuePanel` shows live jobs; `api/_lib/canonicalDepartmentQueue.ts` dispatches landscape Founder Renders to FAL via `studio_founder_render_jobs` (capacity 4); portrait auto-queued after landscape ready |
| **Verify** | Admin selects canonical department → confirms → Queue → CANONICAL RENDER QUEUE shows GENERATING → READY with Preview link |
| **Status** | **Verify Pending** — code shipped; production FAL proof after deploy |

### Documented Fact

- Queue persists in `studio_founder_render_jobs` with `governance_context.program = canonical-studio-world`.
- Department tree badges update from queue status (QUEUED / GENERATING / READY).

---

## B1-ModMarketplace-Runtime — Founder mod marketplace live install (DOMAIN SHIPPED — RUNTIME PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-ModMarketplace-Runtime |
| **Symptom** | Founder mod IP lineage, royalties, licensing, and certification logic exist in `src/studio-os-core/founder-mods/` and Supabase schema — but no production API routes yet sync registry to DB or execute buyer installation |
| **Repair** | P0 Industry Pack Neutrality sprint shipped domain models, brand-neutrality validator, 24 tests, 11 Supabase tables with RLS; live marketplace purchase/install API wiring is next |
| **Verify** | Buyer with compatible Hair Brand Pack purchases Build-A-Wig Atelier mod → license verified → neutral package installed → creator lineage preserved → royalty ledger entry created |
| **Status** | **Runtime Pending** — schema + domain logic production-ready |

### Documented Fact

- Build-A-Wig Atelier™ classified `FOUNDER_CREATED_MODDED_SCENE`, creator `frontal-slayer`, not in official Hair Brand/Salon defaults.
- Royalty rate intentionally null (`royalty-baw-atelier-v1`) — founder-configured per non-goals.
- City Council certification required before marketplace publication.

---

## B1-Isolated — Brand-grounded NB2 + verified mount (SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Isolated |
| **Symptom** | Generic marble substitution; NBP isolated aesthetic insufficient |
| **Founder decision** | NB2 default for isolated assets; exact org marble required |
| **Repair** | Model Registry v2 + Brand Asset Grounding + material fidelity validation |
| **Isolated model** | `fal-ai/nano-banana-2` / `fal-ai/nano-banana-2/edit` (brand refs) |
| **Shell model** | `fal-ai/nano-banana-pro/edit` (unchanged) |
| **Verify** | Experience Lab evidence panel shows brand marble + material pass on mobile |
| **Status** | **In Progress** — code shipped; founder production proof pending |

### Do not

- Rebuild shell on layer-quality failure
- Accept full-scene rerenders to advance pipeline
- Show "Retry Shell Layer" for landmark quality failures

---

## B1-Layer1 — Governed generation Layer 1 (ASYNC REPAIR SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Layer1 |
| **Symptom** | Layer 1 / shell generation — `TypeError: Load failed` after ~95.5s synchronous pending |
| **Proven boundary** | Synchronous HTTP transport waiting for full FAL `fal.subscribe` completion |
| **Repair** | ASYNC_GOVERNED_GENERATION_V1 — `fal.queue.submit` + persisted job + 202 submit + status poll/resume |
| **Files** | `async-governed-generation.ts`, `studio-builder-generate.ts`, `studioBuilder/api.ts`, migration `studio_governed_generation_jobs` |
| **Forensic** | `ASYNC_GOVERNED_GENERATION.md` |
| **Verify** | Mobile — submit <2s, leave page, return, asset mounts without resubmit |
| **Status** | **In Progress** — code shipped; founder production proof pending |
| **Rollback** | `ASYNC_GOVERNED_GENERATION_V1=0` restores synchronous path |

### Documented Fact

- Package resolution, authorization, and `requestStudioBuilderGenerate` entry succeeded before transport failure
- IFR proved execution through IFR-15/16 window; failure was long-lived fetch not returning JSON

### Do not

- Declare Creative Studio or Experience Lab restored until founder device proof
- Remove synchronous path until async verified in production

---

## B1-Shell — Shell foundation (ASYNC TRANSPORT REPAIR — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Shell |
| **Symptom** | Building Shell stall when sync fetch dropped at ~95s |
| **Repair** | Same async work-order path via `requestStudioBuilderGenerate` 202 handling |
| **Status** | **In Progress** — awaits founder compile with async submit |

---

## B1-Immune — Schema drift self-healing (SHIPPED — PRODUCTION ENV PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Immune |
| **Symptom** | Missing `studio_governed_generation_jobs` caused schema-cache insert failure; hours of misdirected investigation |
| **Repair** | Studio OS Immune System™ — drift detector + Class A migration apply + contract verify + single retry |
| **Reference migration** | `20260712180000_studio_governed_generation_jobs` |
| **Files** | `src/studio-os-core/immune-system/`, `api/_lib/immuneSystem/`, `async-governed-generation.ts` |
| **Env** | `IMMUNE_SYSTEM_AUTO_REPAIR=1` + `SUPABASE_DB_URL` or `DATABASE_URL` (preferred) or Management API token |
| **CD Studio auth** | Separate fix — `POST /api/admin/creative-studio-stack-authorization` before stack build (not Immune System) |
| **CD Studio async** | `ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO=1` + `ASYNC_GOVERNED_GENERATION_V1=1` for 202 transport |
| **Verify** | Isolated reference-recovery test passes; production proof requires env + missing-table scenario (do not drop prod table) |
| **Status** | **In Progress** — code shipped; Vercel env + live auto-repair proof pending |
| **Rollback** | `IMMUNE_SYSTEM_AUTO_REPAIR=0` — detection/escalation only, no DDL apply |

### Documented Fact

- Missing table was deterministic root cause; adding table restored governed generation workflow
- FAL was not the active failure during the reference incident

### Do not

- Drop production table to test auto-repair
- Enable arbitrary SQL endpoints or client-controlled migration IDs
- Treat immune repair as permission for destructive schema changes

---

## B1-E2E-Completion — Premature terminal completion (REPAIR SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-E2E-Completion |
| **Symptom** | Top bar **Render complete / 100%** while viewport overlay shows **Generating … N/8** or **0/8** |
| **Proven boundary** | `computeRenderPipelineProgress` — `isComplete = Boolean(compileSuccess)` |
| **Repair** | `evaluateRenderTerminalComplete` gate; runtime defers `RenderCompleted` until invariants pass; `notifySnapshot` promotes on late layer finish |
| **Files** | `render-pipeline-progress.ts`, `experience-lab-render-runtime.ts` |
| **Tests** | `render-pipeline-progress.invariants.test.ts` (14) |
| **Forensic** | `END_TO_END_PIPELINE_RECONCILIATION.md` §13 |
| **Status** | **In Progress** — code shipped; founder authenticated verification pending |

### Documented Fact

- Repair changes completion **authority** only — no Scene Stack, World Compiler, or provider changes.
- `compileReport.success` = blueprint ready; terminal complete = Final Inspection passed.

### Do not

- Treat repair shipped as incident resolved without authenticated device proof
- Revert to compile-only completion authority

---


Experience Lab validation runtime shares `useSceneStack` driver and `studio-builder-generate` with CDS. See **B1-Layer1** and **B1-E2E-Completion**.

---

## B2 — Diagnostic normal-tab verification

| Field | Detail |
|-------|--------|
| **ID** | B2 |
| **Recovery URL** | https://fsbw.vercel.app/__studio-os-recovery |
| **Status** | **In Progress** — pending founder device verification |

---

## B1-EnvPkg-Production — Environment Package live generation proof (VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-EnvPkg-Production |
| **Symptom** | Pipeline shipped with durable Supabase persistence; production FAL generation and canonical promotion default OFF |
| **Repair** | Migration `20260714140000_environment_asset_packages.sql` applied; API routes migrate/approve/worker/promote/status |
| **Enable** | Set `ENABLE_PACKAGE_PRODUCTION_GENERATION=1` + founder device proof on one non-canonical variant (e.g. light-02) |
| **Canonical** | `ENABLE_PACKAGE_CANONICAL_PROMOTION=1` + `ENABLE_PACKAGE_CDS_HANDOFF=1` after founder review |
| **Status** | **Verify Pending** — awaiting founder device review; do not auto-promote |

---

## Creative Services roadmap

**Planned / Conceptual only** — see `docs/studio-os/creative-services/CREATIVE_SERVICES_ROADMAP.md`. Not implemented.
