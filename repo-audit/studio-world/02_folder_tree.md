# Studio World — Folder Tree

**Scope:** Studio World–owned or Studio-primary paths only. Customer `src/pages` shop/lobby/mansion omitted unless noted as shared.

---

## Repository roots (Studio-primary)

| Path | Purpose | Ownership |
| --- | --- | --- |
| `src/studio-os-core/` | Platform domain (~3,177 files): genesis, scene-stack, auth, registries, institute, expert-capture | Studio OS Core |
| `src/components/admin/studio/` | HQ department UI (~293 top-level entries, ~1000+ files total) | Studio World UI |
| `src/components/admin/studio-os/` | Portfolio layout, CDS, guards, workspace creation | Studio Administration UI |
| `src/pages/admin/studio/` | Route targets (~262 `page.tsx`) | Studio World pages |
| `src/pages/admin/studio-os/` | Studio OS portfolio pages | Studio Administration |
| `src/features/studio-world/` | Experience Lab v2/v3, icons | Studio World features |
| `src/studio-os/` | Diagnostics (world-compiler investigation, flight recorder) | Studio runtime diagnostics |
| `src/workspaces/` | Per-org workspace JSON/config (`frontal-slayer`, sandboxes) | Studio tenancy |
| `src/pages/studio-institute/` | Public institute flows | Studio Institute |
| `src/pages/expert-capture/` | Expert capture UI | Studio Institute |
| `src/pages/debug/` | Studio health, compiler bisect | Debug |
| `src/assets/studio-world/` | Experience Lab icons, generated assets | Studio assets |
| `public/studio-os/` | World graph, master-spec manifest bundles | Static Studio canon |
| `api/admin/studio-*.ts` + related | Governed generation, registry, workspace state | Studio API |
| `api/studio-institute/` | Institute invites | Studio API |
| `api/expert-capture/` | Capture sessions | Studio API |
| `api/_lib/creativeProduction/` | Generation gateway, `studio-os-server` bundle | Studio server lib |
| `docs/studio-os/` | Primary spec (~1,311 files) | Documentation |
| `docs/studio-world/` | World manifesto, atlas, departments | Documentation |
| `docs/studio-institute/` | Expert capture, knowledge vault | Documentation |
| `STUDIO_OS_BIBLE/` | Spatial architecture, HR, living org | Canon |
| `StudioOS_ContextCapsule_v0.1/` | Handoff, blockers, PROJECT_DNA | Ops capsule |
| `StudioOS_StudioDNACapsule_v1.0/` | DNA capsule JSON | Ops capsule |
| `genesis/` (repo root) | Genesis README trees | Documentation mirror |
| `onboarding-pack/`, `founder-intelligence/`, `collaboration-intelligence/` | Packaged context for Studio platform | Capsules |

---

## `src/studio-os-core/` — top-level modules (sample)

Observed directories (not exhaustive): `genesis/`, `scene-stack/`, `creative-direction-studio/`, `canonical-studio-world/`, `studio-world/`, `context/`, `auth/`, `application/`, `workspace/`, `manifest-reconciliation/`, `expert-capture/`, `studio-institute/`, `onboarding-pack-export/`, plus many mirrored “department” engines (`campaign-engine`, `brand-architect`, `concierge-layer`, `asset-registry`, `architecture-law-001`, …).

**Dependencies:** Consumed by `src/components/admin/studio/*`, `src/pages/admin/studio/*`, and `api/_lib/creativeProduction/*`. Does not import customer shop pages.

---

## `src/components/admin/studio/` — feature folders (pattern)

Each department typically has a `*Workspace.tsx`, theme file, and panels. Examples: `experience-lab/`, `genesis/`, `creative-director/`, `mission-control/`, `studio-orb/`, `immersion/`, `world-atlas/`, `production-studio/`, `content-brain/`, `global-experience/` (StudioWorldExperienceProvider).

Shared chrome: `AdminStudioLayout.tsx`, `studio-boot/`, `navigation/`.

---

## Shared with Frontal Slayer (Studio-dependent only)

| Path | Studio use |
| --- | --- |
| `src/App.tsx` | Master router for all `/admin/studio*` routes |
| `src/components/AdminStudioWorkspaceGuard.tsx` | Workspace bootstrap |
| `src/services/studio/` | Client calls to studio APIs |
| Supabase client utilities | Workspace state, jobs, registry |
| `motherboard/CODEBASE.md` | Documents Studio + FS split |

---

## Dependencies (outward)

| Dependency | Used for |
| --- | --- |
| React 18 + React Router | SPA |
| Vite | Build |
| Supabase JS | DB, auth, storage (`live-preview` bucket for generations) |
| FAL (`fal-ai/nano-banana-pro/edit`, etc.) | Governed image generation |
| Vercel serverless | `api/` handlers |

No separate Studio World package published from this repo (in-tree `studio-os-core` only).
