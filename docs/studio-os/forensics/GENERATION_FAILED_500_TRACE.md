# Generation Failed (500) — Forensic Trace Report

**Sprint:** P0 Forensic Sprint — Trace True Source of `Generation failed (500)`  
**Status:** Evidence-gathering complete — **no repair authorized**  
**Report date:** 2026-07-11  
**Spatial Architecture Review:** SKIPPED — P0 forensic sprint, no new surfaces  
**Production URL:** https://fsbw.vercel.app  
**Black Box route:** https://fsbw.vercel.app/__world-compiler-investigation?compilerDiag=1

---

## Executive summary

Founder Black Box export proves **M1–M7 shell pipeline succeeded** (`shellLocked = true`, `compileWorldStation` completed). The first runtime failure is **Layer 1 `signature-landmark`** at `GENERATION_REQUEST_FAILED`.

The user-visible message **`Generation failed (500)`** is **not** a FAL provider message. It is **synthesized on the client** when `POST /api/admin/studio-builder-generate` returns **HTTP 500 with a body that cannot be parsed as JSON** (or empty). The original server/provider exception is **discarded at the client translation layer** before it reaches the Black Box `errorMessage` field.

**Primary classification:** **Server / Platform** — structured gateway JSON was not returned to the browser. Most likely **Vercel `FUNCTION_INVOCATION_FAILED`** (uncaught exception or platform timeout) rather than a FAL HTTP 500 surfaced through the governed gateway.

Shell success does **not** disprove this: the shell pipeline **silently falls back to canvas** when the same API fails (`validation-shell-pipeline.ts:72–82`). Layer 1 has **no fallback**.

---

## Deliverables (12)

### 1. Exact function where the original exception occurs

**Not provable from client export alone** — the browser never received structured JSON containing the original exception.

**Code-path candidates (server, in invocation order):**

| Priority | Function | File | Mechanism |
|----------|----------|------|-----------|
| **A (most likely)** | Vercel platform kill | — | Function exceeds platform `maxDuration` or OOM **before** handler returns JSON → plain-text `FUNCTION_INVOCATION_FAILED` |
| **B** | Uncaught throw in handler chain | `api/admin/studio-builder-generate.ts` | Handler has **no top-level try/catch** — any uncaught throw → `FUNCTION_INVOCATION_FAILED` |
| **C** | `fal.subscribe()` | `api/_lib/studioBuilderGeneration.ts:140` | Normally caught at `:165–166` and returned as JSON `{ code: 'GENERATION_FAILED', error: e.message }` — **unless** platform kills the invocation mid-await |
| **D** | `uploadLocalOrSiteRefToFal` / `downloadImageToBuffer` | `studioBuilderGeneration.ts:44–67` | Caught; would produce JSON error, not client `(500)` suffix |
| **E** | `executeGovernedGeneration` auth/graph | `generation-gateway.ts:153–213` | Returns structured errors (`AUTH_*`, `GENERATION_FAILED`) as JSON — would **not** produce client `Generation failed (500)` |

**Conclusion:** Original exception occurs **inside the Vercel invocation** of `studio-builder-generate` (during or after `executeGovernedGeneration` → `generateStudioBuilderAsset` → FAL), but the **exact line is masked** by platform non-JSON termination.

---

### 2. Exact function where it becomes `Generation failed (500)`

| Step | Function | File:line | What happens |
|------|----------|-----------|----------------|
| **Translation (user message)** | `requestStudioBuilderGenerate` | `src/services/studio/studioBuilder/api.ts:61–62` | `JSON.parse(text)` throws → `error: \`Generation failed (${res.status})\`` |
| **Alternate path** | `requestStudioBuilderGenerate` | `api.ts:67–68` | `!res.ok` + empty `data.error` → same template |
| **Black Box default code** | `useSceneStack.generateLayer` | `useSceneStack.ts:495` | `errorCode: result.code ?? 'GENERATION_FAILED'` — code undefined when parse fails |
| **Freeze attribution** | `freezeLayer1Failure` | `layer1-forensic.ts:158–178` | Records `failedFunction: requestStudioBuilderGenerate` (surfacing point, not root) |

**The `(500)` suffix is client-only.** Server gateway failures with valid JSON use `error: execResult.error ?? 'Generation failed'` **without** status suffix (`generation-gateway.ts:215–220`).

---

### 3. Original provider response

**Not captured in founder export.** Black Box `responseOutput` contained `error: "Generation failed (500)"` and no `code` — consistent with **no JSON body**.

After this sprint, `?compilerDiag=1` runs record `httpForensic.responseBodyPreview` on `GENERATION_REQUEST_FAILED` events (see § Black Box improvement).

**Expected raw body when this symptom appears:**

```
A server error has occurred

FUNCTION_INVOCATION_FAILED
```

or empty string.

---

### 4. Original provider HTTP code

**HTTP 500** from Vercel edge to browser — **not** necessarily FAL's HTTP status.

If FAL failed inside the caught path, server would return **JSON** 500 with `error` containing FAL `ApiError.message` — client would **not** show `Generation failed (500)`.

---

### 5. Original provider message

**Lost before Black Box.** Discarded at `api.ts:61–62` JSON parse catch.

Secondary loss points (if JSON had been returned):

| Location | Loss |
|----------|------|
| `studioBuilderGeneration.ts:165–166` | `e.message` only — **stack, `ApiError.status`, `body` discarded** |
| `generation-gateway.ts:215–220` | Wraps as `code: 'GENERATION_FAILED'` — preserves `error` string if present |

---

### 6. Full exception stack

**Not available** in founder export. Client catch at `api.ts:61` does not record stack. Server `studioBuilderGeneration.ts:165–166` does not attach stack to response.

---

### 7. Whether the provider was actually called

| Evidence | Inference |
|----------|-----------|
| Shell stage used same endpoint; may have failed → canvas fallback | API route **reachable** (auth + routing work) |
| Layer 1 reached `GENERATION_REQUEST_STARTED` | Client **did** invoke `POST /api/admin/studio-builder-generate` |
| `Generation failed (500)` | Response was **non-JSON 500** — consistent with **platform failure during long FAL `subscribe`**, not proof FAL responded |
| `maxDuration: 120` on handler | FAL image edit can exceed Hobby limits; platform may kill at 10s/60s |

**Verdict:** **Unknown — likely reached FAL `fal.subscribe` await, but FAL response not returned to client.** Confirm via Vercel function logs for `studio-builder-generate` on failing `compileRunId`.

---

### 8. Whether the server failed before provider execution

**Unlikely but possible.**

Pre-provider steps that return **JSON** (would not produce this symptom):

- `resolveAdminAuth` → 401/403 JSON
- `adaptLegacyBuilderRequest` / `resolveLegacyCompatAuthorization` → 403 `AUTH_REQUIRED` JSON
- `representGovernedGenerationRequest` → structured error JSON
- `runCieIfRequired` → skipped for `exploratory_draft` ephemeral auth (`legacy-adapters.ts:217`)

If auth failed, client would show `AUTH_REQUIRED` or admin auth messages — **not** `Generation failed (500)`.

**Verdict:** Server likely passed auth/gateway representation and **failed during or after** `generateStudioBuilderAsset` provider execution, or timed out in that phase.

---

### 9. Whether the adapter failed after provider execution

Possible post-FAL failures (normally JSON):

- `Fal returned no image URL` (`studioBuilderGeneration.ts:152`)
- `Download failed` / Supabase upload (`:64–66`, `:104–109`)

These return `{ ok: false, error: '...' }` → gateway `GENERATION_FAILED` JSON → client shows specific string.

**Verdict:** Post-provider adapter failure **unlikely** to be the source of the exact `Generation failed (500)` message unless combined with platform crash before response flush.

---

### 10. Error classification

| Class | Applies? |
|-------|----------|
| **Provider (FAL)** | Possible root inside invocation; **not proven** at HTTP boundary |
| **Server** | **Yes** — non-JSON 500 from API route |
| **Network** | Possible if connection reset; same client symptom |
| **Payload** | **Unlikely** — malformed payload returns **400 JSON** (`studio-builder-generate.ts:60–64`) |
| **Serialization** | **Yes (client)** — JSON parse failure |
| **Authorization** | **Ruled out** for this symptom — would be 403 JSON |
| **Environment** | **Likely** — Vercel duration limits, missing `includeFiles` for marble ref (mitigated by site fetch fallback) |
| **Configuration** | Possible — `FAL_KEY` missing returns JSON 503 with `FAL_KEY` in message |
| **Unknown** | Original exception line without server logs |

**Primary:** **Server / Platform + Client serialization**  
**Secondary hypothesis:** **Environment (function timeout during FAL subscribe)**

---

### 11. Complete forensic timeline

```
[M1–M7] Shell pipeline (Experience Lab validation)
  compile preview spec
    → generate shell: POST /api/admin/studio-builder-generate
        → (may fail silently) → renderValidationShellCanvas fallback
    → register ephemeral shell
    → verify shell mount
    → shellLocked = true
  ensureStation
  compileWorldStation (shell stage complete)

[Layer 1] signature-landmark
  LAYER_1_ENTERED
  LANDMARK_REQUEST_CREATED
    payload: scene-stack-layer-generate-v1 forensic (layerId, stationId, blueprint, auth fields)
  GENERATION_REQUEST_STARTED
    endpoint: POST /api/admin/studio-builder-generate
  requestStudioBuilderGenerate()  [client]
    → apiFetch POST
  ← HTTP 500, non-JSON body
  JSON.parse throws → "Generation failed (500)"  [CLIENT TRANSLATION]
  GENERATION_REQUEST_FAILED
    errorCode: GENERATION_FAILED (default — no parsed code)
    errorMessage: Generation failed (500)
  freezeLayer1Failure → FAILED_AT_LAYER_1
  COMPILER_TERMINATED

[Server path — inferred, not in export]
  handler studio-builder-generate.ts
    → resolveAdminAuth ✓
    → ensureValidationEphemeralAuth (lazy ephemeral grant)
    → adaptLegacyBuilderRequest (exploratory_draft)
    → executeGovernedGeneration
        → representGovernedGenerationRequest ✓
        → runCieIfRequired → skip (non-material)
        → executeBuilderGeneration
            → generateStudioBuilderAsset
                → fal.subscribe('fal-ai/nano-banana-pro/edit')
                → [FAILURE or platform kill — no JSON returned]
```

---

### 12. Smallest possible repair recommendation (NOT IMPLEMENTED)

**Option A — Forensic-first (smallest, recommended for founder approval):**

1. Add top-level `try/catch` in `api/admin/studio-builder-generate.ts` that returns JSON `{ ok: false, code: 'FUNCTION_ERROR', error, stack }` — **preserves** original exception in response (Black Box already extended client-side).
2. Add `includeFiles: "public/assets/marble-half.png"` to `vercel.json` for `studio-builder-generate` (parity with `studio-generate-asset.ts`).
3. Confirm Vercel plan `maxDuration` for this route (handler declares 120; Hobby may cap lower).

**Option B — If logs prove FAL timeout:**

- Queue/async pattern for Layer 1 (like `liveTryOnStudio.ts` queue comment) — **larger scope**, needs separate sprint.

**Option C — Client-only quick win:**

- In `api.ts`, when JSON parse fails, surface `responseBodyPreview` in error string for diag + admin — does not fix generation.

**Do not:** add Layer 1 canvas fallback, enable `CREATIVE_PRODUCTION_ALLOW_LEGACY_COMPAT`, or change shell pipeline.

---

## Error translation map (every collapse point)

```
Provider FAL ApiError
  ↓ catch studioBuilderGeneration.ts:165 — keeps e.message only
generateStudioBuilderAsset { ok: false, error }
  ↓ generation-gateway.ts:215–220 — code: GENERATION_FAILED
executeGovernedGeneration { ok: false, code, error }
  ↓ studio-builder-generate.ts:126–135 — res.status(500).json(result)
HTTP 500 JSON body
  ↓ api.ts:57–68
  IF JSON parse OK → user sees data.error (NOT "Generation failed (500)")
  IF JSON parse FAIL → "Generation failed (500)"  ← FOUNDER SYMPTOM
```

**Additional client collapse:** `adminApiAuthErrorMessage` only special-cases 401/403/503 — 500 passes through `data.error` when JSON valid.

---

## Request payload verification (Layer 1)

Fields captured in `requestInputForensic` (`useSceneStack.ts:438–462`):

| Field | Source | Notes |
|-------|--------|-------|
| `layerId` | `signature-landmark` | ✓ |
| `stationId` | compile context | Required for lazy ephemeral auth |
| `projectId` | station | ✓ |
| `departmentId` | package | ✓ |
| `compiledHeroAssetId` | `compileSceneStackLayerPrompt` | ✓ |
| `compiledProductionGroupId` | `scene-stack-{stationId}-{layerId}` | ✓ |
| `blueprintId` | compiled | ✓ |
| `promptVersion` | compiled | ✓ |
| `authorizationMode` | server-issued ephemeral | ✓ |
| `validationMode` | scope-gated | ✓ when complete context |
| `aspectRatio` / `outputFormat` | compiled | ✓ |
| `referenceImageUrls` | shell lock | **data: URLs stripped server-side** (`studio-builder-generate.ts:89–91`) → marble/site fallback |
| `forceGenerate` | true for new layer | ✓ |
| `productionAuthorizationId` | client grant or lazy server | ✓ after B1 repair |

**Malformed payload unlikely** — would yield **400 JSON**, not non-JSON 500.

---

## Server instrumentation gaps

| Gap | File |
|-----|------|
| No top-level try/catch | `api/admin/studio-builder-generate.ts` |
| Stack discarded | `studioBuilderGeneration.ts:165–166` |
| No provider status/body in gateway result | `generation-gateway.ts:215–220` |
| No `includeFiles` for marble asset | `vercel.json` (unlike `studio-generate-asset`) |

---

## Black Box improvement (shipped this sprint)

**New module:** `src/studio-os/diagnostics/world-compiler-investigation/generation-request-forensic.ts`

When `?compilerDiag=1`, `requestStudioBuilderGenerate` records:

- `httpStatus`, `responseBodyPreview`, `responseBodyLength`
- `jsonParseSucceeded`, `parsedCode`, `parsedError`
- `contentType`, `elapsedMs`
- `clientTranslation`, `translationLayer`, `responseClass`
- `synthesizedUserMessage`

Attached to `GENERATION_REQUEST_FAILED` events and `freezeLayer1Failure.responseOutput.httpForensic`.

Future exports will show **raw Vercel body** (e.g. `FUNCTION_INVOCATION_FAILED`) instead of only `Generation failed (500)`.

---

## What this sprint explicitly ruled out

Per founder Black Box evidence — **not primary failure** for this incident:

- Shell locking / immutable shell assertion
- Registry namespace mismatch
- Retry Shell Layer UI mislabel (downstream of failure)
- Shell lookup / preview registry recovery
- `AUTH_REQUIRED` (would not produce `Generation failed (500)`)

---

## Verification steps for founder

1. Open https://fsbw.vercel.app/admin/studio/experience-lab?compilerDiag=1
2. Run compile until Layer 1 fails
3. Export from https://fsbw.vercel.app/__world-compiler-investigation
4. Inspect `GENERATION_REQUEST_FAILED.detail.httpForensic.responseBodyPreview`
5. Cross-check Vercel → Project → Logs → filter `studio-builder-generate` for same timestamp / `compileRunId`

---

## Files referenced

| Role | Path |
|------|------|
| Client translation | `src/services/studio/studioBuilder/api.ts` |
| API handler | `api/admin/studio-builder-generate.ts` |
| Gateway | `api/_lib/creativeProduction/generation-gateway.ts` |
| FAL adapter | `api/_lib/studioBuilderGeneration.ts` |
| Layer 1 caller | `src/hooks/useSceneStack.ts` |
| Shell fallback | `src/studio-os-core/creative-studio-preview/validation-shell-pipeline.ts` |
| Black Box Layer 1 | `src/studio-os/diagnostics/world-compiler-investigation/layer1-forensic.ts` |
| HTTP forensic | `src/studio-os/diagnostics/world-compiler-investigation/generation-request-forensic.ts` |

---

**Repair shipped:** See `docs/studio-os/forensics/LAYER1_GENERATION_500_REPAIR.md` (2026-07-12).
