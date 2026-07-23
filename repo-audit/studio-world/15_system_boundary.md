# Studio World — System Boundary (Separation Classification)

**Directive:** Future independent Studio World product vs Frontal Slayer (FS). **Read-only.** No migration plan.

**Classification key:** SW-OWNED · FS-OWNED · SHARED-TEMPORARY · SHARED-CANDIDATE · SW-BORROWED-FROM-FS · FS-BORROWED-FROM-SW · COUPLED-CRITICAL · UNCLEAR-OWNERSHIP

---

## Application shell & routing

| System / paths | Class | Current owner (practice) | Intended future owner | Consumers | Dependency direction | Separation sensitivity | Evidence | Unresolved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/App.tsx` (full SPA router) | **COUPLED-CRITICAL** | FS host repo | SW own app shell; FS own app shell | Both products | Bidirectional mount | S4 | Single `App.tsx` mounts customer routes + `/admin/studio*` + `/admin/studio-os*` | Split strategy TBD |
| `src/main.tsx`, `entry-dispatch` | **SHARED-TEMPORARY** | Repo | Each product own entry | Both | Shared | S3 | Chooses debug vs full app | — |
| `src/routes/StudioDebugRoutes.tsx` | **SW-OWNED** | Repo (SW routes) | SW | Institute, expert capture, diagnostics | SW-only paths | S2 | Separate route tree exists but ships in same bundle | — |
| `/admin/studio/*`, `/admin/studio-os/*` | **SW-OWNED** (namespace) | FS deploy today | SW domain/routes | Studio users | FS hosts URLs | S3 | Routes live under FS `/admin` prefix | Future route namespace |
| Customer routes (`/shop`, `/account`, mansion, etc.) | **FS-OWNED** | FS | FS | Customers | — | S0 for SW | Not Studio inventory | — |
| `AdminStudioWorkspaceGuard.tsx` | **SW-OWNED** logic, **SHARED-TEMPORARY** file location | Repo | SW guard package or app | Studio routes only | SW → shared utils | S2 | Uses `platform-stabilization`, `utils/api` | — |
| `AdminGuard.tsx` | **SW-BORROWED-FROM-FS** (auth gate) | FS admin pattern | SW own auth guard | All `/admin/*` including Studio | FS auth → Studio | S3 | Studio nested inside FS admin guard (`App.tsx` ~1255–1382) | Studio admin vs FS admin role model |

---

## Core platform code

| System / paths | Class | Current owner | Intended future | Consumers | Direction | Sensitivity | Evidence | Unresolved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/studio-os-core/**` | **SW-OWNED** | Repo | SW repo | Studio UI, APIs, some FS pages | FS → SW (select pages) | S2 code move; S3 if FS keeps imports | ~3177 files | FS pages importing core (vision, onboarding) |
| `src/components/admin/studio/**` | **SW-OWNED** | Repo | SW | Studio pages | — | S2 | ~1000+ files | — |
| `src/components/admin/studio-os/**` | **SW-OWNED** | Repo | SW | Portfolio admin | — | S2 | CDS, guards | — |
| `src/features/studio-world/**` | **SW-OWNED** | Repo | SW | Experience Lab | — | S2 | | — |
| `src/pages/admin/studio/**` | **SW-OWNED** | Repo | SW | Router | — | S2 | 262 pages | — |
| `src/pages/admin/studio-os/**` | **SW-OWNED** | Repo | SW | Router | — | S2 | | — |
| `src/pages/studio-institute/**`, `expert-capture/**` | **SW-OWNED** | Repo | SW | Public/debug routes | — | S2 | | — |
| `src/studio-os/diagnostics/**` | **SW-OWNED** | Repo | SW | Debug | — | S1 | | — |
| `src/workspaces/**` | **SHARED-TEMPORARY** | Repo | SW owns workspace registry; FS owns `frontal-slayer` tenant content | Studio bootstrap | Mixed | S3 | `frontal-slayer/config.ts` is FS org inside SW model | Tenant data migration |
| `src/workspaces/frontal-slayer/**` | **FS-OWNED** (tenant config) | Repo | FS or licensed tenant pack | SW runtime | SW platform reads FS workspace | S3 | HQ dashboard adapters reference FS org | — |

---

## Shared utilities & platform stabilization

| System / paths | Class | Current owner | Intended future | Consumers | Direction | Sensitivity | Evidence | Unresolved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/utils/adminStudioTheme.ts`, `adminStudioRoutes.ts`, `adminStudioNavigation.ts` | **SW-OWNED** (Studio naming) | Repo | SW | Studio UI | — | S1 | FS red `#EB1C24` in theme | SW visual identity |
| `src/hooks/useStudio*`, `useSceneStack`, `useMissionControl`, etc. | **SW-OWNED** | Repo | SW | Studio components | — | S2 | Under `src/hooks/` shared folder | Package vs duplicate |
| `src/utils/api.ts`, `getAccessToken` | **SHARED-TEMPORARY** | FS host | Each product or neutral lib | Studio guard, FS API | Bidirectional | S3 | Used by `AdminStudioWorkspaceGuard` | — |
| `src/utils/adminAuth.ts`, `canAccessAdminPages` | **SW-BORROWED-FROM-FS** | FS | SW auth | Studio under `/admin` | FS → SW | S4 | Studio requires FS admin sign-in | Independent Studio users |
| `src/platform-stabilization/**` | **SHARED-TEMPORARY** | Repo | **UNCLEAR** | Studio guard, error boundaries | Both possible | S2 | `PlatformErrorBoundary`, `GuardLoadingRecovery` | Ownership |
| `lazyWithRetry` (App pattern) | **SHARED-TEMPORARY** | Repo | SHARED-CANDIDATE | Whole SPA | Shared | S1 | | — |

---

## API layer

| System / paths | Class | Current owner | Intended future | Consumers | Direction | Sensitivity | Evidence | Unresolved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `api/admin/studio-*.ts`, studio generation, registry, institute-related admin | **SW-OWNED** | FS Vercel project | SW deployment | Studio UI | SW → Supabase/FAL | S3 | Same `api/` tree as FS | Split functions project |
| `api/studio-institute/*`, `api/expert-capture/*` | **SW-OWNED** | FS deploy | SW | Institute | — | S3 | | — |
| `api/_lib/creativeProduction/*` | **SW-OWNED** | Repo | SW | Studio generation | — | S3 | `studio-os-server.bundle.js` | — |
| `api/admin/sync-profile`, orders, clients, marketing (non-studio) | **FS-OWNED** | FS | FS | FS admin | — | S0 for SW | | — |
| `api/wig-preview/*`, `live-try-on-*` (non-studio) | **FS-OWNED** | FS | FS | Customer | — | S0 | Parity docs reference divergence from Studio pipeline | — |
| `api/_lib/studioWorldAdminAccess.ts` | **SW-OWNED** | Repo | SW | Canonical generation APIs | — | S2 | Hard-coded founder email + env portfolio owners | SW credentials policy |

---

## Database & storage (summary — detail in `18_data_separation_inventory.md`)

| System | Class | Current owner | Intended future | Sensitivity | Evidence |
| --- | --- | --- | --- | --- | --- |
| `studio_*`, `studio_os_*` tables (202607 migrations) | **SW-OWNED** | Single Supabase project `hyycomvcaqxxvyrfupes` | SW database | S4 until split | Migrations in repo |
| FS commerce/profile tables | **FS-OWNED** | Same Supabase | FS database | S4 shared project | Used by customer app |
| `live-preview` storage bucket | **SHARED-TEMPORARY** | Same Supabase | Split or prefix | S3 | CODEBASE: Studio + FS generations |
| Auth.users / profiles (shared) | **SHARED-TEMPORARY** | Supabase Auth | Split auth tenants | S4 | Single auth for admin + customer |

---

## Documentation & canon

| Paths | Class | Intended future | Evidence |
| --- | --- | --- | --- |
| `docs/studio-os/`, `docs/studio-world/`, `STUDIO_OS_BIBLE/` | **SW-OWNED** | SW | |
| `StudioOS_ContextCapsule_v0.1/` | **SW-OWNED** | SW | |
| `brand-bible/`, `docs/frontal-slayer/` | **FS-OWNED** | FS | |
| `motherboard/` | **SHARED-TEMPORARY** | **UNCLEAR** | Documents both products |
| `repo-audit/studio-world/` | **SW-OWNED** (audit) | SW | This inventory |

---

## Brand & generation coupling inside SW core

| Item | Class | Evidence |
| --- | --- | --- |
| `frontal-slayer` in genesis seeds, experience-lab scenarios | **SW-OWNED** code with **FS tenant demo data** | `experience-lab/constants.ts`, genesis bootstrap |
| FS red in `ADMIN_STUDIO_THEME` | **SW-BORROWED-FROM-FS** (visual) | `#EB1C24` |
| Brand preflight in generation (FS rules) | **COUPLED-CRITICAL** / **SW-BORROWED-FROM-FS** | Referenced in blockers / pipeline docs | Exact import paths vary by pipeline stage |

---

## FS pages importing Studio core (FS-BORROWED-FROM-SW)

| Path | Class | Direction | Sensitivity |
| --- | --- | --- | --- |
| `src/pages/vision/page.tsx` | **FS-BORROWED-FROM-SW** | FS → `studio-os-core/vision-engine` | S2 |
| `src/pages/onboarding/page.tsx` | **FS-BORROWED-FROM-SW** | FS → onboarding-pack-export | S2 |
| `src/pages/founder-intelligence/page.tsx` | **FS-BORROWED-FROM-SW** | FS → founder-intelligence-capsule-export | S2 |

Detaching SW without replacement breaks these FS routes if still shipped.

---

## Naming & product framing

| Observation | Class |
| --- | --- |
| Routes under `/admin/studio` on FS domain | **COUPLED-CRITICAL** — presents Studio as FS admin (temporary) |
| “THE STUDIO admin modules” in `adminStudioTheme.ts` comment | **SW-OWNED** intent, **SHARED-TEMPORARY** host |
| Workspace `frontal-slayer` as default org in manifest | **SHARED-TEMPORARY** | `manifest-bundle.json` organizationId |

---

## Index to related reports

| Topic | Document |
| --- | --- |
| Cross-boundary dependencies | `16_separation_dependency_map.md` |
| Future ownership checklist | `17_studio_world_ownership_inventory.md` |
| Data | `18_data_separation_inventory.md` |
| Auth | `19_identity_and_auth_boundary.md` |
| Infra | `20_infrastructure_boundary.md` |
| Visual | `21_visual_identity_boundary.md` |
| Risks | `22_separation_risk_register.md` |
| Readiness scores | `23_independent_readiness_scorecard.md` |
