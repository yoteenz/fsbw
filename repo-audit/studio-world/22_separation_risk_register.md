# Studio World — Separation Risk Register

Factual risks for eventual detachment. **No remediation plan.**

Likelihood: **H** high · **M** medium · **L** low (judgment based on coupling evidence)  
Impact: **H** / **M** / **L**  
**Migration blocker:** Y/N

---

| ID | Risk | Evidence | Affected systems | L | I | Blocker? |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Monolith deploy — SW cannot ship without FS | Single Vercel, `App.tsx` | All SW | H | H | **Y** |
| R2 | Auth loss for HQ — Studio under AdminGuard | `AdminGuard.tsx`, `adminAuth` | `/admin/studio*` | H | H | **Y** |
| R3 | Shared Supabase — data/auth coupling | One project, migrations | DB, auth, storage | H | H | **Y** |
| R4 | FS routes break if `studio-os-core` removed | `vision`, `onboarding`, `founder-intelligence` pages | FS features | M | M | **Y** for naive split |
| R5 | Broken imports after file move | Thousands cross-folder imports | UI, core, api | H | H | **Y** without map |
| R6 | Generation pipeline outage | Shared FAL env, bundle, worker | Experience Lab | H | H | **Y** |
| R7 | `live-preview` bucket contention | CODEBASE + shared storage | Assets | M | M | N short-term |
| R8 | Duplicate source of truth — workspace manifest vs DB | manifest-bundle + tables | Canonical world | M | M | N |
| R9 | User-data conflicts — same auth.users | Membership + admin | Auth | M | H | **Y** |
| R10 | RLS policy gaps after split | Policies tied to one project | Security | M | H | **Y** |
| R11 | Shared IDs — org `frontal-slayer` in seeds | genesis, manifest | Demo/runtime | M | L | N |
| R12 | Asset loss — registry URLs point to old bucket/project | `studio_asset_registry_*` | Assets | M | H | **Y** if migrate wrong |
| R13 | Env var collisions | Single `.env` on Vercel | API | H | M | **Y** |
| R14 | API interruption — `/api/admin/studio-*` on FS domain | Routing | Studio UI | H | H | **Y** |
| R15 | Route conflicts — `/admin/studio` vs FS admin | URL space | Both | M | M | **Y** for domain cutover |
| R16 | Domain/redirect breakage | No SW domain | Users, institute | H | M | **Y** |
| R17 | Billing/quota — FAL costs unattributed | Shared keys | Finance | M | M | N ops |
| R18 | AI credential rotation breaks one product | Shared secrets | Both | M | H | **Y** if uncoordinated |
| R19 | Data migration errors — studio_* tables | Large schema | DB | M | H | **Y** |
| R20 | Security exposure — debug routes public | `StudioDebugRoutes`, `/__studio-*` | Security | M | M | N |
| R21 | Regression — 262 pages + FS customer surface | Single test/deploy blast radius | Both | H | H | **Y** |
| R22 | Loss of FS functionality when extracting SW | FS→SW imports | FS pages | M | M | **Y** if not stubbed |
| R23 | Visual regression — shared Tailwind | Global CSS | UI | M | M | N |
| R24 | Institute invite links hard-coded to FS origin | Public URLs on current domain | Institute | M | M | **Y** at domain move |
| R25 | Hard-coded founder email in server gate | `studioWorldAdminAccess.ts` | Canonical gen | L | L | N |
| R26 | Generation parity confusion post-split | B1-Parity docs | Ops | M | M | N |
| R27 | Documentation drift — motherboard vs SW canon | `motherboard/` mixed | Agents | L | L | N |
| R28 | Cron/worker duplication or loss | `studio-generation-worker` | Jobs | M | H | **Y** |
| R29 | CDN/cache invalidation for `public/studio-os` | Static assets | Boot | L | M | N |
| R30 | Legal — `/admin` terms coverage for Studio product | **Unclear** | Compliance | L | M | **?** Founder |

---

## Blocker summary

**Migration blockers (Y):** R1–R3, R4 (naive), R5, R6, R9–R10, R12–R16, R18–R19, R21–R22, R24, R28 — **infrastructure, auth, data, deploy, and import graph**.

No prescribed fixes in this phase.
