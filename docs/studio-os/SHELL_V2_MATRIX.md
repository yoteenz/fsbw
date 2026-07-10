# StudioAppShellV2 — Clean-Shell Isolation (P0 Recovery)

Isolated production shell beside the legacy startup tree. Legacy code is **not patched** — V2 mounts from a separate entry path with **zero legacy imports** on `/v2/*`.

## Routes

| Route | Purpose |
|-------|---------|
| `/v2` | Static public page — immediate render |
| `/v2/diagnostic` | Heartbeat + provider matrix (READY when hb ≥ 8) |

Legacy shell remains at `/` and all existing routes until gradual migration (Phase 5).

## Entry

`src/main.tsx` dispatches:

- `/v2`, `/v2/*` → `shell-v2/mount.tsx` (no bootstrap, auth, loading screen, storage guard, post-load guard)
- everything else → `main-legacy.tsx` (unchanged legacy tree)

## Provider / module matrix

Increment **one stage per commit**. Stop at first production failure. Do not proceed until the failing stage is subdivided and replaced (Phase 3–4).

| Stage | Subsystem | Status | Modules |
|-------|-----------|--------|---------|
| 0 | Minimal shell | **PASS** (Phase 1) | React root, BrowserRouter, `/v2`, `/v2/diagnostic`, `shell-v2.css`, plain-DOM heartbeat |
| 1 | Error boundary | pending | `ShellV2ErrorBoundary` |
| 2 | Auth provider | pending | `ShellV2AuthProvider` (TBD) |
| 3 | Router guards | pending | `ShellV2RouteGuards` (TBD) |
| 4 | Studio Bootstrap | pending | Isolated `ensureStudioBootstrapStarted` |
| 5 | Platform / State DNA | pending | platform-dna, state-dna boot modules |
| 6 | Registries | pending | brand, department, scene registries |
| 7 | Workspace runtime | pending | `ensureWorkspacesBootstrapped`, `WorkspaceProvider` |
| 8 | Admin shell | pending | `AdminStudioLayout`, `AdminGuard` |
| 9 | Experience Runtime | pending | experience-runtime boot module |
| 10 | App routes | pending | Migrated route groups (public → auth → admin → studio → runtime) |

Override max stage for local bisection: `?v2Stage=N` (persists in `sessionStorage.shellV2MaxStage`).

## Verification

```bash
npm run build && npm run preview

# Shell V2 only (no legacy chunk for entry — separate dynamic import)
node scripts/shell-v2-probe.mjs http://127.0.0.1:4173 /v2/diagnostic
node scripts/shell-v2-probe.mjs http://127.0.0.1:4173 /v2
```

Production after deploy:

```bash
node scripts/shell-v2-probe.mjs https://fsbw.vercel.app /v2/diagnostic
```

## Phase 5 route migration (not started)

Controlled groups: public → authentication → admin → studio → experience runtime. Legacy shell stays available until each group passes production smoke tests.

## Creative Direction Studio

**Paused** until Shell V2 migration is stable.
