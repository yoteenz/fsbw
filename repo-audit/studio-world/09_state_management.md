# Studio World — State Management

---

## React contexts (primary)

| Context | File | Provides |
| --- | --- | --- |
| **WorkspaceContext** | `src/studio-os-core/context/WorkspaceProvider.tsx` | Workspace id, bootstrap, org studio context |
| **StudioWorldExperienceContext** | `src/components/admin/studio/global-experience/StudioWorldExperienceContext.tsx` | Cross-room experience state (via Provider) |
| **StudioOrbProvider** | `src/components/admin/studio/studio-orb/StudioOrbProvider.tsx` | Orb UI state, panels |

Pattern: `createContext` + hook wrappers; consumers under `/admin/studio` tree.

---

## Providers (mount order)

Observed in studio layout chain:

1. Admin / workspace guards (outside department)
2. `WorkspaceProvider` (workspace resolution)
3. `AdminStudioLayout` → may mount `StudioWorldExperienceProvider`, `StudioOrbProvider`, immersion shell

Exact mount tree varies by route; boot gate wraps Experience Lab paths (`StudioBootGate`).

---

## Global state

| Type | Mechanism |
| --- | --- |
| **No app-wide Zustand/Redux** for Studio | Not observed as single store |
| **Module engines** | Class/singleton engines with `persistence.ts` (Genesis FAT, live validation) |
| **Session runtime** | `experience-runtime/runtime-state/session-state.ts` |
| **Workspace cloud** | `studio_os_workspace_state` via API |

---

## Stores / hooks (distributed)

| Area | Pattern |
| --- | --- |
| Department workspaces | `useState` / `useReducer` locally |
| Generation polling | Custom hooks calling `studio-generation-status` (in studio services) |
| Studio builder client | `src/services/studio/studioBuilder/api.ts` |
| Auth session | Shared Supabase hooks (host app) |

---

## Cross-component state

| Channel | Use |
| --- | --- |
| **Workspace context** | Org id, feature flags from workspace config JSON |
| **URL / router** | Route params (`companySlug`, `runId`, section ids) |
| **World experience provider** | Shared immersion/orb-related state |
| **Job ids in URL/query** | AI production runs, diagnostics (`compilerDiag`) |

---

## Persistence layers

| Layer | Technology |
| --- | --- |
| Browser local | Module seeds, runtime cache (`runtime-cache/`) |
| Supabase | Workspace state, jobs, registry, institute |
| Static manifest | `public/studio-os/`, generated manifest reconciliation |
| Capsule zips | Export downloads (onboarding, DNA) |

---

## Frontal Slayer shared state

| Shared | Studio-only usage |
| --- | --- |
| Supabase auth session | Required for `/admin` |
| User profile sync | May use shared admin APIs; Studio adds `studio_os_org_memberships` |

Customer cart/checkout state **not** used by Studio World department UIs in normal paths.

---

## Diagnostic state

| Tool | State |
| --- | --- |
| Flight recorder / black box | `src/studio-os/diagnostics/` |
| Compiler investigation | URL-driven debug pages |
| `?compilerDiag=1` | Query flag for parity panel (mobile) |
