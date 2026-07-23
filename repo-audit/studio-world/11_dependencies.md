# Studio World — Dependencies

---

## Internal (Studio → Studio)

| From | To |
| --- | --- |
| `pages/admin/studio/*` | `components/admin/studio/*`, lazy imports |
| UI components | `studio-os-core` modules (genesis, scene-stack, registries) |
| `studio-os-core` | Submodules per department (mirrored folder names) |
| API handlers | `api/_lib/creativeProduction/*`, `_lib/studio*` |
| Services | `src/services/studio/*` → `/api/admin/studio-*` |
| World resolver | `studio-world/route-registry.ts` ← navigation + App routes |
| Workspace | `workspaces/<org>/` config ← `WorkspaceProvider` |

**Coupling density:** `studio-os-core` is the **hub**; UI pages are thin shells over large core surface.

---

## Shared internal (Studio + host)

| Dependency | Studio use |
| --- | --- |
| `src/App.tsx` | Route mounting |
| Supabase client | Auth, DB, storage |
| Admin auth guards | `/admin` access |
| `lazyWithRetry` | Code splitting |
| Vite env | API base URLs |

---

## External libraries (representative)

| Library | Studio touchpoints |
| --- | --- |
| **react / react-dom / react-router-dom** | Entire SPA |
| **@supabase/supabase-js** | Workspace, jobs, registry |
| **@fal-ai/client** (or server SDK) | Generation pipelines |
| **TypeScript** | All core |
| UI libs used by admin studio | Same as host (e.g. tailwind, radix—exact set from root `package.json`, not re-listed here) |

Studio does **not** ship a separate `package.json`; dependencies are monorepo root.

---

## Technical coupling to Frontal Slayer

| Coupling | Strength | Notes |
| --- | --- | --- |
| **Monorepo** | Hard | Single deploy |
| **Auth/users** | Hard | Shared Supabase |
| **Admin shell** | Medium | Same `/admin` tree |
| **Generation APIs** | Loose / divergent | Separate FS wig-preview vs Studio governed |
| **Brand docs** | Soft | FS `brand-bible` referenced in generation preflight, not runtime import tree |
| **Workspace tenant** | Medium | `frontal-slayer` workspace is FS org inside Studio |
| **Customer routes** | None in Studio UI | Studio routes do not import checkout pages |

---

## Doc / canon dependencies

| Canon | Consumers |
| --- | --- |
| `docs/studio-os/master-spec/` | Governance, module specs |
| `STUDIO_OS_BIBLE/` | Spatial review gate (product work) |
| `KNOWN_BLOCKERS.md` | Overrides status claims |
| `motherboard/CODEBASE.md` | Agent orientation |

---

## API coupling matrix (Studio APIs)

Studio UI **depends on** corresponding `api/admin/*` handlers existing in production. Missing handler → route-level failure (B0 class issues addressed via bundle).

Cross-org portfolio APIs depend on **studio-os-membership** and owner guards.

---

## Upgrade / build coupling

| Item | Risk |
| --- | --- |
| `studio-os-server.bundle.js` | Must rebuild when server imports change |
| Manifest reconciliation | Generated JSON must match `public/studio-os` |
| Migrations | Studio features gated on 202607* migrations applied |
