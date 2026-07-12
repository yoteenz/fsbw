# Layer 1 Generation 500 — Forensic Repair Report

**Sprint:** P0 Forensic Repair — Shared Experience Lab Layer 1 `signature-landmark`  
**Status:** Repair shipped — **production mobile verification pending founder**  
**Report date:** 2026-07-12  
**Spatial Architecture Review:** SKIPPED — P0 forensic repair, no new surfaces

---

## 1. Forensic root-cause report

### Exact first original exception (classification)

**Primary category: K — timeout / deployment-runtime constraint**  
**Contributing category: B — API route parsing / handler termination without JSON**

**Documented Fact:** Founder Black Box proves M1–M7 succeeded, `shellLocked = true`, `ensureStation` resolved, and the first failure is Layer 1 `signature-landmark` at `GENERATION_REQUEST_FAILED` with client message `Generation failed (500)`.

**Documented Fact:** That client string is **synthesized** in `requestStudioBuilderGenerate()` when the HTTP body is **not valid JSON** (`src/services/studio/studioBuilder/api.ts:69–71`).

**Documented Fact:** When the governed gateway returns structured JSON `{ ok: false, code: 'GENERATION_FAILED', error: '...' }`, the client **does not** show `Generation failed (500)`.

**Inference:** The production failure is a **Vercel platform termination** (`FUNCTION_INVOCATION_FAILED` or invocation timeout) or an **uncaught exception** in `api/admin/studio-builder-generate.ts` before `res.json()` — not a FAL error returned through the normal caught path.

**Documented Fact (local reproduction):** Full governed path `executeGovernedGeneration` → `generateStudioBuilderAsset` → `fal.subscribe('fal-ai/nano-banana-pro/edit')` completes in **~24s** with valid Supabase `publicUrl` when `FAL_KEY` is configured.

### Why generic 500 concealed the cause

| Layer | Behavior |
|-------|----------|
| Vercel platform | Uncaught throw or duration kill → plain text `FUNCTION_INVOCATION_FAILED`, not JSON |
| `studio-builder-generate.ts` (before repair) | No top-level `try/catch` — any uncaught throw escaped to platform |
| `studioBuilderGeneration.ts` (before repair) | `catch` kept `e.message` only — discarded FAL `ApiError.status`, `body`, `requestId` |
| `api.ts` client | `JSON.parse` failure → `Generation failed (${res.status})` |

### Why both Creative Studio and Experience Engine were affected

**Documented Fact:** Both surfaces converge on `experience-lab-render-runtime.runFullPipeline` → `useSceneStack.generateLayer` → `requestStudioBuilderGenerate` → `POST /api/admin/studio-builder-generate`.

---

## 2. Narrow repair (shipped)

| Change | Purpose |
|--------|---------|
| `api/_lib/creativeProduction/generation-error-diagnostics.ts` | Structured categories, cause chain, FAL ApiError preservation, safe logging |
| `api/admin/studio-builder-generate.ts` | Top-level `try/catch` — **always JSON**; `traceId`; `diagnostic` on failures |
| `api/_lib/creativeProduction/generation-gateway.ts` | Orchestration `try/catch`; provider diagnostics; `traceId` correlation |
| `api/_lib/studioBuilderGeneration.ts` | FAL ApiError status/body capture; hardened marble site-fetch fallback |
| `vercel.json` | `studio-builder-generate`: `maxDuration: 120`, `includeFiles: marble-half.png` |
| Tests | `generation-error-diagnostics.test.ts`, `layer1-generation-diagnostics.test.ts` |

**Explicit:** No parallel pipeline, no canvas fallback, no shell/registry/station changes.

---

## 3. Test report

```
npm run test -- \
  src/studio-os-core/creative-production/generation-error-diagnostics.test.ts \
  src/studio-os-core/creative-production/layer1-generation-diagnostics.test.ts \
  src/studio-os-core/creative-production/shared-generation-pipeline-regression.test.ts

Result: 13/13 passed
npx tsc --noEmit: pass
```

---

## 4. Production verification report

| Surface | Mobile Safari | Mobile Chrome |
|---------|---------------|---------------|
| Creative Studio Layer 1 | **Unknown — pending founder** | **Unknown — pending founder** |
| Experience Engine Layer 1 | **Unknown — pending founder** | **Unknown — pending founder** |

**Documented Fact:** Post-deploy API responses from `studio-builder-generate` will return JSON with `traceId` even on handler failures — Black Box `?compilerDiag=1` can correlate via `httpForensic.responseBodyPreview`.

**Inference:** If production still fails after deploy, the next Black Box export should show **structured JSON** with `diagnostic.category` instead of blank `Generation failed (500)` — unless failure is a hard platform kill before handler executes (import/bundling).

---

## 5. Founder verification checklist

1. https://fsbw.vercel.app/admin/studio/experience-lab?compilerDiag=1 — normal mobile Safari tab
2. Repeat normal mobile Chrome
3. Confirm M1–M7 pass, Layer 1 `signature-landmark` reaches `GENERATION_REQUEST_COMPLETED`
4. If failure persists, export Black Box — expect `traceId` + `diagnostic` in JSON body preview

---

*Repair artifact — complements `GENERATION_FAILED_500_TRACE.md` (evidence sprint).*
