# Studio World — Separation Dependency Map

**Directions:** SW→FS · FS→SW · Bidirectional · Shared neutral · Unknown  
**Severity:** S0 (none) · S1 (easy) · S2 (moderate) · S3 (high) · S4 (critical blocker)

---

## Source imports

| Dependency | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| Studio UI → `src/utils/api.ts`, `getAccessToken` | SW→FS (host util) | S3 | `AdminStudioWorkspaceGuard.tsx` |
| Studio UI → `src/utils/adminAuth` (via AdminGuard parent) | SW→FS | S4 | `AdminGuard` wraps all `/admin` |
| Studio UI → `src/platform-stabilization/*` | SW→Shared | S2 | Error boundary, guard timeout |
| Studio UI → `src/hooks/*`, `src/utils/adminStudio*` | SW→Shared (SW-named) | S2 | Widespread in `components/admin/studio` |
| FS `pages/vision`, `onboarding`, `founder-intelligence` → `studio-os-core` | FS→SW | S2 | Grep: imports from core |
| `App.tsx` lazy imports both FS and SW pages | Bidirectional | S4 | Single bundle |
| `studio-os-core` → (minimal direct FS page imports) | Mostly SW-internal | S1 | FS brand IDs in seeds/constants (data not imports) |

---

## Shared components & hooks

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| `LoadingScreen`, base components | SW→Shared | S2 | Guard loading |
| `src/hooks/useSceneStack`, `useCdsImmersion`, `useMissionControl` | SW-owned, shared folder | S2 | Used by warehouse/atlas rooms |
| `AdminStudioLayout` | SW-OWNED | S1 | Studio-only |

---

## Contexts & providers

| Context | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| `WorkspaceProvider` | SW | S2 | `studio-os-core/context` |
| `OrganizationContextProvider` | SW | S2 | Same guard file |
| `CampusTransitionProvider` | SW | S2 | `admin/studio-os/campus` |
| Supabase session (implicit) | Shared neutral | S4 | Same browser session for FS admin + Studio |

---

## Design tokens & theme

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| `ADMIN_STUDIO_THEME` (`#EB1C24`) | SW file, FS brand color | S2 | `adminStudioTheme.ts` |
| Global CSS / Tailwind config | Shared neutral | S3 | Root `tailwind.config`, `index.css` |
| FS design DNA docs referenced in generation | SW→FS (conceptual/rules) | S3 | Blockers / preflight docs |

---

## Assets

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| `src/assets/studio-world/` | SW | S1 | |
| `public/studio-os/` | SW | S1 | |
| FS product/brand images in workspace adapters | SW→FS tenant content | S2 | `workspaces/frontal-slayer/` |
| `live-preview` bucket objects | Bidirectional | S3 | Shared storage |

---

## Routes

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| Studio under `/admin/*` | SW→FS URL space | S4 | Not independent domain |
| `/sign-in` returnTo Studio URLs | SW→FS auth pages | S3 | AdminGuard redirect |
| `StudioDebugRoutes` institute paths | SW (partially isolated) | S2 | Separate tree, same deploy |

---

## Database

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| All `studio_*` tables | SW data on shared DB | S4 | Single Supabase project |
| `studio_os_org_memberships` | SW | S4 | Same auth.users FK pattern |
| FS orders/products profiles | FS | S0 for SW separation | Coexist in one project |

---

## Authentication

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| Supabase Auth session | Shared neutral | S4 | `.env.example` single VITE_SUPABASE_* |
| `canAccessAdminPages()` | SW routes depend on FS admin role logic | S4 | `AdminGuard.tsx` |
| `studio-os-membership` API | SW | S3 | Uses same service role as FS APIs |
| `isStudioWorldAdminEmail` | SW server gate | S2 | Separate from FS admin but same user table |

---

## API dependencies

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| `src/services/studio/*` → `/api/admin/studio-*` | SW internal | S3 | Needs SW API host |
| FS customer APIs | No Studio requirement | S0 | |
| Generation worker cron | SW on FS Vercel | S4 | Same deployment |

---

## Environment variables

| Variable class | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| `VITE_SUPABASE_*` | Shared neutral | S4 | `.env.example` |
| `SUPABASE_SERVICE_ROLE_KEY` | Shared neutral | S4 | All admin APIs |
| FAL / AI keys in server env | Shared neutral | S3 | Used by FS preview + Studio jobs |
| `ADMIN_PORTFOLIO_OWNER_EMAILS` | SW-specific logic | S2 | `studioWorldAdminAccess.ts` |
| Vercel project env (single) | Shared neutral | S4 | One production deploy |

---

## Build & deployment

| Item | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| Root `package.json`, `vite.config` | Shared neutral | S4 | One build artifact |
| `vercel.json` / API routing | Shared neutral | S4 | Monolith |
| `scripts/agent-commit.sh`, CI | Shared neutral | S3 | Repo-level |
| `.cursor/environment.json` | Shared neutral | S2 | Cloud agent |

---

## Third-party integrations

| Integration | Direction | Severity | Evidence |
| --- | --- | --- | --- |
| Supabase | Shared neutral | S4 | |
| FAL | Shared neutral | S3 | FS + Studio generation |
| Vercel | Shared neutral | S4 | |

---

## Summary matrix

| Severity | Count (representative) | Examples |
| --- | --- | --- |
| **S4** | Auth, DB, deploy, App shell, admin guard | Cannot run SW product alone today |
| **S3** | API host, env, storage, theme parity, workspace bootstrap | High migration effort |
| **S2** | Hooks folder, FS pages using core, institute routes | Refactor/extract |
| **S1** | Studio-only components, public studio-os static | Easier |
| **S0** | FS shop-only paths | Irrelevant to SW |

No remediation proposed in this document.
