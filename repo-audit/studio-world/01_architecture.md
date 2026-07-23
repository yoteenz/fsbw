# Studio World — High-Level Architecture

**Audit type:** Read-only inventory  
**Host application:** Frontal Slayer (Vite SPA + Vercel serverless API)  
**Subsystem:** Studio World / Studio OS  
**Date:** 2026-07-23  

---

## Overall purpose

Studio World is the **internal creative operating system** embedded in the Frontal Slayer repo. It provides organization headquarters, department workspaces, Genesis/experience compilation, governed AI generation, asset registries, Creative Direction Studio, and platform administration for workspace owners.

Customer commerce (shop, checkout, Mansion, PSA guest flows) lives in the same repo but is **outside** this audit except where Studio World shares auth, Supabase, or admin shell.

---

## Major systems (observed)

| System | Role | Primary code |
| --- | --- | --- |
| **Organization HQ (`/admin/studio/*`)** | Department routes, immersive shells, executive modules | `src/pages/admin/studio/`, `src/components/admin/studio/` |
| **Studio Administration (`/admin/studio-os/*`)** | Portfolio control plane, workspace lifecycle | `src/pages/admin/studio-os/`, `src/components/admin/studio-os/` |
| **Studio OS Core** | Domain engines, Genesis, scene-stack, world-compiler, registries | `src/studio-os-core/` (~3,177 files) |
| **Genesis stack** | Experience engine, runtime, narrative intelligence, validation, FAT | `src/studio-os-core/genesis/` |
| **Scene Stack / World Compiler** | Compile experiences, diagnostics | `src/studio-os-core/scene-stack/` |
| **Experience Lab** | Creative validation UI (v1–v3) | `src/features/studio-world/`, `src/components/admin/studio/experience-lab/` |
| **Creative Direction Studio (CDS)** | Company creative direction, Scene Stack viewport | `src/components/admin/studio-os/creative-direction-studio/` |
| **Governed generation** | Async jobs, builder/foundry/asset APIs | `api/_lib/creativeProduction/`, `api/admin/studio-*-generate*.ts` |
| **Asset & environment packages** | Registry, environment package pipeline | Migrations `studio_asset_registry_*`, `studio_environment_*` |
| **Studio Institute / Expert capture** | Invites, interviews, knowledge vault | `src/studio-institute/`, `api/studio-institute/`, `api/expert-capture/` |
| **Canonical Studio World** | Department generator, route registry, HQ instances | `src/studio-os-core/canonical-studio-world/`, `studio-world/route-registry.ts` |
| **Documentation canon** | Specs, SDK, master-spec | `docs/studio-os/`, `docs/studio-world/`, `STUDIO_OS_BIBLE/` |
| **Context capsules** | Agent handoff, DNA capsules | `StudioOS_ContextCapsule_v0.1/`, `StudioOS_StudioDNACapsule_v1.0/` |

---

## Application boundaries

```
┌─────────────────────────────────────────────────────────────┐
│ Frontal Slayer (host) — Vite SPA src/App.tsx                │
├──────────────────────────┬──────────────────────────────────┤
│ Customer surface         │ Studio World (this audit)        │
│ src/pages/* (non-studio) │ /admin/studio/*                  │
│ shop, lobby, mansion…    │ /admin/studio-os/*               │
│ api/cart, orders…        │ /admin/studio APIs               │
│                          │ /studio-institute/* (public)     │
│                          │ debug: /__studio-*, /__world-*   │
└──────────────────────────┴──────────────────────────────────┘
         Shared: Supabase auth, some admin guards, motherboard docs
```

**Entry dispatch:** `src/main.tsx` → `entry-dispatch` may mount `StudioDebugRoutes` (institute, expert capture, diagnostics) vs full `App`.

**Guards (Studio):** `AdminStudioWorkspaceGuard` → `StudioAdministrationGuard` → `StudioWorkspaceGuard` (`src/App.tsx`).

**Workspace model:** `src/studio-os-core/context/WorkspaceProvider.tsx` + `src/workspaces/*` (e.g. `frontal-slayer` org config inside Studio OS).

---

## Relationship to Frontal Slayer

| Coupling | Nature |
| --- | --- |
| **Deployment** | Single repo, single Vercel project |
| **Auth** | Shared Supabase session; Studio routes under `/admin` |
| **Org workspace** | `src/workspaces/frontal-slayer/` — FS as a **tenant** inside Studio OS |
| **Generation parity** | Documented divergence: FS live-try-on/wig-preview vs Studio governed pipeline (`KNOWN_BLOCKERS.md` B1-Parity) |
| **Brand content** | FS `brand-bible/` is not Studio runtime; Studio may reference FS as workspace content |
| **Admin shell** | FS slayer admin pages coexist under `/admin/*` outside `/admin/studio` |

Studio World is **not** a separate npm package deployment today; `src/studio-os-core/index.ts` re-exports platform modules for in-repo use.

---

## Operational authority (external to code)

Volatile runtime status: `StudioOS_ContextCapsule_v0.1/CURRENT_HANDOFF.md`, `KNOWN_BLOCKERS.md` (override optimistic UI labels).
