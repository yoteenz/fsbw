# Platform Stabilization Sprint 1 — Studio Bootstrap

**Status:** Complete  
**Date:** 2026-07-09  
**Scope:** Restore deterministic Studio Bootstrap lifecycle; freeze Genesis migrations until bootstrap reaches READY.

---

## Required lifecycle

Each boot module must progress:

```
IDLE → STARTING → RUNNING → READY
```

Global orchestrator:

```
(not started) → started → complete (ready=yes/no)
```

---

## Root cause

Studio Bootstrap never left IDLE because **startup orchestration was hook-driven and raced the event bus**:

1. **No global orchestrator** — `main.tsx` never called `StudioBootstrap.start()`. Bootstrap only ran when a React hook mounted (`useStudioBoot`, `useStudioBootLive`, or `/__boot-debug`). Routes that did not mount those hooks never started the kernel.

2. **`useStudioBoot` listener race** — On mount, `useEffect` called `run({ force: true })` (which synchronously invoked `primeBootStart()` and dispatched `studio-os-boot-updated`) **before** a separate `useEffect` registered the window listener. The first `started: true` event was lost. The hook then reset UI state to idle via `setLive(getInitialStudioBootstrapLiveState())`, and polling could not recover when kernel snapshots were wiped by the paired `resetStudioBootstrap()` on every mount.

3. **`useStudioBootLive` guard + split effects** — Auto-start ran in `useLayoutEffect` while the listener registered in a later `useEffect`, repeating the same race. The module-level `studioBootAutoStartGuard` blocked re-start on StrictMode remount without guaranteeing hydration from kernel state.

4. **Possible duplicate kernel bundles** — Debug routes imported both `@/studio-os-core/bootstrap` and `@/studio-os-core/kernel` directly. Without a dedicated Rollup chunk, production builds could split the kernel singleton, causing start on one instance and reads on another.

`primeBootStart()` itself was correct; it was **never reliably reached by subscribers** and **not invoked at app entry**.

---

## Architectural correction

| Layer | Change |
|-------|--------|
| **Entry** | `main.tsx` calls `ensureStudioBootstrapStarted({ through: 'ui-render' })` synchronously before `ReactDOM.createRoot`. |
| **Orchestrator** | New `studio-bootstrap-init.ts`: idempotent `ensureStudioBootstrapStarted`, `subscribeStudioBoot` (listener + hydrate), `clearStudioBootstrapOrchestrator` for forced retries. |
| **Hooks** | `useStudioBoot` / `useStudioBootLive` subscribe in `useLayoutEffect` first; no mount-time `force` reset; retries only on explicit user action. |
| **Kernel lifecycle** | Replaced single `loading` status with `starting` → `running` → `ready`; progress dispatches on each transition. |
| **Build** | Vite `manualChunks` for `studio-os-core/kernel` and `studio-os-core/bootstrap` to preserve singleton. |
| **Debug cleanup** | Removed temporary wire-trace UI, `debugInvokePrimeBootStart`, and kernel instance ID exports from `/__boot-debug`. |

> **Regression note (2026-07-09):** Dedicated `studio-kernel` / `studio-bootstrap` manualChunks caused a production-only init-order failure — `vendor.js` executed `React.createContext` before `vendor-react` initialized, blanking `/__boot-debug`. Fix: remove those manualChunks; start bootstrap via dynamic import after `ReactDOM.createRoot`.

> **Regression note (2026-07-09, follow-up):** Splitting `vendor` / `vendor-react` / `vendor-router` left a **circular chunk dependency** (`vendor` ↔ `vendor-react`) that can still blank the app after the loading animation. Fix: use a **single `vendor` chunk** for all `node_modules`; add `RootAppErrorBoundary` around lazy `App`; catch bootstrap orchestrator import failures in `main.tsx`.

> **Regression note (2026-07-09, post-loading blank):** Loading shell can clear while `#root` stays empty when a guard returns `null`, `data-loading-screen` sticks on `<html>`, or async errors occur outside React boundaries. Fix: `PlatformErrorBoundary` at main shell + admin/workspace routes; `registerPostLoadRenderGuard()`; ref-counted `loadingScreenLock`; **AdminGuard** keeps `LoadingScreen` during redirect instead of `return null`; App `ErrorBoundary` shows stack + component stack.

> **Regression note (2026-07-09, loading forever):** Bootstrap READY does not guarantee terminal render — **AdminGuard** used async `navigate()` + `LoadingScreen`; 100+ Suspense boundaries use unbounded `LoadingScreen`; post-load guard ignored active GIF. Fix: **sync `<Navigate>` in AdminGuard**; **`loadingTerminalRegistry`** (12s max per loader + watchdog); guard timeouts (`CommerceRouteGuard`, `AccountRouteGuard`, `AdminStudioWorkspaceGuard`); post-load guard audits stuck overlay at 12s/20s. See **`docs/studio-os/RENDER_TERMINAL_TRACE.md`**.

---

## Verification

After deploy:

1. Open `/__boot-debug` — **Started: yes**, elapsed time increases, modules move IDLE → STARTING → RUNNING → READY.
2. Open admin Studio routes gated by `StudioBootGate` — diagnostics reflect the same live kernel state.
3. Full boot through `ui-render` completes with **Complete: yes** and **Ready: yes** (or explicit fallback/failed with visible errors).

---

## Genesis freeze

No new constitutional Genesis migrations until Studio Bootstrap is confirmed READY in production. This sprint is orchestration-only; individual boot module `initialize()` implementations were not patched.
