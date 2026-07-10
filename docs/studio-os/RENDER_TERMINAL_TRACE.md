# Render Terminal Trace — Platform Stabilization P0

**Status:** Binding diagnostic reference  
**Rule:** Every render path must reach exactly one terminal state. Loading forever, `return null`, and unresolved `navigate()` in `useEffect` are **forbidden**.

## Allowed terminal states

| # | State | Example |
|---|--------|---------|
| 1 | Authenticated authorized content | `/home/shop`, `/admin/dashboard`, `/desktop/penthouse` |
| 2 | Sign-in screen | `/sign-in?returnTo=…` |
| 3 | Access-denied redirect | `/account` (non-admin) |
| 4 | Visible error screen | `PlatformErrorBoundary`, `ErrorBoundary`, `GuardLoadingRecovery` |
| 5 | Explicit recovery screen | `data-loading-terminal-recovery`, `data-post-load-render-guard` |

---

## Render path (main → route)

```text
main.tsx
  PlatformErrorBoundary [main-shell]
    BrowserRouter
      StudioDebugRoutes
        /__studio-health | /__boot-debug | …  → debug pages (terminal: diagnostics)
        * → RootAppErrorBoundary
              Suspense [App.lazy] → LoadingScreen (max 12s → recovery)
                App
                  ErrorBoundary
                    DesktopTowerNavProvider
                      VisionEngineProvider
                        TutorialOsProvider
                          sync components (null render — OK)
                          DebugModeShell → Routes → matched route
```

---

## Loading-capable components (must terminate)

### Layer 1 — Shell

| Component | File | Loading behavior | Terminal fix |
|-----------|------|------------------|--------------|
| `Suspense` (App) | `StudioDebugRoutes.tsx` | `LoadingScreen source="App.lazy"` | 12s global timeout + recovery |
| `LoadingScreen` | `components/base/LoadingScreen.tsx` | Portal GIF + document lock | `loadingTerminalRegistry` watchdog; **must** pass `source` at guards |

### Layer 2 — Landing / redirects

| Component | File | Was forbidden? | Terminal fix |
|-----------|------|----------------|--------------|
| `HomeLandingRedirect` | `components/HomeLandingRedirect.tsx` | `LoadingScreen` if `target===null` (SSR only) | Client always sets `target` synchronously; labeled `source` |
| `Navigate` | react-router | Immediate terminal redirect | OK |

### Layer 3 — Route guards

| Guard | File | Forbidden pattern | Terminal fix |
|-------|------|---------------------|--------------|
| **AdminGuard** | `components/AdminGuard.tsx` | ~~`useEffect(navigate)` + `LoadingScreen`~~ | **Sync `<Navigate>`** — no loading state |
| **AdminStudioWorkspaceGuard** | `components/AdminStudioWorkspaceGuard.tsx` | `LoadingScreen` until workspace import | 15s workspace timeout + `GuardLoadingRecovery`; labeled source |
| **CommerceRouteGuard** | `components/CommerceRouteGuard.tsx` | `allowed===null` text loading forever | 12s `GuardLoadingRecovery` |
| **AccountRouteGuard** | `components/AccountRouteGuard.tsx` | `!recoveryDone` text loading forever | 12s `GuardLoadingRecovery` |
| **StudioAdministrationGuard** | `admin/studio-os/StudioAdministrationGuard.tsx` | `<Navigate>` only | OK |
| **StudioWorkspaceGuard** | `admin/studio-os/StudioWorkspaceGuard.tsx` | `<Navigate>` / `<Outlet>` | OK |

### Layer 4 — Suspense (App.tsx)

Every lazy admin/desktop/customer route uses `<Suspense fallback={<LoadingScreen />}>`.

**Count:** 100+ route-level Suspense boundaries.

**Forbidden:** Lazy import never resolves → GIF forever.

**Terminal fix:** `LoadingScreen` global 12s max + `loadingTerminalRegistry` + post-load guard at 12s/20s forces `data-loading-terminal-recovery` with **Blocked by** source list.

### Layer 5 — Studio boot (non-GIF)

| Component | File | Blocks with GIF? | Notes |
|-----------|------|------------------|-------|
| `StudioBootGate` | `studio-boot/StudioBootGate.tsx` | No — diagnostics panel | Can block studio UX but not load-screen.gif |
| `ensureStudioBootstrapStarted` | `main.tsx` | No | Runs parallel; READY does not gate customer routes |

---

## Root causes identified (this sprint)

### 1. AdminGuard async redirect loop (FIXED)

**File:** `src/components/AdminGuard.tsx`  
**Pattern:** `useEffect(() => navigate(...))` + `LoadingScreen` while waiting for URL change.  
**Failure:** Navigation delayed or blocked → **GIF forever** on `/admin/*`.  
**Fix:** Synchronous `<Navigate replace />` — immediate terminal state (sign-in or content).

### 2. LoadingScreen without max duration (FIXED)

**File:** `src/components/base/LoadingScreen.tsx`  
**Pattern:** Portal overlay with no auto-termination; used by 100+ Suspense fallbacks.  
**Failure:** Hung lazy chunk or stuck guard → **GIF forever**.  
**Fix:** `registerLoadingTerminal(source)` + 12s per-instance timeout + global watchdog.

### 3. post-load-render-guard skipped active GIF (FIXED)

**File:** `platform-stabilization/post-load-render-guard.ts`  
**Pattern:** `rootLooksBlank()` returned false when `.loading-screen-root` present.  
**Failure:** Stuck loading never audited.  
**Fix:** 12s/20s audits call `forceLoadingTerminalRecovery` when overlay still present.

### 4. Async guards without timeout (FIXED)

**Files:** `CommerceRouteGuard.tsx`, `AccountRouteGuard.tsx`, `AdminStudioWorkspaceGuard.tsx`  
**Fix:** `useGuardLoadingTimeout` → `GuardLoadingRecovery` terminal screen.

---

## Enforcement modules

| Module | Role |
|--------|------|
| `loadingTerminalRegistry.ts` | Tracks active loaders; 12s watchdog |
| `loadingScreenLock.ts` | Ref-counted `data-loading-screen`; cleared on recovery |
| `post-load-render-guard.ts` | 4/8/12/20s audits; stuck overlay → recovery |
| `PlatformErrorBoundary.tsx` | Render error terminal |
| `GuardLoadingRecovery.tsx` | Guard timeout terminal |

---

## Verification checklist (production)

1. `/` → redirects → content (not GIF >12s)
2. `/admin/studio` unsigned → `/sign-in` immediately (no GIF hang)
3. `/admin/studio` signed admin → studio content or workspace recovery (not GIF >15s)
4. `/__boot-debug` → Ready: yes
5. If any loader stuck 12s → **Loading did not complete** recovery with **Blocked by** source
6. No `html[data-loading-screen=true]` after terminal state reached

---

## Creative Direction Studio

**Suspended.** No CDS Phase 1 work until all paths above pass production verification with named loader sources in any recovery screen.
