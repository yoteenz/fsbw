# Studio OS — Serverless Invocation Pre-Handler Failure Forensic Report

**Sprint:** P0 Serverless Invocation Forensic — Pre-Handler Runtime Failure Isolation  
**Status:** Forensic boundary proven — **no repair shipped**  
**Report date:** 2026-07-12  
**Spatial Architecture Review:** SKIPPED — forensic sprint, no new surfaces  
**Production URL:** https://fsbw.vercel.app

---

## Executive summary

Governed-generation serverless functions terminate at **Vercel cold-start / module-evaluation** with `FUNCTION_INVOCATION_FAILED` **before** route handlers execute. Application diagnostics (`traceId`, `diagnostic.category`, JSON body) never appear because the handler and its `try/catch` layer are never reached.

**Earliest proven shared failure boundary:** the `api/` → `src/studio-os-core/` cross-root import chain introduced exclusively by `api/_lib/creativeProduction/*`, beginning at the first value import in `legacy-adapters.ts` into `src/studio-os-core/creative-production/demo-seed.js` (and its dependency closure).

**Primary root-cause classification:** **D — Build artifact omission** (Vercel serverless file tracing / bundling does not reliably include `src/studio-os-core/**` when entrypoints live under `api/admin/*`).  
**Runtime symptom classification:** **A — Module evaluation failure** (`ERR_MODULE_NOT_FOUND` or equivalent unhandled import error at cold start — exact message **Unknown**, Vercel logs unavailable).

The superseded Layer 1 timeout / FAL theory is **not supported** by current production evidence: failures return in **~350–650 ms** with plain text, not after long provider execution.

---

## 1. Documented facts (authoritative production evidence)

| # | Fact |
|---|------|
| 1 | Creative Studio and Experience Engine remain blocked on governed generation. |
| 2 | Both depend on `experience-lab-render-runtime.runFullPipeline` → `useSceneStack` → `ensureStation` → `requestStudioBuilderGenerate()`. |
| 3 | Deploy `7a8869404` was live at sprint start; current `master` HEAD is `f5fa2e36a` (docs-only cross-sync after Layer 1 repair). |
| 4 | Unauthenticated `POST` to all four governed-generation endpoints returns **HTTP 500**, header **`x-vercel-error: FUNCTION_INVOCATION_FAILED`**, **`content-type: text/plain`**, body plain text — **not JSON**. |
| 5 | Response lacks `traceId`, `diagnostic.category`, `diagnostic.code`, and all application JSON. |
| 6 | Response latency is **~350–650 ms** (too fast for FAL/provider execution). |
| 7 | Control endpoints return normal JSON (e.g. **401** `{"error":"Sign in required","code":"MISSING_TOKEN"}`). |
| 8 | Layer 1 repair (`7a8869404`) added top-level `try/catch`, `traceId`, and diagnostics to `studio-builder-generate.ts` — production probes after that deploy still show **no** structured JSON, proving the handler path does not execute. |
| 9 | `FUNCTION_INVOCATION_FAILED` on `experience-lab-ephemeral-authorization` predates Layer 1 repair (documented since commit `49e48c7e4` in `SHARED_GENERATION_PIPELINE_REGRESSION.md`). |

### Production probes (this sprint, 2026-07-12 UTC)

| Endpoint | HTTP | Body shape | Time |
|----------|------|------------|------|
| `POST /api/admin/experience-lab-ephemeral-authorization` | 500 | `FUNCTION_INVOCATION_FAILED` plain text | ~354 ms |
| `POST /api/admin/studio-builder-generate` | 500 | `FUNCTION_INVOCATION_FAILED` plain text | ~398 ms |
| `POST /api/admin/studio-foundry-generate` | 500 | `FUNCTION_INVOCATION_FAILED` plain text | ~fast |
| `POST /api/admin/studio-generate-asset` | 500 | `FUNCTION_INVOCATION_FAILED` plain text | ~fast |
| `GET /api/admin/studio-asset-registry` | 401 | JSON `MISSING_TOKEN` | normal |
| `POST /api/admin/product-photography-generate` | 401 | JSON `MISSING_TOKEN` | ~281 ms |

**Note:** `product-photography-generate` uses the same `export const config` before imports pattern as failing routes but **does not** import `creativeProduction` or `src/studio-os-core` — it returns JSON. This rules out `export const config` ordering alone as the failure cause.

---

## 2. Phase 1 — Serverless entry graph

### 2.1 Failing endpoints (governed generation)

| Entry | Direct unique imports (beyond shared `adminAuth`) |
|-------|---------------------------------------------------|
| `api/admin/experience-lab-ephemeral-authorization.ts` | `creativeProduction/legacy-adapters.js` |
| `api/admin/studio-builder-generate.ts` | `legacy-adapters`, `generation-gateway`, `generation-error-diagnostics`, `sceneStackReferenceEnforcement`, CIE |
| `api/admin/studio-foundry-generate.ts` | `legacy-adapters`, `generation-gateway` |
| `api/admin/studio-generate-asset.ts` | `legacy-adapters`, `generation-gateway` |

**Only four** `api/admin/*.ts` files import `creativeProduction` or `src/studio-os-core` (repo-wide grep).

### 2.2 Working control endpoints

| Entry | Dependency scope |
|-------|------------------|
| `api/admin/studio-asset-registry.ts` | `api/_lib/adminAuth`, `api/_lib/supabase`, `api/_lib/assetRegistry/*` — **no `src/`** |
| `api/admin/studio-creative-intelligence.ts` | `api/_lib/adminAuth`, `api/_lib/supabase`, `api/_lib/creativeIntelligenceEngine/*` — **no `src/`** |
| `api/admin/product-photography-generate.ts` | `api/_lib/productPhotographyGeneration/*`, `api/_lib/productAssetFactory/*` — **no `src/`** |

### 2.3 Minimal failing graph (ephemeral — smallest bundle)

```
api/admin/experience-lab-ephemeral-authorization.ts
├── api/_lib/adminAuth.ts
└── api/_lib/creativeProduction/legacy-adapters.ts
    ├── api/_lib/creativeProduction/authorization-signing.ts
    │   └── src/studio-os-core/creative-production/authorization.ts
    ├── api/_lib/creativeProduction/ephemeral-validation-auth.ts
    │   └── src/studio-os-core/creative-production/{demo-seed,authorization}.ts
    └── src/studio-os-core/creative-production/
        ├── demo-seed.ts → initiative-model, authorization, lineage, types
        └── validation-compile-context.ts
```

**Graph size (static analysis):** 12 files total — 6 under `api/`, 6 under `src/studio-os-core/creative-production/`.

### 2.4 Extended failing graph (studio-builder-generate — superset)

Adds on top of ephemeral graph:

```
api/admin/studio-builder-generate.ts
├── api/_lib/sceneStackReferenceEnforcement.ts
├── api/_lib/creativeProduction/generation-error-diagnostics.ts
├── api/_lib/creativeProduction/generation-gateway.ts
│   ├── api/_lib/studioBuilderGeneration.ts
│   ├── api/_lib/studioAssetGeneration.ts
│   ├── api/_lib/creativeIntelligenceEngine/decision-engine.ts
│   ├── api/_lib/creativeProduction/registry-transaction.ts
│   └── src/studio-os-core/
│       ├── creative-production/graph.ts
│       └── asset-compiler/{compiler,recipes,types}.ts
```

**Graph size:** 35 files — 24 under `api/`, 11 under `src/studio-os-core/`.

### 2.5 Working graph (studio-asset-registry)

```
api/admin/studio-asset-registry.ts
└── api/_lib/assetRegistry/* + supabase + adminAuth (9 api files, 0 src)
```

### 2.6 Intersection analysis

| Layer | Failing only | Working only | Shared |
|-------|--------------|--------------|--------|
| Entry | 4 governed routes | registry, CIE, product-photography, … | `adminAuth`, `supabase` (some) |
| `api/_lib/creativeProduction/*` | **entire subtree** | absent | — |
| `src/studio-os-core/**` | **all cross-root imports** | **zero** | — |
| CIE (`creativeIntelligenceEngine`) | studio-builder (extra) | studio-creative-intelligence (works) | CIE alone is not sufficient to fail |
| FAL / provider (`studioBuilderGeneration`) | studio-builder+gateway | absent from ephemeral | not in minimal failure path |

**Conclusion:** The **only** dependency intersection unique to all failing endpoints is:

> `api/_lib/creativeProduction/*` → `../../../src/studio-os-core/...`

No other failing route shares a dependency outside this boundary.

---

## 3. Phase 2 — Earliest shared failure boundary

### 3.1 Execution stage

| Stage | Evidence |
|-------|----------|
| Vercel platform cold start | `FUNCTION_INVOCATION_FAILED`, plain text, ~400 ms |
| Module graph evaluation | Failure occurs before handler — no `traceId`/JSON from post-`7a8869404` handler hardening |
| `resolveAdminAuth` | **Unknown** — never reached in a way that returns JSON |
| `executeGovernedGeneration` | **No production evidence** of execution |
| FAL / Model Orchestrator | **No production evidence** — superseded timeout theory |

### 3.2 Earliest shared code (only on failing routes)

**File:** `api/_lib/creativeProduction/legacy-adapters.ts`  
**Operation:** ESM static `import` of platform source from outside the `api/` tree  
**First value import from `src/` (after type-only erasure):**

```typescript
import {
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  DEMO_AUTHORIZATION_ID,
} from '../../../src/studio-os-core/creative-production/demo-seed.js';
```

**Dependency closure loaded at evaluation (ephemeral path):**

| File | Role |
|------|------|
| `src/studio-os-core/creative-production/demo-seed.ts` | First value import target |
| `src/studio-os-core/creative-production/initiative-model.ts` | demo-seed dependency |
| `src/studio-os-core/creative-production/authorization.ts` | demo-seed + signing |
| `src/studio-os-core/creative-production/lineage.ts` | demo-seed dependency |
| `src/studio-os-core/creative-production/types.ts` | types (erased at compile) |
| `src/studio-os-core/creative-production/validation-compile-context.ts` | legacy-adapters direct import |

**Why this is earliest:** Every failing endpoint imports `legacy-adapters.ts` (directly or via `generation-gateway` → `legacy-adapters`). No failing endpoint reaches governed logic without evaluating this module graph. Control endpoints never import this file.

### 3.3 Ruled-out candidates

| Candidate | Ruled out by |
|-----------|--------------|
| `export const config` before imports | `product-photography-generate` succeeds with same pattern |
| FAL / provider timeout | ~400 ms response; no handler diagnostics |
| `executeGovernedGeneration` throw | No JSON from handler `try/catch` |
| `sceneStackReferenceEnforcement` | Not imported by ephemeral (minimal failing route) |
| CIE alone | `studio-creative-intelligence` works |
| Auth middleware | Working routes return JSON 401 from same `adminAuth` |

---

## 4. Phase 3 — Local reproduction

### 4.1 Module evaluation (production env simulation)

```bash
NODE_ENV=production VERCEL_ENV=production npx tsx --eval "
  import('./api/admin/experience-lab-ephemeral-authorization.ts')
  import('./api/_lib/creativeProduction/legacy-adapters.ts')
  import('./src/studio-os-core/creative-production/demo-seed.ts')
"
```

**Result:** All imports **OK** — handler function present, `legacy-adapters` exports load, `demo-seed` loads.

### 4.2 Local esbuild bundle (Node platform)

| Bundle entry | Output size | Result |
|--------------|-------------|--------|
| `experience-lab-ephemeral-authorization.ts` | 558 KB | Success — inlines `src/studio-os-core/creative-production/*` |
| `studio-builder-generate.ts` | 838 KB | Success — inlines asset-compiler + creative-production |
| `studio-asset-registry.ts` | 577 KB | Success — no src/ inlining |

**Result:** Local bundler **includes** cross-root `src/` modules inline. Bundles evaluate without crash on local filesystem.

### 4.3 Local vs production divergence

| Dimension | Local | Production (inference) |
|-----------|-------|------------------------|
| Filesystem | Full monorepo present | Serverless bundle / traced file set only |
| `src/studio-os-core` resolution | Direct path from repo root | Depends on Vercel `@vercel/nft` trace from `api/` entry |
| `tsconfig.json` `include` | `["src"]` only — **`api/` not in TS project** | May affect trace metadata |
| Handler hardening | N/A | Deployed but never observed in responses |
| Node version | v22.14.0 (cloud agent) | Vercel default Node (project has no `engines` pin) — **Unknown** exact production Node |

---

## 5. Phase 4 — Bundle forensics

### 5.1 Deployed bundle inspection

| Attempt | Result |
|---------|--------|
| `npx vercel build` | **Failed** — no valid Vercel token (`vercel login` required) |
| Download production `.vercel/output` | **Unavailable** — no deployment artifact access |
| `@vercel/nft` CLI on `.ts` entry | **Failed** — invalid args / no trace |
| `@vercel/nft` programmatic (default) | Only **2 files** traced (entry only) — **did not follow `api/` → `src/` imports** |

### 5.2 Local bundle content proof

esbuild output for ephemeral bundle contains inlined comments confirming inclusion:

```
// src/studio-os-core/creative-production/initiative-model.ts
// src/studio-os-core/creative-production/authorization.ts
// src/studio-os-core/creative-production/demo-seed.ts
// src/studio-os-core/creative-production/validation-compile-context.ts
```

### 5.3 `vercel.json` function config

| Function | `includeFiles` |
|----------|----------------|
| `studio-builder-generate` | `public/assets/marble-half.png` only |
| `studio-generate-asset` | marble + noir thumb |
| governed routes | **No** `src/studio-os-core/**` inclusion |

**Inference:** Production bundle may ship marble assets but **omit** `src/studio-os-core/creative-production/**` required by `legacy-adapters` imports.

---

## 6. Phase 5 — Vercel platform forensics

| Log type | Availability | Reason |
|----------|--------------|--------|
| Build logs | **Unavailable** | No Vercel CLI auth in cloud agent environment |
| Runtime / function logs | **Unavailable** | No project log API access |
| Cold-start stack trace | **Unavailable** | Platform returns generic plain text only |
| `x-vercel-id` | **Available** | e.g. `pdx1::hdv8g-1783860807807-aee7dc8ba5fd` — correlates invocations only |

**What we cannot prove without logs:** exact exception string (`ERR_MODULE_NOT_FOUND`, `SyntaxError`, etc.).

**What we can prove without logs:** failure is **pre-handler** (no application JSON despite handler hardening shipped in `7a8869404`).

---

## 7. Phase 6 — Root-cause classification

### Primary: **D — Build artifact omission**

Cross-root imports from `api/_lib/creativeProduction/` to `src/studio-os-core/` are not reliably present in the Vercel serverless deployment artifact. Module evaluation fails at cold start.

### Contributing: **A — Module evaluation failure**

Symptom at runtime: unhandled exception during ESM graph load before `handler` is invoked → `FUNCTION_INVOCATION_FAILED`.

### Contributing: **H — Configuration mismatch**

- `tsconfig.json` includes only `src`, not `api/`
- `vercel.json` `includeFiles` lists static assets but not `src/studio-os-core/**`
- `@vercel/nft` default trace from API entry did not enumerate `src/` dependencies

### Rejected (superseded)

| Category | Reason |
|----------|--------|
| K — Timeout / long FAL | ~400 ms failures; no provider stage evidence |
| F — Environment bootstrap at handler | Handler never returns JSON |
| Provider / Scene Stack / World Compiler | No evidence application layer executes |

---

## 8. Phase 7 — Forensic conclusions (no repair)

### Earliest proven exception (boundary)

| Field | Value |
|-------|-------|
| **Stage** | Serverless cold-start module evaluation (pre-handler) |
| **File** | `api/_lib/creativeProduction/legacy-adapters.ts` |
| **Import** | `../../../src/studio-os-core/creative-production/demo-seed.js` |
| **Operation** | ESM static import resolving outside `api/` deployment root |
| **Exact exception text** | **Unknown** (Vercel logs unavailable) |
| **Classification** | **D** (+ runtime **A**) |

### Why application never returns JSON

Route handlers and post-`7a8869404` `try/catch` + `generation-error-diagnostics` run **only after** the module graph loads. `FUNCTION_INVOCATION_FAILED` indicates Vercel aborts during bundle initialization.

### Why diagnostics never execute

`createGenerationTraceId`, `logGenerationDiagnostic`, and `normalizeGenerationError` live in handler and gateway code paths that are never entered.

### Why control endpoints survive

`studio-asset-registry`, `studio-creative-intelligence`, and `product-photography-generate` depend only on `api/_lib/**`. Their module graphs never cross into `src/studio-os-core/`.

### Why governed-generation endpoints fail

All four import `api/_lib/creativeProduction/legacy-adapters.ts` (directly or transitively), which is the **sole** `api/` import surface into `src/studio-os-core/`.

### Historical continuity

`SHARED_GENERATION_PIPELINE_REGRESSION.md` documents `FUNCTION_INVOCATION_FAILED` on ephemeral authorization since `49e48c7e4` — **before** Layer 1 JSON hardening. Current production evidence confirms the pre-handler failure class persists after `7a8869404`.

---

## 9. State classification

| Item | State |
|------|-------|
| Governed-generation production endpoints | **Production** (deployed, failing) |
| Pre-handler failure forensic boundary | **Production evidence** (probes + import graph) |
| Exact Vercel exception string | **Unknown** |
| Build artifact omission hypothesis | **Inference** (strong — local bundle includes src, production does not reach handler) |
| FAL / provider as root cause | **Rejected** (superseded) |
| Layer 1 repair incident resolution | **In Progress** — repair did not fix pre-handler class |
| Recommended repair | **Planned** — boundary only (see §10) |

---

## 10. Recommended next repair boundary (NOT the repair)

**Repair only this boundary:**

> Ensure Vercel serverless functions for governed-generation routes can **evaluate** the `api/_lib/creativeProduction/*` → `src/studio-os-core/creative-production/*` (and `asset-compiler/*` for `studio-builder-generate`) import graph at cold start.

**Acceptable repair classes (founder choice — not implemented here):**

1. **Colocate** creative-production server modules under `api/_lib/` so `@vercel/nft` traces within `api/` only  
2. **Explicit `includeFiles`** in `vercel.json` for all `src/studio-os-core/creative-production/**` (and asset-compiler) files used by governed routes  
3. **Pre-bundle** governed routes at build time so `src/` is inlined (esbuild) before Vercel packaging  
4. **Extend `tsconfig`** to include `api/` and align build trace with TypeScript project boundaries  

**Do not repair yet (out of scope):** FAL, Scene Stack, World Compiler, auth semantics, Experience Lab client flow, canvas fallbacks, async queues.

**Verification gate for any future repair:** Unauthenticated `POST` to `experience-lab-ephemeral-authorization` must return **JSON** (e.g. 401 `MISSING_TOKEN` or 400 `MISSING_COMPILE_CONTEXT`) — not plain-text `FUNCTION_INVOCATION_FAILED`.

---

## 11. Deliverables checklist

| # | Deliverable | Location |
|---|-------------|----------|
| 1 | Shared dependency graph | §2.3–2.4 |
| 2 | Working endpoint graph | §2.5 |
| 3 | Intersection analysis | §2.6 |
| 4 | Earliest shared failing import | §3.2 |
| 5 | Production bundle analysis | §5 |
| 6 | Vercel runtime analysis | §6 |
| 7 | Root-cause classification | §7 |
| 8 | Evidence table | §1, §4, §5 |
| 9 | Next repair boundary | §10 |

---

## 12. Related artifacts

- `docs/studio-os/forensics/SHARED_GENERATION_PIPELINE_REGRESSION.md` — ephemeral `FUNCTION_INVOCATION_FAILED` since `49e48c7e4`
- `docs/studio-os/forensics/LAYER1_GENERATION_500_REPAIR.md` — handler hardening (historical; superseded for pre-handler class)
- [`DISPATCH_OFFICE_PREHANDLER_FORENSIC.md`](./DISPATCH_OFFICE_PREHANDLER_FORENSIC.md) — Dispatch Office framing (2026-07-12 sprint)
- [`../creative-services/CREATIVE_SERVICES_ROADMAP.md`](../creative-services/CREATIVE_SERVICES_ROADMAP.md) — future architecture (Planned)

---

*Forensic sprint complete. No application runtime code modified.*
