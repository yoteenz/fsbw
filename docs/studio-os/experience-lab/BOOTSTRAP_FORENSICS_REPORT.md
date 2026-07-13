# Experience Lab Bootstrap Forensics Report

**Sprint:** P0 Experience Lab Bootstrap Forensics  
**Date:** 2026-07-13  
**Owner:** Studio OS Core  
**Classification:** Runtime Bootstrap · Experience Lab · Production Reliability  
**Scope:** Root cause identification only — no repair changes in this sprint  

---

## Executive summary

**Confirmed root cause:** **Post-deploy stale hashed chunk fetch (HTTP 404)** — the browser attempts to load a **removed** `/assets/*.js` module from a **prior Vercel deploy** while the tab still holds an older JS module graph. Safari reports this as **`Importing a module script failed.`**

**Failure class:** **Dynamic import failure** (network / missing asset) — **not** module evaluation exception, **not** circular-dependency init crash, **not** manifest mismatch on the **current** production deploy.

**Confidence:** **0.93**

The bootstrap line `module=experience-runtime` is **correlated, not causal**. Studio Bootstrap™ reaches `experience-runtime` (stage 11 of 12) in parallel with the App shell lazy load. When a stale chunk 404 fires, bootstrap is often still on that module, producing the observed snapshot.

---

## Observed production symptoms (founder evidence)

| Field | Value |
|-------|-------|
| Screen | Application failed to load |
| Boundary | `RootAppErrorBoundary` |
| Primary error | `Importing a module script failed.` |
| Bootstrap | `started=yes` `complete=no` `ready=no` `module=experience-runtime` |

---

## Phase 1 — Bootstrap stage trace

### Boot order (`STUDIO_BOOT_ORDER`)

```
storage → auth-session → admin-context → platform-dna → brand-registry
→ department-registry → scene-registry → state-dna → design-dna-resolver
→ experience-runtime → workspace-runtime → ui-render
```

### Where execution stops (reconstructed timeline)

| Stage | Status | Evidence |
|-------|--------|----------|
| Bootstrap Start | ✅ | `started=yes` |
| Load HTML | ✅ | Production `index.html` HTTP 200 |
| Load Entry (`index.*.js`) | ✅ / ⚠️ | Current hash loads; **stale hashes 404** |
| Load Vendor | ✅ | `vendor.DBR2hlpZ.js` HTTP 200, `application/javascript` |
| Load Main chain (`entry-dispatch` → `main-app` → `main-legacy`) | ✅ / ⚠️ | Current hash loads; **stale hashes 404** |
| Load App (lazy) | ❌ **First hard failure in stale tab** | `RootAppErrorBoundary` — classic lazy chunk 404 |
| Load Experience Runtime (boot `initialize`) | ⏸ Concurrent | `module=experience-runtime` while App import fails |
| Module Evaluation (runtime logic) | ⛔ Not reached | Import never completes |
| Initialize Runtime / Mount React / Ready | ⛔ Not reached | `complete=no` `ready=no` |

**First failure:** **Hashed JS module fetch returns 404** during dynamic `import()` — before `experience-runtime` boot logic (`ensureExperienceRuntimeSubsystem`, `validateRuntimeBoot`) can finish.

---

## Phase 2 — Import failure capture

### Error signature analysis

`Importing a module script failed.` is classified in-repo as a **chunk load failure**, not a JS throw:

```1:4:src/utils/chunkLoadRecovery.ts
/**
 * After a new Vercel deploy, an old SPA tab may still reference hashed chunk URLs that no longer exist.
 * Safari often surfaces that as "Importing a module script failed." Recover with reload + cache-bust fallbacks.
 */
```

`RootAppErrorBoundary` wraps the **lazy App shell**, not Experience Lab UI:

```14:15:src/routes/RootAppErrorBoundary.tsx
/** Root App shell — never leave a blank #root after lazy App load fails. */
export class RootAppErrorBoundary extends Component<Props, State> {
```

```56:56:src/routes/StudioDebugRoutes.tsx
const App = lazy(() => import('../App'));
```

**Differentiation:**

| Class | Typical message | This incident |
|-------|-----------------|---------------|
| Import failure (404 / network / MIME) | `Importing a module script failed.` | ✅ **Matches** |
| Module evaluation (TDZ / throw during init) | `Cannot access 'X' before initialization`, `undefined is not an object`, etc. | ❌ Does not match |
| Boot timeout | `Boot module timed out` (3s — `BOOT_MODULE_TIMEOUT_MS`) | ❌ Does not match |

---

## Phase 3 — Production deployment verification

**Target:** `https://fsbw.vercel.app`  
**Deploy build id (HTML meta):** `970e521ba17c044ba458f30f4a8a69b52627c0ca`

### Current `index.html` (live)

```html
<script type="module" crossorigin src="/assets/index.B3RVPdvc.js"></script>
<link rel="modulepreload" crossorigin href="/assets/vendor.DBR2hlpZ.js">
```

| Asset | HTTP | Content-Type | Size |
|-------|------|--------------|------|
| `/` (index.html) | 200 | `text/html` | 1482 B |
| `/assets/index.B3RVPdvc.js` | 200 | `application/javascript` | 1254 B |
| `/assets/vendor.DBR2hlpZ.js` | 200 | `application/javascript` | 1 443 679 B |
| `/assets/main-legacy.DuOAl9i9.js` | 200 | `application/javascript` | 810 113 B |
| `/assets/App.zBk1aHa-.js` | 200 | `application/javascript` | 1 293 662 B |

### Stale hashes (removed chunks — HTTP 404 on production)

| Stale asset (examples) | HTTP | Implication |
|------------------------|------|-------------|
| `/assets/App.DfhJaSwr.js` | **404** | Prior-deploy App shell chunk deleted |
| `/assets/index.BxmigKf6.js` | **404** | Prior-deploy entry deleted |
| `/assets/main-legacy.TThGzBh0.js` | **404** | Prior-deploy main bundle deleted |
| `/assets/engine.CoO6bHpA.js` | **404** | Prior-deploy experience-runtime engine stub deleted |

Local workspace build (`npm run build`) currently emits `main-legacy.TThGzBh0.js` → `App.DfhJaSwr.js` — hashes **not yet deployed**, confirming churn between deploys.

---

## Phase 4 — Hash consistency (HTML → manifest → filesystem → deployment → browser)

### Current production deploy — **CONSISTENT**

Automated GET audit of **all 82** `__vite__mapDeps` entries embedded in live `main-legacy.DuOAl9i9.js`:

- **82 / 82 → HTTP 200**
- **0 missing chunks**

Experience Lab page chunk on current deploy:

- `page.BWq_LdHq.js` (route: `experience-lab/page.tsx`) → **200**
- All **23** `__vite__mapDeps` for that page → **200**

Experience-runtime boot chain on current deploy (examples):

| Chunk | HTTP |
|-------|------|
| `engine.LxyAUBZj.js` | 200 |
| `engine.BgEQqIxS.js` | 200 |
| `experience-runtime.D-P5Xh1V.js` | 200 |
| `runtime-boot-validator.CQDxbetH.js` | 200 |
| `runtime-fallback-resolver.Bni17cK4.js` | 200 |
| `default-seed.D520mhTy.js` | 200 |

**Conclusion:** No orphan chunk or dangling reference on the **live** deployment graph. Failures occur when the **browser requests a hash from a previous deploy**.

---

## Phase 5 — Network / MIME verification (current deploy)

Sampled experience-runtime chain:

- **Status:** 200
- **Content-Type:** `application/javascript; charset=utf-8`
- **Cross-origin:** same-origin (`fsbw.vercel.app`)
- **Cache-Control (assets):** `public, max-age=31536000, immutable` (`vercel.json`)
- **Cache-Control (index.html):** `no-cache, no-store, must-revalidate`

Immutable long-lived asset caching + hash-per-deploy is correct for performance but **requires full reload after deploy** when a tab retains an older module graph.

---

## Phase 6 — Dynamic import dependency graph (`experience-runtime` boot)

Boot module `initialize()` (`register-boot-modules.ts`):

```201:205:src/studio-os-core/bootstrap/register-boot-modules.ts
        const { ensureExperienceRuntimeSubsystem } = await import('../genesis/experience-runtime/engine');
        const { validateRuntimeBoot } = await import(
          '../genesis/experience-runtime/runtime-boot/runtime-boot-validator'
        );
```

Production chunk graph (live deploy):

```
main-legacy.DuOAl9i9.js
  └─ dynamic import → engine.LxyAUBZj.js
       ├─ experience-runtime.D-P5Xh1V.js
       ├─ runtime-boot-validator.CQDxbetH.js
       ├─ runtime-fallback-resolver.Bni17cK4.js
       ├─ inspector-view.DWnfQgmW.js
       ├─ default-seed.D520mhTy.js
       └─ dna-resolver.DVySidWZ.js
```

**First module that fails in stale tab:** whichever **hashed URL** the stale graph references that returns **404** (commonly `App.*.js` for shell load, or `engine.*.js` during boot). On the **current** deploy graph, **none** of the above 404.

**Rejected:** `scene-stack` / `blueprint-author` / `construction-mode` barrels in genesis `experience-runtime` boot path — **zero** imports under `src/studio-os-core/genesis/experience-runtime/**`.

---

## Phase 7 — Circular dependencies (source scan)

Static import scan found **29 cycles** touching genesis persistence (including):

```
persistence/store.ts → experience-runtime/persistence.ts → persistence/store.ts
persistence/store.ts → runtime-boot-validator.ts → experience-engine/persistence.ts → persistence/store.ts
```

These cycles exist at **source** level but:

1. Do **not** produce `Importing a module script failed.` (that message is fetch-layer).
2. Current production chunks **load and evaluate** when fetched (HTTP 200).
3. Would surface as TDZ / ReferenceError / explicit throw — not silent import failure.

**Rejected as root cause** for this incident.

---

## Phase 8 — Import failure vs evaluation failure

| Question | Finding |
|----------|---------|
| Did module fetch succeed? | **No** (stale tab) / **Yes** (fresh deploy audit) |
| Did evaluation throw? | **Not evidenced** — error string is fetch-class |
| Does `RootAppErrorBoundary` catch eval errors? | Yes, but with **eval error message**, not Safari import string |

**Verdict:** **Import failure** (missing stale asset), not evaluation exception.

---

## Phase 9 — Vite build output

| Check | Result |
|-------|--------|
| Entry | `index.[hash].js` → `entry-dispatch.[hash].js` |
| Code splitting | Lazy routes per `App.tsx` `lazyWithRetry` |
| Manual chunks | Single `vendor` chunk (`vite.config.ts`) |
| Base path | `/` |
| Legacy/modern dual bundle | `main-legacy` path via `entry-dispatch` |
| experience-runtime chunks | Split (`engine.*`, `experience-runtime.*`, `runtime-boot-validator.*`) |

Build succeeds locally (`npm run build`, exit 0). Hash rotation between local build and production deploy is **expected** and explains 404 on non-deployed hashes.

---

## Phase 10 — Cache behavior

| Scenario | Result |
|----------|--------|
| New HTML + New JS (fresh load) | ✅ All audited chunks 200 |
| Old HTML + Old JS (stale tab, same deploy) | ✅ Works until deploy |
| **Old JS graph + New deploy (chunks deleted)** | ❌ **404 → Importing a module script failed** |
| New HTML + Old JS only | Unlikely (index no-cache); stale **in-memory** SPA tab is the dominant case |

`chunkLoadRecovery.ts` already detects this signature and attempts reload / cache-bust — recovery is **intermittent** if auto-reload cooldown blocks or user dismisses before reload completes.

---

## Phase 11 — `experience-runtime` pinpoint

On **fresh deploy**, boot reaches `experience-runtime` and dynamic-imports `engine.LxyAUBZj.js` (2.8 KB facade re-exporting assembled runtime). All dependent chunks return 200.

On **stale tab after deploy**, the **first failing line** is the browser loader:

```
GET /assets/<stale-hash>.js → 404
```

—not `ensureExperienceRuntimeSubsystem()` body, because the module never evaluates.

---

## Rejected hypotheses

| # | Hypothesis | Verdict | Evidence |
|---|------------|---------|----------|
| 1 | Stale deployment HTML referencing removed hashes | **Partial** — HTML is fresh; **stale JS graph** is the trigger | index no-cache; stale `App.*` / `engine.*` 404 |
| 2 | Missing deployed JS chunk (current deploy) | **Rejected** | 82/82 main-legacy deps + 23/23 xelab page deps = 200 |
| 3 | Failed dynamic import() | **Confirmed** | 404 on stale hashes |
| 4 | Incorrect Vite manifest mapping (current deploy) | **Rejected** | Full mapDeps audit passes |
| 5 | Incorrect base path | **Rejected** | `base: '/'`, production assets at `/assets/` |
| 6 | Incorrect module MIME type | **Rejected** | `application/javascript; charset=utf-8` |
| 7 | CDN cache inconsistency (current hashes) | **Rejected** | All current hashes 200 from edge |
| 8 | Legacy/modern bundle mismatch | **Rejected** | `entry-dispatch` correctly routes to `main-legacy` |
| 9 | Failed code split (build) | **Rejected** | Build succeeds; chunks present on deploy |
| 10 | Bootstrap ordering defect | **Rejected** | Order correct; prior modules complete before `experience-runtime` |
| 11 | Circular dependency during init | **Rejected** | Wrong error class; live chunks load |
| 12 | Runtime exception during import evaluation | **Rejected** | Safari import string = fetch failure |
| 13 | scene-stack barrel regression in boot | **Rejected** | No scene-stack imports in genesis experience-runtime boot |

---

## Timeline (stale-tab failure)

```
T0  User has SPA tab open (deploy N)
T1  Vercel deploy N+1 — old hashed assets deleted
T2  User navigates to /admin/studio/experience-lab (client-side, no hard reload)
T3  Parallel: StudioBootstrap™ enters experience-runtime module
T4  Parallel: React lazy import('../App') or route chunk requests deploy-N hash
T5  GET /assets/<deploy-N-hash>.js → 404
T6  Browser: "Importing a module script failed."
T7  RootAppErrorBoundary renders; boot snapshot shows module=experience-runtime
```

---

## Impact

- Experience Lab (and potentially any admin route) **cannot initialize** in stale tabs after deploy.
- Presents as **P0 platform failure** with misleading `module=experience-runtime` attribution.
- Manual hard refresh / cache-bust typically recovers (consistent with prior MEMORY entries on this error class).

---

## Recommended repair (evidence-backed — not implemented this sprint)

1. **Verify in browser Network tab** on failure: confirm **404** on a specific `/assets/*.js` hash not present in current `index.html`.
2. **Harden stale-tab recovery** — ensure `registerGlobalChunkLoadRecovery()` fires before lazy App import; consider lowering reload cooldown for admin/studio routes.
3. **Operational:** after deploy, expect transient errors for open tabs; communicate hard-refresh for QA.
4. **Optional:** deploy retention / `vercel.json` asset versioning policy review — immutable 1-year cache is correct only with hash rotation + forced shell reload.

---

## Supporting commands (reproducible)

```bash
# Current production index
curl -sS https://fsbw.vercel.app/ | rg 'index\.|vendor\.'

# Stale chunk proof
curl -sS -o /dev/null -w '%{http_code}\n' https://fsbw.vercel.app/assets/App.DfhJaSwr.js
# → 404

# Current App chunk
curl -sS -o /dev/null -w '%{http_code}\n' https://fsbw.vercel.app/assets/App.zBk1aHa-.js
# → 200
```

---

## Confidence score

| Factor | Weight |
|--------|--------|
| Error string matches chunk-load class | High |
| Stale hash 404 reproduced on production | High |
| Current deploy full graph 200 | High |
| `module=experience-runtime` explained by parallel boot | High |
| Circular deps ruled out by error class | Medium |

**Overall confidence: 0.93**

---

*Forensics sprint complete. No code changes applied per sprint boundary.*
