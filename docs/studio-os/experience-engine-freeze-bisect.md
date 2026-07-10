# Experience Engine Main-Thread Freeze Bisect™

**Status:** Diagnostic sprint — **no production fix applied**.  
**Routes:** `/__experience-engine-bisect?stage=N` · `/__experience-engine-freeze-report`  
**Related:** `src/platform-stabilization/experience-engine-freeze-bisect/`

---

## Mission

Isolate the exact synchronous function, provider, hook, or import that stops the main-thread event loop in **normal Safari** and **normal Chrome on iOS** (WebKit). Private/incognito success is **not** proof of production stability.

---

## Quick start

1. Build and preview (or use production deploy):
   ```bash
   npm run build && npx vite preview --port 4173
   ```
2. Open `/__experience-engine-bisect?stage=0` in the failing browser (normal tab, signed in, with persisted `genesis_v1`).
3. Increment `stage` until RAF + setTimeout heartbeats stop while CSS pulse continues.
4. After freeze (or completed run), open `/__experience-engine-freeze-report` — trace survives tab reopen via `sessionStorage`.
5. Desktop automation (headless baseline only):
   ```bash
   node scripts/experience-engine-bisect-probe.mjs http://127.0.0.1:4173
   ```

---

## Stage matrix (0–12)

| Stage | Label | What loads | Dynamic import boundary |
|-------|-------|------------|-------------------------|
| 0 | Heartbeats only | Plain DOM + MTD overlay + CSS pulse | None |
| 1 | Route shell | Static bisect text | None |
| 2 | Error boundary | `PlatformErrorBoundary` | Yes |
| 3 | Auth/session read | `localStorage` read only | No provider |
| 4 | Workspace context | `ensureWorkspacesBootstrapped` + `WorkspaceProvider` mount | Yes |
| 5 | Experience Engine DNA | `repairExperienceEngineDnaIfNeeded` + `ensureExperienceEngineDnaSubsystem` | Yes |
| 6 | Experience Runtime | `ensureExperienceRuntimeSubsystem` | Yes |
| 7 | Scene Stack read | `readGenesisStore` + `getSceneStackLayerRecord` | Yes |
| 8 | Brand DNA resolve | `resolveExperienceProfile` | Yes |
| 9 | Experience graph | `buildExperienceEngineReadyView` | Yes |
| 10 | Preview compiler | `compileCreativeStudioPreview` | Yes |
| 11 | Orb integration | `StudioOrbProvider` mount + `buildOrbReadyViewSnapshot` | Yes |
| 12 | Full EE UI | `DepartmentGoldenBuildShell` + `ExperienceEngineDnaWorkspace` | Yes |

**Rule:** Later-stage modules must not evaluate at module scope until their stage runs (`bisect-stages.ts` + `bisect-stage-tree.tsx`).

---

## Three freeze signals

| Signal | Source | Stopped means |
|--------|--------|---------------|
| A — RAF | `main-thread-diagnostics` `rafCount` | Rendering loop blocked |
| B — setTimeout | `timeoutProbe` | JS event loop blocked |
| C — CSS animation | `[data-ee-css-heartbeat]::after` keyframes | Compositor/tab stall |

**Interpretation:**

- RAF + timeout stop, CSS continues → **JS main thread blocked** (primary EE hypothesis).
- All three stop → compositor overwhelmed or tab fully stalled.
- RAF stops, timeout continues → rendering loop failure.
- Heartbeats continue but UI stuck → state/route lifecycle — not a freeze.

---

## Module-scope audit (import graph)

**Entry:** `/admin/studio/experience-engine` → `DepartmentGoldenBuildShell` → `ExperienceEngineDnaWorkspace`

### Critical finding

**No top-level mutators** on the EE import graph: no `ensure*`, `repair*`, `readGenesisStore`, subscriptions, or event dispatch at module evaluation time.

### High — sync-heavy evaluation (chunk parse / allocation)

| File | Top-level work |
|------|----------------|
| `genesis/index.ts` | Barrel re-exports ~40 subsystems; any `from 'studio-os-core/genesis'` loads full kernel |
| `genesis/engine.ts` | Static imports all subsystem engines (fan-out amplifier) |
| `genesis/build-order/seeds/studio-os-systems.ts` | ~1,050-line seed array |
| `genesis/studio-os-design-dna/bootstrap/seed-data.ts` | ~800 LOC + `.map` derivations |
| `genesis/experience-runtime/bootstrap/seed-data.ts` | `buildPlatformDna()` + `buildStateDnaProfiles()` at export |
| `genesis/experience-engine/bootstrap/seed-data.ts` | 3-brand DNA + component `.flatMap` |
| `hero-objects/catalog.ts` | ~632 LOC catalog + toolbelt `.map` |

### Import chains (route → flagged module)

```
page.tsx → genesis [BARREL]                    ← isValidXeeRoomPath
ExperienceEngineDnaWorkspace → genesis [BARREL] ← constants, hooks
DepartmentGoldenBuildShell → StudioOrbProvider → genesis [BARREL], hero-objects/catalog
useExperienceEngineDnaState → genesis [BARREL]  ← repair/ensure at runtime (useEffect)
```

### Runtime-only mutators (post-mount — bisect targets after stage isolation)

| Location | Work |
|----------|------|
| `useExperienceEngineDnaState` | `repairExperienceEngineDnaIfNeeded`, `ensureExperienceEngineDnaSubsystem`, `buildExperienceEngineReadyView` |
| `useOrbState` | `ensureOrbSubsystem`, `GENESIS_UPDATED` listener, `buildOrbReadyViewSnapshot` |
| `GlobalAtlasProvider` | `ensureOrganizationInnovationLineageProfile` (can write on first read) |
| `StudioOrbProvider` | visualViewport keyboard, conversation sessions, body dataset |
| `DepartmentGoldenBuildShell` | scroll lock, `clearLoadingScreenDocumentLock` |
| `genesis/persistence/store.ts` | `readGenesisStore` → `JSON.parse(genesis_v1)` on first call |

---

## Render / effect instrumentation

- `BisectInstrument` — render count + first-mount effect checkpoint per component.
- `freeze-trace-ledger.ts` — ring buffer (48 entries), latest mirrored to `sessionStorage`.
- `main-thread-diagnostics.ts` — provider render storm + dispatch depth breakers (production overlay).

**Flag patterns to watch during bisect:**

- State update during render
- Unstable context objects every render
- Selector returning new object identity continuously
- `GENESIS_UPDATED` ↔ Orb ↔ Scene Stack feedback loops
- `ensure*` called on every render
- Repeated `buildExperienceEngineReadyView` / graph recomputation

---

## WebKit-specific audit

| Pattern | In EE chain? | Notes |
|---------|--------------|-------|
| Large sync `localStorage` read | Runtime (`readGenesisStore`) | Normal tabs have large `genesis_v1`; private tabs often empty |
| `structuredClone` on large graphs | Not in chain | — |
| IndexedDB migration loops | Not in chain | — |
| `ResizeObserver` feedback | Not in EE chain | Used elsewhere in repo |
| `visualViewport` listeners | `StudioOrbProvider` (runtime) | iOS keyboard |
| Scroll lock (`overflow: hidden`) | `DepartmentGoldenBuildShell` (stage 12) | WebKit touch scroll |
| Fixed composited portal | `DepartmentGoldenBuildShell` | `position: fixed; inset: 0; z-index: 200` |
| Deep recursion / cyclic serialize | Unconfirmed | Bisect stage 9 graph build is prime suspect |

**Do not disable visual effects until JS stage bisect identifies the failing stage.**

---

## Normal tab vs private tab

Record for each stage attempt:

- stage entered / completed
- RAF count, timeout count, CSS pulse count
- last checkpoint (`eeFreezeLatestCheckpoint_v1`)
- render/effect counts
- `genesis_v1` byte length
- auth state (`isSignedIn`, `currentUser`)
- visibility state

**Divergence rule:** First stage that fails only in normal browsing contains the blocker. Subdivide that stage by disabling half its imports (single-variable bisect).

---

## Isolation status (this sprint)

| Criterion | Status |
|-----------|--------|
| Bisect route | ✅ Shipped |
| Stage matrix | ✅ 0–12 |
| Module-scope audit | ✅ Documented (no Critical import-time mutators) |
| Render/effect trace | ✅ `BisectInstrument` + ledger |
| WebKit findings | ✅ Documented |
| **First failing stage (iOS normal tab)** | ⏳ **Requires manual run on device** |
| **Exact file + function** | ⏳ Pending bisect subdivision |
| Production fix | ❌ **Not applied** (by design) |

### Working hypothesis (not proven)

Normal-tab freeze likely occurs at **stage 5–9 or stage 12 runtime hooks**, triggered by persisted `genesis_v1` payload causing:

1. Sync `JSON.parse` + merge of large genesis store, then
2. `buildExperienceEngineReadyView` or Orb `GENESIS_UPDATED` feedback loop, or
3. Chunk evaluation cost from genesis barrel + seed blobs on cold load.

Private tabs skip (1) or reduce payload size, masking the failure.

---

## Minimal repair proposal (do not apply until proven)

After bisect confirms the exact function:

1. **If genesis barrel / seed eval:** Narrow imports (`isValidXeeRoomPath` from `room/ready-view`, not full barrel); lazy-load seed-data inside `ensure*` only.
2. **If `buildExperienceEngineReadyView` loop:** Memoize on stable genesis revision id; break GENESIS_UPDATED ↔ setState cycle in `useExperienceEngineDnaState` / `useOrbState`.
3. **If `readGenesisStore` storm:** Single boot read + context; invalidate cache only on explicit writes.
4. **If scroll/compositor (stage 12 only):** Reduce fixed portal layers after JS blocker is ruled out.

---

## Files added

| Path | Purpose |
|------|---------|
| `src/platform-stabilization/experience-engine-freeze-bisect/freeze-trace-ledger.ts` | Checkpoint ring + session report |
| `src/platform-stabilization/experience-engine-freeze-bisect/bisect-stages.ts` | Staged dynamic loaders |
| `src/platform-stabilization/experience-engine-freeze-bisect/render-instrumentation.tsx` | Render/effect counters |
| `src/pages/debug/experience-engine-bisect/page.tsx` | Bisect UI |
| `src/pages/debug/experience-engine-bisect/bisect-stage-tree.tsx` | React provider mounting |
| `src/pages/debug/experience-engine-bisect/freeze-signals.ts` | RAF/timeout/CSS interpretation |
| `src/pages/debug/experience-engine-freeze-report/page.tsx` | Recovered trace viewer |
| `scripts/experience-engine-bisect-probe.mjs` | Headless stage probe |

---

## Single-variable bisect procedure

1. Find first failing stage N on normal iOS WebKit.
2. Disable half of stage N's imports — retest.
3. Keep failing half; subdivide until one import remains.
4. Bisect inside that import: component → hook → effect → selector → sync loop.
5. Document: exact file, function, line/block, trigger, why main thread blocks, why private mode differs.

**Final deliverable must not stop at broad labels** (“Experience Runtime”, “Orb”, “hydration”, “WebKit issue”).
