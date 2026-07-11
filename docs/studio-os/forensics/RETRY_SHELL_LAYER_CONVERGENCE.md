# P0 Forensic Report — Retry Shell Layer Convergence

**Sprint:** P0 Retry Shell Layer Root Cause Investigation (no speculative repairs)  
**Status:** Investigation complete — repair **not** deployed  
**Report date:** 2026-07-11  
**Production URL:** https://fsbw.vercel.app/admin/studio/experience-lab  
**Black Box:** https://fsbw.vercel.app/__world-compiler-investigation

---

## 1. Executive summary

Founder verification **invalidates** the prior claim that Creative Studio was restored. Both observed clients stop at the same user-visible state: **"Retry Shell Layer."**

**Code-proven finding:** "Retry Shell Layer" is **not a World Compiler pipeline stage**. It is a **generic viewport error affordance** in `SceneStackViewport.tsx` that appears whenever Scene Stack composite status is `failed`, regardless of which layer actually failed — unless `?compilerDiag=1` forensic freeze is active.

**Code-proven finding:** Creative Studio render and Experience Engine layer compilation at Experience Lab share **one runtime** (`experience-lab-render-runtime.runFullPipeline`) and **one Scene Stack driver** (`useSceneStack`). They do **not** diverge before the post-shell failure surface.

**Single root-cause candidate (first shared hard gate after Generate Shell):**

| Priority | Function | File | Line | Exception / code |
|----------|----------|------|------|------------------|
| **1 (primary)** | `assertShellImmutableForLayer` | `immutable-shell.ts` | 110–114 | `SHELL_NOT_LOCKED` — shell URL/lock unresolved before landmark request |
| **2 (alternate)** | `requestStudioBuilderGenerate` → `resolveLegacyCompatAuthorization` | `api.ts` / `legacy-adapters.ts` | 41–71 / 171–175 | `AUTH_REQUIRED` — governed landmark request after shell canvas fallback |
| **3 (alternate)** | `compileWorldStation` load-shell stage | `compile-pipeline.ts` | 254–267 | `SHELL_RECORD_MISSING` / `SHELL_RECOVERY_LOOKUP_MISMATCH` |

Prior restoration (`b3e4fe33c`) fixed **validationMode payload leakage** into `studio-builder-generate`. It did **not** fix ephemeral shell lock visibility for downstream layers, UI mislabeling, or shell-canvas-success masking layer auth failure. Founder production failure is **consistent with an incomplete restoration**, not a disproven diagnosis of leakage.

---

## 2. Primary question

> Why do BOTH clients now stop at "Retry Shell Layer" instead of diverging?

**Answer:** Because both are the same pipeline on the same route, and both surface the same mislabeled terminal UI when **any** generatable layer enters `failed` state after shell generation — most commonly the first post-shell gate (`signature-landmark`), not `environment-shell`.

---

## 3. What "Retry Shell Layer" actually is

### 3.1 UI source (not a compiler stage)

```288:297:src/components/admin/studio-os/creative-direction-studio/SceneStackViewport.tsx
          ) : (
            <>
              <p>Layer generation failed.</p>
              {onRegenerateLayer ? (
                <button
                  type="button"
                  className="cds-genesis__btn"
                  onClick={() => onRegenerateLayer('environment-shell')}
                >
                  Retry Shell Layer
```

**Trigger conditions:**

- `status === 'failed'` (from `getCompositeStatus` → `resolveStackCompositeStatus`)
- AND `layer1Failure?.state !== 'FAILED_AT_LAYER_1'`

`layer1Failure` is only populated when `?compilerDiag=1` and `freezeLayer1Failure()` ran (`CreativeStudioRenderPreview.tsx:127–142`). **Normal production sessions never get the accurate "LANDMARK GENERATION FAILED" panel.**

### 3.2 Composite status derivation

```38:43:src/studio-os-core/scene-stack/compose.ts
export function resolveStackCompositeStatus(
  layers: SceneStackLayerView[]
): SceneStackCompositeStatus {
  const generatable = layers.filter((l) => l.definition.generatable);
  if (generatable.some((l) => l.status === 'generating')) return 'building';
  if (generatable.some((l) => l.status === 'failed')) return 'failed';
```

Any layer in `errors` state → **entire viewport `failed`** → **Retry Shell Layer** button targets `environment-shell` even when `signature-landmark` failed.

### 3.3 World Compiler stage list (for comparison)

`WORLD_COMPILER_STAGES` includes `load-shell`, `lock-shell`, `mount-landmark`, etc. There is **no** `retry-shell-layer` stage. Pipeline status bar labels come from `computeRenderPipelineProgress` + `compileReport.stages`, which can disagree with the viewport button text.

---

## 4. Runtime comparison — Creative Studio vs Experience Engine

### 4.1 Terminology (Experience Lab)

| Label | Code reality |
|-------|----------------|
| **Creative Studio** | `CreativeStudioRenderPreview` — World Compiler viewport for a concept |
| **Experience Engine** (compiler context) | Same `runFullPipeline` after shell — layer stack + `compileStation` (Layer 1 = `signature-landmark`) |
| **Experience Engine DNA** (`/admin/studio/experience-engine`) | Separate workspace — **does not** use `SceneStackViewport` or "Retry Shell Layer" |

Founder observation at **Retry Shell Layer** implies failure on **`/admin/studio/experience-lab`**, not the DNA generator page.

### 4.2 Shared execution graph (identical code)

```
subscribeCompilerSession (experience-lab-render-runtime.ts:679)
  → runFullPipeline (line 397)
      → runExperienceLabValidationShellPipeline   [Generate Shell]
          → generateShellPublicUrl
              → requestStudioBuilderGenerate (may fail → canvas fallback)
          → registerValidationEnvironmentShell (ephemeral registry)
      → driver.ensureStation (skipEnvironmentShell: true)   [POST-SHELL — shared]
          → useSceneStack.generateLayer (per layer without publicUrl)
              → assertShellImmutableForLayer        [GATE 1]
              → requestStudioBuilderGenerate        [GATE 2]
          → compileWorldStation (inner, end of ensureStation) [GATE 3]
      → driver.compileStation (world-compile)               [GATE 4]
```

**Convergence point:** `ensureStation` with `validationMode: true`, `skipEnvironmentShell: true`, `previewCompileContext` (`experience-lab-render-runtime.ts:540–548`).

Both Creative Studio concepts (A/B/C) use separate runtime sessions but **identical** `runFullPipeline` implementation.

### 4.3 Do they execute identical code?

**Yes.** `useCreativeStudioRenderPreview` is a read-only subscriber; execution lives in `experience-lab-render-runtime.ts`. No Creative-Studio-only fork exists after Generate Shell.

---

## 5. Instrumented trace map (Generate Shell → Retry Shell Layer)

Existing Black Box instrumentation (no new code added this sprint):

| Step | Event / milestone | Source |
|------|-------------------|--------|
| Shell generate start | `PIPELINE_LIFECYCLE` `RUN_FULL_PIPELINE_ENTERED` | `experience-lab-render-runtime.ts:402` |
| Shell API attempt | `requestStudioBuilderGenerate` | `validation-shell-pipeline.ts:47` |
| Shell canvas fallback | `generationMethod: 'preview-canvas'` in shell result | `validation-shell-pipeline.ts:79–82` |
| Ephemeral register | `SHELL_REGISTERED` | `ephemeral-validation-registry.ts:49` |
| Ephemeral wipe (retry) | `SHELL_DELETED` / `SHELL_INVALIDATED` | `clearValidationPreviewSession` on `forceRegenerate: true` |
| Ensure station enter | `ENSURE_STATION_ENTERED` | `useSceneStack.ts:692` |
| Layer 1 enter (diag) | `LAYER_1_ENTERED` | `layer1-forensic.ts` (`?compilerDiag=1` only) |
| Shell immutability gate | `assertShellImmutableForLayer` → `SHELL_NOT_LOCKED` | `useSceneStack.ts:335` |
| Layer API | `GENERATION_REQUEST_STARTED` / `FAILED` | `layer1-forensic.ts` (diag only) |
| Load shell | `LOAD_SHELL_MILESTONE` M1–M7 | `compile-pipeline.ts` |
| Lock shell | M7 `shellLocked: true/false` | `compile-pipeline.ts:314–318` |
| UI composite failed | `getCompositeStatus === 'failed'` | `compose.ts:43` |
| Viewport Retry Shell | User sees button | `SceneStackViewport.tsx:296` |

### 5.1 Required Black Box export fields (founder device)

For the failing `compileRunId`, export from `/__world-compiler-investigation` and verify:

1. **entered Retry Shell Layer** — correlate `getCompositeStatus: failed` with last `PIPELINE_LIFECYCLE` / `COMPILE_STAGE_*` (not a named compiler stage).
2. **why retry began** — last `setErrors` layer key (`stationId:layerId`) or `COMPILE_FAILED` / `RUN_FULL_PIPELINE_UNHANDLED_REJECTION`.
3. **what object was missing** — `shellLock.resolution`, `registryMode`, `LOAD_SHELL_MILESTONE M4/M5`.
4. **what API failed** — `GENERATION_REQUEST_FAILED` response `code` (diag) or network tab `POST /api/admin/studio-builder-generate`.
5. **exception** — `failedStageDetail` on `compileReport` or error string on layer key.
6. **retry re-issued?** — `requestRuntimeRetry` resets to idle + `runFullPipeline` (`experience-lab-render-runtime.ts:703–711`); viewport button calls `regenerateLayer('environment-shell')` — **different retry paths**.
7. **identical parameters?** — `forceRegenerate: true` always clears ephemeral before shell regen.

---

## 6. First shared failure — evidence chain

### 6.1 Generate Shell often succeeds while pipeline still fails

```46:82:src/studio-os-core/creative-studio-preview/validation-shell-pipeline.ts
  try {
    const api = await requestStudioBuilderGenerate(...)
    if (api.ok && api.publicUrl) {
      return { publicUrl: api.publicUrl, method: 'studio-builder' };
    }
  } catch {
    /* fall through to canvas */
  }
  const dataUrl = renderValidationShellCanvas(recipe);
```

Shell can register as `draft_ready` in **ephemeral registry** via **canvas** (no governed auth). Founder sees Generate Shell complete; failure appears **immediately after** — at ensure-station / landmark, not at shell API.

**This invalidates judging restoration success by shell stage alone.**

### 6.2 Gate 1 — `assertShellImmutableForLayer` (before any landmark API)

```331:352:src/hooks/useSceneStack.ts
        const shellLock = resolveShellLockState(departmentId, projectId, stationId, {
          validationMode,
          ...(previewSessionId ? { previewSessionId } : {}),
        });
        const shellCheck = assertShellImmutableForLayer(layerId, shellLock);
        if (!shellCheck.ok) {
          failStudioAlphaGeneration(generationId, shellCheck.reason);
          setErrors((prev) => ({ ...prev, [key]: shellCheck.reason }));
          return false;
        }
```

```110:114:src/studio-os-core/scene-stack/world-compiler/immutable-shell.ts
    return {
      ok: false,
      code: 'SHELL_NOT_LOCKED',
      reason: `Environment Shell™ must be loaded before mounting ${targetLayerId}. Shell resolution: ${shellLock.resolution}...`,
```

**Failure object:** `shellLock` with `locked: false`  
**Typical cause:** ephemeral overlay miss → `getSceneStackLayerRecord` falls through to localStorage `environment-shell` not in `draft_ready`/`approved` (dual-registry issue documented in `SHELL_RECOVERY_STATE_MACHINE_AUDIT.md`).  
**Persistence:** error on `stationId:signature-landmark` key, **not** shell layer.  
**UI:** still shows **Retry Shell Layer**.

`ensureStation` **does not check** `generateLayer` return value (`useSceneStack.ts:715`) — pipeline continues to `compileWorldStation` even after Gate 1 failure.

### 6.3 Gate 2 — `AUTH_REQUIRED` on landmark (after shell canvas success)

If Gate 1 passes, landmark calls `requestStudioBuilderGenerate` with `resolveValidationCompileMode` + `withValidationEphemeralAuth`.

Server path (`studio-builder-generate.ts:98–109`):

1. `ensureValidationEphemeralAuth(body, actor)` — requires **complete compile scope** + admin actor
2. `resolveLegacyCompatAuthorization` — if no embedded grant and `legacyCompatEnabled() === false` → **`AUTH_REQUIRED`**

Restoration fixed client **leakage** of `validationMode` without scope. It does **not** guarantee landmark success if:

- Shell used canvas (never established client grant cache from successful shell API)
- First landmark request is first successful governed call (lazy auth should issue — **requires production trace to confirm**)
- Admin auth token missing on mobile (`MISSING_TOKEN` in `api.ts:44–50`)

**Prior forensic conclusion (Layer 1 AUTH_REQUIRED) remains a live alternate candidate** — not disproven by restoration commit.

### 6.4 Gate 3 — `load-shell` inside `ensureStation`

`ensureStation` ends with `compileWorldStation` (`useSceneStack.ts:724–730`). `load-shell` throws if `!shellLock.shellUrl` (`compile-pipeline.ts:254–267`). Ephemeral/register mismatch produces `SHELL_RECOVERY_LOOKUP_MISMATCH`.

---

## 7. Why the previous restoration claim was incorrect

| Claim (post-`b3e4fe33c`) | Founder-verified reality |
|--------------------------|---------------------------|
| Creative Studio restored | Still fails at post-shell terminal UI |
| Shared pipeline regression isolated | Both clients converge at same mislabeled state |
| Experience Engine separate blocker | Same `ensureStation` path fails for both |
| Verify on mobile Safari/Chrome | Pending / failed per founder report |

**What restoration actually changed:**

- `validation-compile-context.ts` — no `validationMode` without complete scope
- `useSceneStack.ts` — `resolveValidationCompileMode`
- `legacy-adapters.ts` — lazy auth gated on complete scope

**What restoration did not change:**

- `SceneStackViewport` Retry Shell Layer mislabel (non-diag)
- Ephemeral-only shell + `skipEnvironmentShell` + dual-registry lock lookup
- Shell canvas fallback masking partial pipeline health
- `ensureStation` ignoring failed `generateLayer` return values
- `forceRegenerate: true` clearing ephemeral on every full pipeline run

---

## 8. Retry semantics (two different "retry" paths)

| User action | Code path | Effect |
|-------------|-----------|--------|
| Viewport **Retry Shell Layer** | `onRegenerateLayer('environment-shell')` → `requestRuntimeRegenerateLayer` | Regenerates shell layer only; does not fix landmark failure |
| Footer **Run full render pipeline** | `requestRuntimeRetry` → `runFullPipeline` | Clears ephemeral (`forceRegenerate`), full shell regen + ensureStation |

**Retry reason displayed:** generic `"Layer generation failed."` — does not include actual `errors[stationId:layerId]` message in viewport (only in diag panel).

---

## 9. Root-cause requirement checklist

| Requirement | Status |
|-------------|--------|
| Exact function that fails | **Candidate 1:** `assertShellImmutableForLayer` · **Candidate 2:** `resolveLegacyCompatAuthorization` · **Candidate 3:** load-shell throw |
| Exact exception | `SHELL_NOT_LOCKED` / `AUTH_REQUIRED` / `SHELL_RECOVERY_LOOKUP_MISMATCH` — **confirm via Black Box + network on founder device** |
| Object causing Retry Shell Layer UI | `resolveStackCompositeStatus` → `failed` due to **any** layer `errors` entry; button hardcoded to `environment-shell` |
| Why both clients converge | Identical `runFullPipeline` + shared mislabel |
| Previous root cause incomplete? | **Yes** — leakage fix necessary but insufficient for end-to-end success |
| Previous restoration incorrect? | **Yes** — "restored" claim premature; shell can succeed while post-shell gates still fail |

---

## 10. Production capture protocol (no repair)

Run on **failing device** (normal Safari/Chrome, signed-in admin):

1. Open `https://fsbw.vercel.app/admin/studio/experience-lab?compilerDiag=1`
2. One manual compile tap — wait for Retry Shell Layer / COMPILE STOPPED
3. Export Black Box for `compileRunId`
4. Capture Network: `POST /api/admin/studio-builder-generate` after shell stage (landmark request) — save status, `code`, redacted body
5. Record: `shellPipelineResult.generationMethod` (`studio-builder` vs `preview-canvas`)
6. Record: `LOAD_SHELL_MILESTONE` M4 (`resolution`, `registryNamespace`), M7 (`shellLocked`)
7. Record: frozen `layer1Forensic` if `FAILED_AT_LAYER_1` (diag mode)

**Do not deploy fixes until one candidate is proven with steps 3–7.**

---

## 11. Conclusion

**Proven without production trace:**

1. "Retry Shell Layer" is a **UI mislabel** for generic Scene Stack `failed`, not proof that `environment-shell` failed.
2. Creative Studio and Experience Engine (Experience Lab compiler) share **one post-shell code path** — convergence is expected.
3. Prior restoration addressed **auth scope leakage**, not **post-shell shell-lock lookup** or **landmark governed generation** or **UI truthfulness**.

**Single root-cause candidate for repair approval (pending founder Black Box confirm):**

> After ephemeral shell registration, the first `generateLayer('signature-landmark')` call fails at **`assertShellImmutableForLayer`** because **`resolveShellLockState` cannot obtain a locked validation shell** (ephemeral overlay miss or localStorage fallback), **or** the subsequent **`requestStudioBuilderGenerate` returns `AUTH_REQUIRED`** when shell succeeded via canvas fallback and governed landmark auth does not complete.

**Spatial Architecture Review:** SKIPPED — forensic/docs sprint, no new surfaces.

---

*No production code changes in this sprint. Repair requires explicit founder approval after Black Box confirms candidate 1 or 2.*
