# Dispatch Office™ — Pre-Handler Serverless Failure Forensic Report

**Sprint:** P0 Dispatch Office Forensic — Shared Governed-Generation Entry Failure Isolation  
**Status:** Forensic boundary proven — **no repair shipped**  
**Report date:** 2026-07-12  
**Spatial Architecture Review:** SKIPPED — forensic sprint, no new surfaces  
**Production URL:** https://fsbw.vercel.app  
**Companion:** [`SERVERLESS_INVOCATION_PREHANDLER_FAILURE.md`](./SERVERLESS_INVOCATION_PREHANDLER_FAILURE.md) (same boundary, platform framing)

---

## 1. Dispatch Office metaphor

In Studio World™, **Dispatch Office™** is the shared serverless entry that receives governed creative work orders before any **Interior Design** specialist (Studio Builder, Foundry, Asset Director) contacts an external provider (FAL, OpenAI Images, etc.).

**Implementation mapping (Documented Fact):**

| Studio World concept | Code location |
|---------------------|---------------|
| Dispatch Office reception | `api/admin/studio-builder-generate.ts`, `studio-foundry-generate.ts`, `studio-generate-asset.ts`, `experience-lab-ephemeral-authorization.ts` |
| Work-order adapters | `api/_lib/creativeProduction/legacy-adapters.ts` |
| Dispatch routing desk | `api/_lib/creativeProduction/generation-gateway.ts` → `executeGovernedGeneration()` |
| Interior Design (image gen) | `api/_lib/studioBuilderGeneration.ts` → FAL (`fal-ai/nano-banana-pro/edit`) |

**Forensic question:** Does execution reach the Dispatch Office route handler — or does Vercel terminate the serverless bundle before the handler runs?

**Answer (Documented Fact + Inference):** **No.** Execution stops at **cold-start module evaluation** before the handler. Interior Design (FAL) is **never contacted**.

---

## 2. Questions answered

| Question | Answer | Evidence class |
|----------|--------|----------------|
| Does execution reach the route handler? | **No** | Documented Fact |
| If not, where does execution stop? | Vercel platform abort during ESM module graph load (pre-handler) | Documented Fact + Inference |
| Which shared path is common to all failing endpoints? | `api/_lib/creativeProduction/*` → `src/studio-os-core/**` | Documented Fact |
| Why do control endpoints survive? | They depend only on `api/_lib/**`; zero `src/` cross-root imports | Documented Fact |
| Root-cause category? | **D — Build artifact omission**; symptom **A — Module evaluation failure** | Inference (strong) |

---

## 3. Documented facts (authoritative)

| # | Fact |
|---|------|
| 1 | Creative Studio and Experience Engine remain blocked. |
| 2 | Both share Experience Lab runtime: `runFullPipeline` → `useSceneStack` → `ensureStation` → `requestStudioBuilderGenerate()`. |
| 3 | Deploy `7a8869404` is live; forensic doc commit `c434c9a6f` adds prior boundary proof (docs only). |
| 4 | All four Dispatch Office endpoints return HTTP 500, `x-vercel-error: FUNCTION_INVOCATION_FAILED`, `text/plain`, no JSON. |
| 5 | No `traceId`, `diagnostic.category`, or application JSON in responses. |
| 6 | Latency ~300–650 ms — too fast for FAL/provider execution. |
| 7 | Control endpoints (`studio-asset-registry`, `studio-creative-intelligence`, `product-photography-generate`) return JSON normally. |
| 8 | Layer 1 repair handler hardening (`7a8869404`) never appears in production — handler does not execute. |
| 9 | Timeout / FAL failure hypothesis is **superseded**. |
| 10 | No production evidence that `executeGovernedGeneration`, Model Orchestrator, or FAL adapter run. |

### Production probes (2026-07-12 UTC — this sprint)

| Endpoint | Role | HTTP | Body | Time |
|----------|------|------|------|------|
| `POST /api/admin/experience-lab-ephemeral-authorization` | Dispatch auth desk | 500 | `FUNCTION_INVOCATION_FAILED` plain text | ~582 ms |
| `POST /api/admin/studio-builder-generate` | Primary governed route | 500 | plain text | ~398 ms (prior probe) |
| `POST /api/admin/studio-foundry-generate` | Foundry dispatch | 500 | plain text | prior probe |
| `POST /api/admin/studio-generate-asset` | Asset Director dispatch | 500 | plain text | prior probe |
| `GET /api/admin/studio-asset-registry` | Control (registry) | 401 | JSON `MISSING_TOKEN` | ~300 ms |
| `POST /api/admin/product-photography-generate` | Control (non-Dispatch) | 401 | JSON `MISSING_TOKEN` | ~281 ms |

---

## 4. Shared dependency graph (failing — Dispatch Office)

### 4.1 Dispatch Office entry routes (all failing)

| Entry | Imports |
|-------|---------|
| `api/admin/experience-lab-ephemeral-authorization.ts` | `legacy-adapters` only |
| `api/admin/studio-builder-generate.ts` | `legacy-adapters`, `generation-gateway`, `generation-error-diagnostics`, `sceneStackReferenceEnforcement`, CIE |
| `api/admin/studio-foundry-generate.ts` | `legacy-adapters`, `generation-gateway` |
| `api/admin/studio-generate-asset.ts` | `legacy-adapters`, `generation-gateway` |

**Repo fact:** Only these four `api/admin/*.ts` files import `creativeProduction` or `src/studio-os-core`.

### 4.2 Minimal Dispatch graph (ephemeral — smallest failing bundle)

```
api/admin/experience-lab-ephemeral-authorization.ts     ← Dispatch reception
├── api/_lib/adminAuth.ts
└── api/_lib/creativeProduction/legacy-adapters.ts      ← work-order adapter
    ├── api/_lib/creativeProduction/authorization-signing.ts
    │   └── src/studio-os-core/creative-production/authorization.ts
    ├── api/_lib/creativeProduction/ephemeral-validation-auth.ts
    │   └── src/studio-os-core/creative-production/{demo-seed,authorization}.ts
    └── src/studio-os-core/creative-production/
        ├── demo-seed.ts → initiative-model, authorization, lineage, types
        └── validation-compile-context.ts
```

**12 files:** 6 `api/`, 6 `src/studio-os-core/creative-production/`.

### 4.3 Extended Dispatch graph (studio-builder-generate — includes Interior Design path)

Adds beyond minimal graph:

```
api/admin/studio-builder-generate.ts
├── api/_lib/sceneStackReferenceEnforcement.ts
├── api/_lib/creativeProduction/generation-error-diagnostics.ts
└── api/_lib/creativeProduction/generation-gateway.ts    ← Dispatch routing desk
    ├── api/_lib/studioBuilderGeneration.ts             ← Interior Design / FAL (never reached)
    ├── api/_lib/studioAssetGeneration.ts
    ├── api/_lib/creativeIntelligenceEngine/decision-engine.ts
    ├── api/_lib/creativeProduction/registry-transaction.ts
    └── src/studio-os-core/
        ├── creative-production/graph.ts
        └── asset-compiler/{compiler,recipes,types}.ts
```

**35 files:** 24 `api/`, 11 `src/studio-os-core/`.

**Documented Fact:** FAL and `studioBuilderGeneration.ts` appear only in the extended graph. The minimal ephemeral route fails **without** loading FAL — proving provider code is not the pre-handler failure trigger.

---

## 5. Working endpoint dependency graph (control)

```
api/admin/studio-asset-registry.ts
└── api/_lib/{adminAuth,supabase,assetRegistry/*}     (9 files, 0 src/)

api/admin/studio-creative-intelligence.ts
└── api/_lib/{adminAuth,supabase,creativeIntelligenceEngine/*}  (16 files, 0 src/)

api/admin/product-photography-generate.ts
└── api/_lib/{adminAuth,productPhotographyGeneration/*,productAssetFactory/*}  (no src/)
```

---

## 6. Import intersection analysis

| Layer | Dispatch Office (failing) | Control (working) |
|-------|---------------------------|-------------------|
| `api/_lib/adminAuth` | ✓ | ✓ |
| `api/_lib/supabase` | some routes | ✓ |
| `api/_lib/creativeProduction/*` | **✓ exclusive** | ✗ |
| `src/studio-os-core/**` via `api/` | **✓ exclusive** | ✗ |
| `api/_lib/studioBuilderGeneration` (FAL) | builder only | ✗ |
| CIE | builder + intelligence route | intelligence route **works alone** |

**Intersection conclusion (Documented Fact):** The **only** dependency set present on every failing Dispatch route and absent on all working controls is:

> `api/_lib/creativeProduction/*` importing `../../../src/studio-os-core/...`

---

## 7. Earliest proven failure boundary

| Field | Value |
|-------|-------|
| **Execution stage** | Serverless cold-start module evaluation — **before** `handler()` |
| **File** | `api/_lib/creativeProduction/legacy-adapters.ts` |
| **Import** | `../../../src/studio-os-core/creative-production/demo-seed.js` |
| **Operation** | ESM static import resolving outside `api/` deployment root |
| **Exact exception** | **Unknown** — Vercel runtime logs unavailable |
| **Interior Design reached?** | **No** — `studioBuilderGeneration.ts` / FAL not in minimal failure graph |

```typescript
// legacy-adapters.ts — first value import from src/ (type imports erased)
import {
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  DEMO_AUTHORIZATION_ID,
} from '../../../src/studio-os-core/creative-production/demo-seed.js';
```

---

## 8. Production bundle analysis

| Attempt | Result |
|---------|--------|
| `npx vercel build` | **Unavailable** — no Vercel CLI auth |
| Deployed `.vercel/output` inspection | **Unavailable** |
| `@vercel/nft` default trace from API entry | **2 files only** — did not enumerate `src/` deps |
| Local `esbuild --bundle` | **Success** — inlines all `src/studio-os-core` modules into single artifact |
| Local `tsx` import (production env) | **Success** — all modules evaluate on full filesystem |

**Inference:** Local bundlers include `src/`; Vercel production packaging likely **omits** or fails to resolve `src/studio-os-core/**` when tracing from `api/admin/*` entrypoints.

**Configuration facts:**

- `tsconfig.json` `include: ["src"]` — `api/` not in TypeScript project
- `vercel.json` `includeFiles` lists marble assets for builder routes — **not** `src/studio-os-core/**`

---

## 9. Runtime analysis

| Signal | Observation |
|--------|-------------|
| Response shape | Plain text `FUNCTION_INVOCATION_FAILED` — platform generic |
| `content-type` | `text/plain` — not `application/json` |
| Handler `try/catch` (post-7a8869404) | Never observed in responses |
| Latency | ~300–650 ms — consistent with import failure, not FAL subscribe |
| Vercel function logs | **Unavailable** in cloud agent environment |
| `x-vercel-id` | Available for invocation correlation only |

**Does execution reach Model Orchestrator or FAL?** **No evidence.** Failure occurs before Dispatch handler; Interior Design modules are downstream of the proven boundary.

---

## 10. Root-cause classification

| Category | Verdict |
|----------|---------|
| **D — Build artifact omission** | **Primary** — cross-root `api/` → `src/` imports not reliably in serverless artifact |
| **A — Module evaluation failure** | **Runtime symptom** — unhandled import error at cold start |
| **H — Configuration mismatch** | **Contributing** — tsconfig scope, missing `includeFiles` for `src/studio-os-core` |
| **K — Timeout / FAL** | **Rejected** — superseded |
| **F — Environment bootstrap at handler** | **Rejected** — handler never returns JSON |
| **G — Unsupported native dependency** | **Unknown** — no log proof; unlikely in minimal creative-production graph |

---

## 11. Recommended repair boundary (NOT the repair)

**Repair only this boundary:**

> Ensure Dispatch Office serverless functions can **evaluate** the `api/_lib/creativeProduction/*` → `src/studio-os-core/**` module graph at cold start.

**Acceptable repair classes (founder approval required):**

1. Colocate server-side creative-production modules under `api/_lib/` (no cross-root imports)
2. Explicit `vercel.json` `includeFiles` for all required `src/studio-os-core/**` paths
3. Pre-bundle Dispatch routes at build time (esbuild inlines `src/`)
4. Extend `tsconfig` to include `api/` and align Vercel trace with project boundaries

**Verification gate:** Unauthenticated `POST` to `experience-lab-ephemeral-authorization` returns **JSON** (401/400), not plain-text `FUNCTION_INVOCATION_FAILED`.

**Out of scope for repair boundary:** FAL adapter, Scene Stack, World Compiler, Model Orchestrator routing, async queues, provider switching.

---

## 12. Evidence ledger

| Class | Statement |
|-------|-----------|
| **Documented Fact** | Four Dispatch endpoints fail identically; controls return JSON |
| **Documented Fact** | No traceId/diagnostic after handler hardening deploy |
| **Documented Fact** | Ephemeral route fails without FAL in import graph |
| **Documented Fact** | Only failing routes cross `api/` → `src/studio-os-core/` |
| **Inference** | Vercel bundle omits `src/` at cold start |
| **Unknown** | Exact Vercel exception string |

---

## 13. Related artifacts

- [`SERVERLESS_INVOCATION_PREHANDLER_FAILURE.md`](./SERVERLESS_INVOCATION_PREHANDLER_FAILURE.md)
- [`SHARED_GENERATION_PIPELINE_REGRESSION.md`](./SHARED_GENERATION_PIPELINE_REGRESSION.md)
- [`LAYER1_GENERATION_500_REPAIR.md`](./LAYER1_GENERATION_500_REPAIR.md) — historical; superseded for pre-handler class
- [`../creative-services/CREATIVE_SERVICES_ROADMAP.md`](../creative-services/CREATIVE_SERVICES_ROADMAP.md) — future architecture (Planned)

---

*Forensic sprint complete. No application runtime code modified.*
