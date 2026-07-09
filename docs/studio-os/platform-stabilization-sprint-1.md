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

---

## Verification

After deploy:

1. Open `/__boot-debug` — **Started: yes**, elapsed time increases, modules move IDLE → STARTING → RUNNING → READY.
2. Open admin Studio routes gated by `StudioBootGate` — diagnostics reflect the same live kernel state.
3. Full boot through `ui-render` completes with **Complete: yes** and **Ready: yes** (or explicit fallback/failed with visible errors).

---

## Genesis freeze

No new constitutional Genesis migrations until Studio Bootstrap is confirmed READY in production. This sprint is orchestration-only; individual boot module `initialize()` implementations were not patched.
