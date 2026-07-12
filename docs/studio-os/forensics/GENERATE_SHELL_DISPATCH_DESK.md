# Generate Shell Public URL — Dispatch Desk Forensic Report

**Sprint:** P0 — “Camera Over the Dispatch Desk” + Contractor Directory micro-trace  
**Report date:** 2026-07-12  
**Classification:** Instrumentation only — **no repair**

---

## Purpose

Prove the **exact first unresolved internal operation** inside `generateShellPublicUrl()` after `create-shell-request` begins, when `network: []` and no exception is recorded.

---

## Activation

```
/admin/studio/experience-lab?compilerDiag=1
```

Shell Foundation Black Box panel → **GENERATE SHELL PUBLIC URL — DISPATCH DESK** section.

Shell Foundation Black Box panel → **GENERATE SHELL PUBLIC URL — DISPATCH DESK** → **CONTRACTOR DIRECTORY MICRO-TRACE**.

---

## GSPU-02 → GSPU-03 micro-marker map

| ID | Statement |
|----|-----------|
| GSPU-02a | Before `recordShellStage('create-shell-request', 'running')` |
| GSPU-02b | After `recordShellStage` returns |
| GSPU-02c | Before GSPU-02 success marker (try entry) |
| GSPU-02d | After GSPU-02 success marker |
| GSPU-02e | Before GSPU-03 running marker |
| GSPU-02f | After GSPU-03 running marker |
| GSPU-03a | Read `recipe.departmentId` (package key) |
| GSPU-03b | Before `ensureDepartmentPackageRegistryInitialized` |
| GSPU-03c | After registry init |
| GSPU-03d | Registry readiness check |
| GSPU-03e | Before `loadDepartmentPackage` Map lookup |
| GSPU-03f | After lookup returns |
| GSPU-03g | `requireDepartmentPackage` validation / throw |

---

## Documented Fact (post-Dispatch Desk evidence)

- Stall occurs **after GSPU-02** and **before GSPU-03**
- Auth, token, request helper, and fetch are **not reached**
- Duplicate-collision classification **was false** (wrapper + body instrumentation pair)
- Prior authorization/token theory **superseded**

## Inference

- If GSPU-02 remains running, stall is at `recordShellStage` (GSPU-02a/02b) or before try-entry (GSPU-02c)
- Package registry init is synchronous singleton — no promise unless `recordShellStage` notify blocks

## Unknown

- Exact active micro-marker on founder device until post-deploy mobile run

---

| ID | Label | Category |
|----|-------|----------|
| GSPU-01 | Enter generateShellPublicUrl | A — Input validation |
| GSPU-02 | Stage create-shell-request running | B — Context |
| GSPU-03 | Resolve department package | B — Context |
| GSPU-04 | Build generation payload | E — Payload |
| GSPU-05 | Attach validation ephemeral auth | C — Authorization |
| GSPU-06 | Enter requestStudioBuilderGenerate | F — Request helper |
| GSPU-07 | Enter ensureApiAccessToken | C — Authorization |
| GSPU-08 | Await getAccessToken (first) | C — Authorization |
| GSPU-09 | Await refreshSupabaseSessionOnce | C — Authorization |
| GSPU-10 | Await getAccessToken (second) | C — Authorization |
| GSPU-11 | ensureApiAccessToken returned | C — Authorization |
| GSPU-11b | Token missing — early return | C — Authorization |
| GSPU-12 | Resolve endpoint | F — Request helper |
| GSPU-13 | Prepare headers and body | F — Request helper |
| GSPU-14 | Fetch about to start | G — Fetch |
| GSPU-15 | Fetch started | G — Fetch |
| GSPU-16 | Fetch response received | H — Fetch response |
| GSPU-17 | Await response text | H — Fetch response |
| GSPU-18 | Parse response JSON | I — Response parsing |
| GSPU-19 | Record HTTP forensic | I — Response parsing |
| GSPU-20 | requestStudioBuilderGenerate returned | F — Request helper |
| GSPU-21 | Record shell network forensic | I — Response parsing |
| GSPU-22 | Validate API result | J — Result validation |
| GSPU-23 | Canvas fallback render | K — Return path |
| GSPU-24 | Return from generateShellPublicUrl | K — Return path |

---

## Instrumentation map

| Layer | File | Role |
|-------|------|------|
| Package micro-trace | `generate-shell-package-micro-trace.ts` | GSPU-02a…03g statement markers |
| Dispatch desk store | `generate-shell-dispatch-desk.ts` | Sub-stages, invocations, promise/auth/fetch forensics, stall classifier |
| Department package | `initialize.ts`, `department-package-registry.ts` | Registry boot + Map lookup forensics |
| Black box integration | `shell-foundation-black-box.ts` | `dispatchDesk` in export; wrapper invocation marker in `traceShellAsync` |
| Shell pipeline | `validation-shell-pipeline.ts` | `generateShellPublicUrl()` sub-stage + micro telemetry |
| Studio Builder API | `studioBuilder/api.ts` | Token, fetch, parse boundaries |
| Token path | `utils/api.ts` | `ensureApiAccessToken` await tracking |
| UI panel | `ShellFoundationBlackBoxPanel.tsx` | Dispatch Desk + Contractor Directory micro-trace |

---

## Documented Fact (pre-instrumentation evidence)

- Shell stops inside `generateShellPublicUrl()` at `create-shell-request`
- `network: []` — no observable HTTP completion
- `generateShellPublicUrl()` entered twice in function trace
- No exception, rejection, or shellId

## Inference (supported by instrumentation design)

- Duplicate function trace entries are **Category F**: `traceShellAsync` wrapper + inner `function-body` enter — not independent callers
- Stall before `GSPU-15-fetch-started` implies **fetch never invoked** (classification G) or **authorization wait** (classification C) at `GSPU-08`/`GSPU-09`/`GSPU-10`
- `withValidationEphemeralAuth` is **synchronous** — does not block on network

## Unknown (requires founder mobile run post-deploy)

- Exact sub-stage active at stall on production device
- Whether token path or fetch path is the unresolved await

---

## Duplicate entry classification

| Code | Meaning |
|------|---------|
| F | Wrapper (`traceShellAsync`) + inner (`function-body`) — expected duplicate trace |
| B | Same caller twice |
| C | Two independent callers |

---

## Stall classifications

A — Input validation wait  
B — Context preparation wait  
C — Authorization wait  
D — In-flight promise deadlock  
E — Request deduplication lock  
F — Request helper never returns  
G — Fetch never invoked  
H — Fetch pending  
I — Response parsing pending  
J — Duplicate invocation collision  
K — Lost event / deferred resolution  
L — Other

---

## Repair status

**None.** Instrumentation only. Next sprint narrows repair to proven sub-stage.

---

## Tests

- `generate-shell-dispatch-desk.test.ts`, `generate-shell-package-micro-trace.test.ts` — sub-stages, micro-markers, classifier correction, stalls, persistence
- `shell-foundation-black-box.test.ts` — dispatch desk in black box export

---

## Founder mobile workflow

1. Open Experience Lab with `?compilerDiag=1`
2. Tap **Start compile run**
3. Open **GENERATE SHELL PUBLIC URL — DISPATCH DESK**
4. Note: current sub-stage, last success, authorization state, fetch started, duplicate call, stall classification
5. **Copy** or **Export** full Shell Foundation JSON
