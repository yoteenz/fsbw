# Studio World — Ownership Inventory (Future Independent Platform)

For each area: **exists independently today** · **currently shared** · **currently missing** · **currently FS-owned** · **ownership unclear**

Legend: ✅ independent · 🔗 shared · ❌ missing · 🏪 FS-owned · ❓ unclear

---

## Application shell

| Item | Today | Notes |
| --- | --- | --- |
| Dedicated SPA entry | 🔗 | `App.tsx` monolith |
| Route namespace | 🔗 | `/admin/studio*` on FS site |
| Studio debug entry | ✅ partial | `StudioDebugRoutes` — still same build |
| Error boundaries | 🔗 | `platform-stabilization` |

---

## Frontend

| Item | Today | Notes |
| --- | --- | --- |
| Studio pages/components | ✅ in-repo | Not separate deploy |
| `studio-os-core` | ✅ | FS imports subset |
| Navigation registry | ✅ | `adminStudioNavigation.ts` |
| World route registry | ✅ | `route-registry.ts` |

---

## Backend

| Item | Today | Notes |
| --- | --- | --- |
| Studio API handlers | ✅ files | 🔗 FS Vercel project |
| Generation bundle | ✅ | `studio-os-server.bundle.js` |
| Worker/cron | ✅ | Same deployment |
| Independent API domain | ❌ | |

---

## Database

| Item | Today | Notes |
| --- | --- | --- |
| `studio_*` schema | ✅ tables | 🔗 FS Supabase project |
| Dedicated Supabase project | ❌ | |
| Migration history | ✅ | In FS repo migrations |

---

## Authentication

| Item | Today | Notes |
| --- | --- | --- |
| Studio-only auth provider | ❌ | Uses FS `/sign-in` + admin role |
| `studio_os_org_memberships` | ✅ | 🔗 shared auth.users |
| Portfolio owner env gate | ✅ server | Founder email in code |
| Future Studio customer auth | ❌ | Not implemented separately |

---

## AI systems

| Item | Today | Notes |
| --- | --- | --- |
| Governed generation pipeline | ✅ | 🔗 FAL env, shared bucket |
| Genesis/narrative engines | ✅ | In core |
| Model orchestrator UI | ✅ | |
| Independent AI billing/quotas | ❌ | ❓ |

---

## Creative workflows

| Item | Today | Notes |
| --- | --- | --- |
| Experience Lab | ✅ | |
| World compiler / scene stack | ✅ | |
| CDS | ✅ | |
| Environment packages | ✅ | DB + workers |

---

## Agent systems

| Item | Today | Notes |
| --- | --- | --- |
| Unified agent runtime | ❌ partial | Spec + modules, not one service |
| Expert capture / institute | ✅ | |
| Context/DNA capsules | ✅ | Export pipelines |

---

## Project management

| Item | Today | Notes |
| --- | --- | --- |
| Work orchestration UI | ✅ demo-heavy | |
| Production pipeline UI | ✅ | |

---

## Assets

| Item | Today | Notes |
| --- | --- | --- |
| Asset registry | ✅ | DB + API |
| `public/studio-os` | ✅ | |
| Independent CDN/domain | ❌ | |

---

## Design system

| Item | Today | Notes |
| --- | --- | --- |
| `ADMIN_STUDIO_THEME` | ✅ | 🏪 FS red accent |
| Studio uppercase chrome | ✅ | |
| Separate SW design tokens file | ❌ partial | |
| docs/studio-os design-system | ✅ docs | |

---

## Content

| Item | Today | Notes |
| --- | --- | --- |
| docs/studio-os | ✅ | |
| Onboarding/DNA packs | ✅ | |
| FS brand-bible | 🏪 | Referenced in demos/generation |

---

## Infrastructure

| Item | Today | Notes |
| --- | --- | --- |
| GitHub repo | 🔗 | `fsbw` monorepo |
| Vercel project | 🔗 | FS production |
| Domain | 🔗 | FS customer domain hosts `/admin/studio` |
| Env/secrets | 🔗 | |
| CI/CD | 🔗 | |

---

## Deployment

| Item | Today | Notes |
| --- | --- | --- |
| Independent release pipeline | ❌ | |
| Studio-only preview env | ❓ | Not documented separately |

---

## Observability

| Item | Today | Notes |
| --- | --- | --- |
| Studio-specific monitoring | ❌ partial | Debug routes, immune API |
| Shared Vercel/logs | 🔗 | |
| Error tracking split | ❌ | |

---

## Security

| Item | Today | Notes |
| --- | --- | --- |
| RLS on studio tables | ✅ | Same project policies |
| Independent secrets rotation | ❌ | |
| Legal/policy surfaces | ❓ | FS site terms likely cover `/admin` |

---

## Documentation

| Item | Today | Notes |
| --- | --- | --- |
| Studio canon | ✅ | |
| Separation docs | ✅ | This audit addendum |

---

## Administration

| Item | Today | Notes |
| --- | --- | --- |
| Studio Administration (`/admin/studio-os`) | ✅ | 🔗 FS deploy |
| FS slayer admin (`/admin/dashboard`, etc.) | 🏪 | Separate from Studio World product identity |

---

## Billing & usage

| Item | Today | Notes |
| --- | --- | --- |
| Studio billing | ❌ | |
| FAL usage attribution | 🔗 | Shared keys |

---

## Testing infrastructure

| Item | Today | Notes |
| --- | --- | --- |
| Studio-specific test suite separation | ❓ | Tests in monorepo (not fully inventoried) |

---

## Backup & recovery

| Item | Today | Notes |
| --- | --- | --- |
| SW-independent backup | ❌ | Supabase project-level (shared) |

---

## Release / versioning

| Item | Today | Notes |
| --- | --- | --- |
| Studio version tags | ❌ | Ships with FS commits |
