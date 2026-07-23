# Studio World — Data Flow

**Scope:** Studio World inputs/outputs only.

---

## High-level flow

```
Founder/Admin browser
    → /admin/studio* | /admin/studio-os* (React SPA)
        → WorkspaceProvider (org context, local + cloud state)
        → Department UI (components/admin/studio)
        → studio-os-core engines (genesis, scene-stack, registries)
    → fetch() to /api/admin/studio-* | /api/studio-institute/* | /api/expert-capture/*
        → Vercel serverless handlers
        → api/_lib/creativeProduction/* (gateway, bundle)
        → Supabase (Postgres + Storage)
        → FAL (image generation) / external providers
    ← JSON + job ids + signed URLs
    ← Realtime/poll: studio-generation-status, job rows
```

---

## Inputs

| Input | Source | Consumers |
| --- | --- | --- |
| User session | Supabase Auth | All guarded `/admin` routes |
| Workspace id / org | `WorkspaceProvider`, `studio_os_org_memberships` | Studio routes, APIs |
| Workspace persisted state | `studio_os_workspace_state` | HQ UI restore |
| Genesis / scene definitions | In-memory seeds, local storage, workspace state | Experience runtime, compiler |
| Generation requests | Experience Lab, CDS, builder UI | Governed job APIs |
| Expert capture media | Upload APIs | Storage + vault |
| Institute invites | `studio_institute_invites` | Public institute flows |
| Manifest bundles | `public/studio-os/`, generated JSON | Reconciliation, boot |
| Context/DNA capsules | Zip exports, onboarding pack | External AI handoff |

---

## Outputs

| Output | Destination |
| --- | --- |
| Generated images/assets | Supabase Storage (`live-preview` bucket per CODEBASE) |
| Asset registry rows | `studio_asset_registry_*` |
| Governed job status | `studio_governed_generation_jobs` |
| Environment packages | `studio_environment_*` tables |
| Creative intelligence signals | `studio_creative_intelligence_*` |
| Social posts (Studio publishing) | `studio_social_*` |
| Founder render artifacts | `studio_founder_render_jobs` |
| Canonical department publications | `studio_world_department_*` |
| Client UI state | React component state, context |

---

## Supabase (Studio)

See `07_database.md`. Primary write paths: workspace state, jobs, registry, institute, social, environment packages, canonical departments.

---

## API surface (Studio)

| Pattern | Examples |
| --- | --- |
| **Generation** | `studio-builder-generate`, `studio-foundry-generate`, `studio-generate-asset`, `studio-generation-worker`, `studio-generation-status` |
| **Registry** | `studio-asset-registry`, `studio-replace-asset` |
| **Workspace** | `studio-workspace-state`, `studio-os-membership` |
| **CDS / lab auth** | `creative-studio-stack-authorization`, `experience-lab-ephemeral-authorization` |
| **Environment** | `environment-package-*` (worker, promote, events) |
| **Founder render** | `founder-render-generate`, `-status`, `-approve` |
| **Intelligence** | `studio-creative-intelligence` |
| **Institute** | `api/studio-institute/*`, `api/expert-capture/*` |
| **Immune/health** | `immune-system-health`, `immune-system-incidents` |
| **Capsule** | `context-capsule` |

Client wrappers: `src/services/studio/` (e.g. `studioBuilder/api.ts` → `requestStudioBuilderGenerate()`).

---

## State, contexts, stores, hooks

| Mechanism | Location | Scope |
| --- | --- | --- |
| **WorkspaceContext** | `studio-os-core/context/WorkspaceProvider.tsx` | Org workspace id, bootstrap |
| **StudioWorldExperienceProvider** | `components/admin/studio/global-experience/` | Cross-room UX context |
| **StudioOrbProvider** | `studio-orb/StudioOrbProvider.tsx` | Orb state |
| **Genesis / runtime session** | `experience-runtime/runtime-state/session-state.ts` | Experience session |
| **Live validation / FAT persistence** | `genesis/*/persistence.ts` | Module-local persistence adapters |
| **React local state** | Department workspaces | Ephemeral UI |

No single global Zustand store observed for entire Studio World; pattern is **context + module persistence + Supabase**.

---

## Cross-system communication

| From | To | Channel |
| --- | --- | --- |
| Experience Lab UI | World compiler | In-process imports + runtime APIs |
| CDS | Scene Stack | `SceneStackViewport`, stack authorization API |
| Builder UI | Governed jobs | HTTP → Postgres job row → worker |
| Worker | FAL | Server-side SDK |
| Department generator | Canonical tables | `canonical-department-generation` API |
| Environment package worker | CDS handoffs | `studio_environment_package_cds_handoffs` |
| Manifest reconciliation | Public manifest | File diff / generated bundle |
| Immune system API | Incident records | Admin health UI |

---

## Frontal Slayer coupling (data)

| Boundary | Observation |
| --- | --- |
| **Generation** | FS uses separate endpoints (`wig-preview`, live-try-on); Studio uses governed pipeline (documented parity gap) |
| **Auth profile** | Shared Supabase user; `studio_os_org_memberships` Studio-specific |
| **Workspace** | `frontal-slayer` workspace config references FS org, not customer cart data |

---

## Debug / forensic flows

| Route | Data |
| --- | --- |
| `/__studio-health` | Health probes |
| `/__world-compiler-investigation` | Compiler traces |
| `/__studio-os-recovery` | Recovery reports |
| `?compilerDiag=1` | Parity panel (mobile diag per blockers doc) |
