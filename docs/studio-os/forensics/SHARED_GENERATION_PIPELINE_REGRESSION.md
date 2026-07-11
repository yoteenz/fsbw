# Shared Generation Pipeline Regression — Forensic Report

**Sprint:** Creative Studio + Experience Engine Shared Pipeline Regression Forensic  
**Status:** Restoration shipped (validation context gating + lazy auth hardening)  
**Report date:** 2026-07-11  
**Production URL:** https://fsbw.vercel.app

---

## 1. Incident summary

A B1 repair sprint introduced Experience Lab ephemeral authorization through the shared `studio-builder-generate` governed generation gateway. The repair intended to fix Experience Engine Layer 1 `AUTH_REQUIRED` failures but contaminated the shared pipeline:

1. Client payloads began always carrying Experience Lab validation fields (`validationMode`, `compileRunId`, scope IDs).
2. A blocking pre-pipeline call to `/api/admin/experience-lab-ephemeral-authorization` failed on Vercel with `FUNCTION_INVOCATION_FAILED`, stalling the pipeline at **Compile Preview Spec**.
3. Lazy server auth (`ensureValidationEphemeralAuth`) in `ff19d5016` removed the blocking call but left **mode leakage**: global `isExperienceLabValidationRender()` could classify requests as validation compiles without complete compile scope, sending `validationMode: true` without a grant and without satisfying lazy-auth prerequisites.
4. Creative Studio (Experience Lab validation shell + World Compiler path at `/admin/studio/experience-lab`) regressed alongside Experience Engine.

This sprint **did not** redesign Model Orchestrator, Scene Stack, or authorization governance. It isolates root cause, restores Creative Studio governed generation for complete validation compiles, and leaves the remaining Experience Engine failure visible.

---

## 2. Last known good commit

| Field | Value |
|-------|--------|
| **SHA** | `7f4e73553` |
| **Message** | Boot hygiene: quarantine stale storage, skip bootstrap on isolated routes, fix post-load guard |
| **Deployed URL** | https://fsbw.vercel.app (pre-B1 auth commits) |
| **Observed success** | Creative Studio shell pipeline completed via **canvas fallback** when `studio-builder-generate` returned `AUTH_REQUIRED`; preview spec compile and ephemeral shell registration succeeded |
| **Caveat** | Layer 1 governed generation was already failing with `AUTH_REQUIRED` in production (documented B1); shell success masked partial pipeline health |

---

## 3. First bad commit

| Field | Value |
|-------|--------|
| **SHA** | `2408310f3` |
| **Message** | Experience Lab: ephemeral validation productionAuthorizationId (Option A B1 fix) |
| **Suspect range** | `7f4e73553` … `ff19d5016` (inclusive) |
| **Pipeline-blocking regression** | `49e48c7e4` — blocking `requestExperienceLabEphemeralAuthorization` before shell pipeline; `FUNCTION_INVOCATION_FAILED` at Compile Preview Spec |
| **Partial repair** | `ff19d5016` — lazy `ensureValidationEphemeralAuth` on generate; removed blocking pre-pipeline auth |

**FIRST_GOOD_COMMIT:** `7f4e73553`  
**FIRST_BAD_COMMIT:** `2408310f3` (shared payload contamination); `49e48c7e4` (first full pipeline block)  
**PROVEN_FAILURE_INTRODUCED:** Experience Lab validation fields applied globally to `studio-builder-generate` without guaranteed server-issued authorization; incomplete validation context produced `AUTH_REQUIRED` on governed paths previously masked by shell canvas fallback.

---

## 4. Exact first failing runtime event

| System | First failing event | Stage | HTTP / code |
|--------|---------------------|-------|-------------|
| Experience Engine (post-49e48c7e4) | `requestExperienceLabEphemeralAuthorization` rejection | Compile Preview Spec | `FUNCTION_INVOCATION_FAILED` / `AUTH_ISSUE_FAILED` |
| Creative Studio (post-2408310f3) | `requestStudioBuilderGenerate` governed auth rejection | Generate Shell or Layer 1 | `403` / `AUTH_REQUIRED` |
| Shared gateway | `resolveLegacyCompatAuthorization` — `validationMode: true` without embedded grant and incomplete scope | studio-builder-generate adapter | `AUTH_REQUIRED` |

Black Box route: https://fsbw.vercel.app/__world-compiler-investigation

---

## 5. Creative Studio request path

```
/admin/studio/experience-lab (CreativeStudioRenderPreview)
  → useCreativeStudioRenderPreview (subscriber)
  → experience-lab-render-runtime.runFullPipeline
  → runExperienceLabValidationShellPipeline (shell)
      → withValidationEphemeralAuth → requestStudioBuilderGenerate
      → POST /api/admin/studio-builder-generate
  → SceneStackDriver.ensureStation / compileStation
  → useSceneStack.generateLayer
      → withValidationEphemeralAuth → requestStudioBuilderGenerate
      → POST /api/admin/studio-builder-generate
  → ensureValidationEphemeralAuth (server lazy)
  → adaptLegacyBuilderRequest
  → executeGovernedGeneration → Model Orchestrator → FAL provider
```

---

## 6. Experience Engine request path

Same entry route and runtime as Creative Studio (`/admin/studio/experience-lab`). Experience Engine Layer 1+ uses the Scene Stack / World Compiler branch after shell registration:

```
compile preview spec → shell pipeline → ensure station → compileStation (layers)
  → Layer 1 (signature-landmark) governed generation
  → authorization resolution (lazy ephemeral or AUTH_REQUIRED)
```

---

## 7. Shared-component boundary

**First shared component used by both paths:**

| Node | File | Function |
|------|------|----------|
| Governed generation API | `api/admin/studio-builder-generate.ts` | `handler` |
| Legacy adapter | `api/_lib/creativeProduction/legacy-adapters.ts` | `ensureValidationEphemeralAuth`, `adaptLegacyBuilderRequest`, `resolveLegacyCompatAuthorization` |
| Generation gateway | `api/_lib/creativeProduction/generation-gateway.ts` | `executeGovernedGeneration` |

Client-side shared boundary: `src/services/studio/studioBuilder/api.ts` → `requestStudioBuilderGenerate`.

---

## 8. Request payload diff (redacted structural)

| Field | Last good (`7f4e73553`) | Failing (post-2408310f3) | Current (restored) |
|-------|-------------------------|--------------------------|-------------------|
| `validationMode` | absent | `true` (global inference) | `true` only with complete compile scope |
| `compileRunId` | absent | present / partial | required for validation mode |
| `previewSessionId` | absent | present | required for validation mode |
| `stationId` | absent | sometimes missing in adapter execution | required; propagated to execution |
| `productionAuthorizationId` | absent | hardcoded / missing grant | server lazy `auth-xelab-{compileRunId}` |
| `productionAuthorization` | absent | missing until lazy auth | server-issued embedded object |
| `org_id` | default `frontal-slayer` | `companyId` slug | unchanged |

---

## 9. Authorization lifecycle

1. **Issuance:** `ensureValidationEphemeralAuth` in `studio-builder-generate` when `validationMode: true` and **complete** compile scope (all of: compileRunId, previewSessionId, organizationId, departmentId, stationId, projectId).
2. **Signing:** `signProductionAuthorization` via `api/_lib/creativeProduction/authorization-signing.ts` (signature stripped before HMAC — fixed in `ff19d5016`).
3. **Attachment:** Client `attachEphemeralCompileAuth` passes validation context; attaches cached grant when present.
4. **Verification:** `resolveLegacyCompatAuthorization` → `validateEphemeralValidationAuthorization` (compile, org, preview scope).
5. **Expiration:** 30-minute TTL (`EXPERIENCE_LAB_EPHEMERAL_TTL_MS`).
6. **Persistence:** In-memory client grant only; server stateless per invocation (no Vercel in-memory assumptions).

**Answers to authorization forensic questions:**

| # | Question | Answer |
|---|----------|--------|
| 1 | Does Creative Studio invoke `ensureValidationEphemeralAuth()`? | Yes, when shell/layer requests include complete validation context |
| 2 | Did it before the change? | No (pre-2408310f3) |
| 3 | Incorrectly treated as Experience Lab validation? | Yes — via `isExperienceLabValidationRender()` default without scope |
| 4 | `validationMode` defaulting incorrectly? | Yes — global module ref-count, not per-request scope |
| 5 | Missing field causing wrong mode? | Yes — missing `stationId` blocked lazy auth |
| 6 | Scope too narrow/malformed? | No when complete; malformed when partial |
| 7 | Issued but rejected later? | Possible on org/compile mismatch |
| 8 | Server memory only? | No durable store; each invocation self-contained |
| 9 | Excessive imports / invocation failure? | `49e48c7e4` endpoint failed cold start; lazy path reuses studio-builder bundle |
| 10 | Auth creation blocks Creative Studio? | Blocking pre-pipeline auth in 49e48c7e4 blocked entire pipeline |
| 11 | OPTIONS/GET/POST same module? | Yes — single handler |
| 12 | Signed payload incompatible? | No — types align; verify fix in ff19d5016 correct |
| 13 | Worker different auth ID? | No when lazy auth used end-to-end |
| 14 | Resolver throws before generation? | Returns `AUTH_REQUIRED` / scope codes, not throw |
| 15 | Empty ID replacing valid credential? | No — Creative Studio never had production auth in validation path |

---

## 10. Serverless failure evidence

| Event | Endpoint | Symptom | Mitigation |
|-------|----------|---------|------------|
| B1 blocking auth | `/api/admin/experience-lab-ephemeral-authorization` | `FUNCTION_INVOCATION_FAILED` | Removed blocking call (`ff19d5016`); endpoint optional |
| Lazy auth | `/api/admin/studio-builder-generate` | No invocation failure when scope complete | `ensureValidationEphemeralAuth` inline |

Endpoint remains available for explicit grants but is **not** required for pipeline start.

---

## 11. Root cause

**Shared-path validation mode leakage:** Commit `2408310f3` attached Experience Lab validation fields to all governed generation requests through `withValidationEphemeralAuth` while `useSceneStack` defaulted `validationMode` from global `isExperienceLabValidationRender()` without requiring complete compile scope. In production (`legacyCompatEnabled() === false`), requests with `validationMode: true` but without server-issued authorization received `AUTH_REQUIRED`, breaking governed shell and layer generation. Commit `49e48c7e4` compounded this by blocking the pipeline before shell work when the ephemeral authorization endpoint failed on Vercel.

---

## 12. Why prior fixes failed

| Attempt | Commit | Why it failed |
|---------|--------|---------------|
| Hardcoded ephemeral ID | 2408310f3 | Server-side static ID; no compile scope; not governance-compliant |
| Blocking pre-pipeline auth | 49e48c7e4 | Separate serverless function failed cold start; blocked Compile Preview Spec |
| Lazy auth only | ff19d5016 | Removed blocking call but left client mode leakage and incomplete adapter execution context |

---

## 13. Why Creative Studio was affected

Creative Studio and Experience Engine share the same Experience Lab runtime and `studio-builder-generate` gateway. B1 changes targeted Experience Engine but modified shared adapter code, client payload builders, and global validation render mode — not an Experience-Engine-only fork.

---

## 14. Restoration diff

| File | Change |
|------|--------|
| `src/studio-os-core/creative-production/validation-compile-context.ts` | **NEW** — complete scope gating helpers |
| `src/studio-os-core/creative-production/ephemeral-compile-auth-session.ts` | Do not leak `validationMode` without complete scope or grant |
| `src/hooks/useSceneStack.ts` | `resolveValidationCompileMode` — explicit scope required |
| `api/_lib/creativeProduction/legacy-adapters.ts` | Server lazy auth uses complete-scope gate; execution carries `previewSessionId`, `stationId`, `compileRunId` |
| `src/studio-os-core/creative-production/shared-generation-pipeline-regression.test.ts` | **NEW** — 7 regression tests |
| `src/studio-os-core/creative-production/ephemeral-compile-auth.test.ts` | Incomplete context leakage test |

---

## 15. Remaining Experience Engine issue

**Classification:** Multiple — primarily **A/C** (authorization issuance path now works with complete scope; Layer 1 may still fail on scope mismatch or provider/persistence).

With restoration, governed validation compiles with **complete** preview context should receive lazy ephemeral authorization. Experience Engine Layer 1 failures that persist after deploy should be triaged separately as:

- **C** — authorization verification / org slug mismatch (`companyId` vs `org_id`)
- **G** — provider generation failure (FAL_KEY, model)
- **I** — UI/compiler desync

Do **not** merge Experience Engine repair into this diff unless the same root cause is proven in production traces.

---

## 16. Regression-test coverage

| # | Requirement | Test |
|---|-------------|------|
| 1 | Creative Studio normal generation without Experience Lab fields | `shared-generation-pipeline-regression.test.ts` |
| 2 | Preview validation with complete scope → lazy auth | same |
| 3 | Experience Engine lazy auth on generate | `ephemeral-compile-auth.test.ts` |
| 4 | Compile/org/session scope enforcement | `ephemeral-validation-auth` tests |
| 5 | Creative Studio not classified without scope | `validation-compile-context` + `attachEphemeralCompileAuth` |
| 6 | Incomplete context does not mutate requests | `attachEphemeralCompileAuth` incomplete test |
| 7 | Auth helper failure does not crash unrelated routes | incomplete context returns unchanged body |
| 8–15 | Serverless / expiry / scope / UI | partial — see test file; expand in follow-up if needed |

---

## 17. Deployment and device verification

| Step | Status |
|------|--------|
| Local tests | 17/17 pass (`creative-production/*.test.ts`) |
| Production deploy | Pending founder verify post-push |
| Creative Studio mobile Safari | Founder checklist required |
| Creative Studio mobile Chrome | Founder checklist required |
| Black Box | https://fsbw.vercel.app/__world-compiler-investigation |

---

## 18. Known unknowns

- Exact Vercel deployment IDs for `7f4e73553` and `2408310f3` (commit SHAs documented; deployment IDs require Vercel dashboard).
- Whether production `CREATIVE_PRODUCTION_ALLOW_LEGACY_COMPAT` env flag is set.
- Live FAL provider behavior under founder account on mobile networks.

---

## 19. What was not changed

- Model Orchestrator architecture
- Scene Stack / World Compiler orchestration
- No second generation gateway
- No authorization bypass or hardcoded `productionAuthorizationId`
- No canonical stack / registry mutation
- Black Box instrumentation preserved
- `/api/admin/experience-lab-ephemeral-authorization` retained (optional explicit grant)

---

## Founder test routes

**Creative Studio:**

```
https://fsbw.vercel.app/admin/studio/experience-lab
```

**Experience Engine / Experience Lab:**

```
https://fsbw.vercel.app/admin/studio/experience-lab
```

**World Compiler Investigation Recorder:**

```
https://fsbw.vercel.app/__world-compiler-investigation
```

**Diagnostic recovery:**

```
https://fsbw.vercel.app/__studio-os-recovery
```
