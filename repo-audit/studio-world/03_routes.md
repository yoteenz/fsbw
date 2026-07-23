# Studio World — Routes Inventory

**Router:** `src/App.tsx` (nested under `/admin` with guards)  
**Constants:** `src/studio-os-core/application/routes.ts`, `src/studio-os-core/workspace/routes.ts`  
**Navigation registry:** `src/utils/adminStudioNavigation.ts` (~214 module entries with `live` | `demo` | `coming-soon`)  
**World resolver:** `/admin/studio/world/*` → `src/pages/admin/studio/world/page.tsx` + `src/studio-os-core/studio-world/route-registry.ts`  

**Count:** **312** unique `path="…studio…"` declarations in `App.tsx`; **262** `src/pages/admin/studio/**/page.tsx` files.

**URL prefix:** Public routes use `/admin/studio/...` (App nested paths show as `studio/...` relative to `/admin`).

---

## Route classes

| Class | Prefix | Guard | Purpose |
| --- | --- | --- | --- |
| **Organization HQ** | `/admin/studio/*` | Workspace + studio guards | Department workspaces |
| **World canonical** | `/admin/studio/world/*` | Same | Maps to legacy slugs via resolver |
| **Studio Administration** | `/admin/studio-os/*` | `StudioAdministrationGuard` (owners) | Portfolio / multi-workspace |
| **Workspace shell** | `/admin/studio-os/workspace/:id/*` | `StudioWorkspaceGuard` | Per-workspace dashboard |
| **HQ entry** | `/admin/headquarters` | Admin | Launches org HQ |
| **Public institute** | `/studio-institute/*` | Public (debug router) | Invites, interview, vault |
| **Expert capture** | `/expert-capture/*` | Session-based | Capture flows |
| **Diagnostics** | `/__studio-health`, `/__world-compiler-investigation`, `/__experience-lab-safe`, `/__studio-os-recovery`, etc. | Dev/ops | Forensics |

**Default redirect:** `/admin/studio` → `/admin/studio/command-center` (also world alias for mission control in nav registry).

**Catch-all:** `/admin/studio/:sectionId` → generic section page.

---

## Studio Administration routes (fixed set)

From `STUDIO_ADMINISTRATION_ROUTES`:

| Route | Purpose |
| --- | --- |
| `/admin/studio-os/command-center` | Portfolio command center |
| `/admin/studio-os` | Registry root |
| `/admin/studio-os/create` | Create workspace |
| `/admin/studio-os/blueprints` | Blueprints |
| `/admin/studio-os/promotion-center` | Promotion |
| `/admin/studio-os/licensing` | Licensing |
| `/admin/studio-os/marketplace` | Marketplace |
| `/admin/studio-os/system-health` | System health |
| `/admin/studio-os/global-ai` | Global AI |
| `/admin/studio-os/cross-org-intelligence` | Cross-org intelligence |
| `/admin/studio-os/plugins` | Plugins |
| `/admin/studio-os/developer-center` | Developer center |
| `/admin/studio-os/portfolio-analytics` | Analytics |
| `/admin/studio-os/portfolio-revenue` | Revenue |
| `/admin/studio-os/studio-settings` | Settings |
| `/admin/studio-os/studio-updates` | Updates |
| `/admin/studio-os/studio-intelligence` | Intelligence |
| `/admin/studio-os/workspace/:workspaceId` | Workspace shell |

---

## Organization HQ — thematic route groups

Each row: **slug pattern** → `src/pages/admin/studio/<slug>/page.tsx` (lazy in `App.tsx`).

| Theme | Example slugs | Connected systems |
| --- | --- | --- |
| **Command / overview** | `command-center`, `overview`, `mission-control`, `executive-command-center`, `hub` | Mission control, studio orb, immersion |
| **Genesis** | `genesis`, `experience-engine`, `experience-runtime`, `narrative-intelligence`, `founder-acceptance-testing`, `live-validation-system`, `knowledge-core`, `evolution-room` | `studio-os-core/genesis/*` |
| **Experience Lab** | `experience-lab`, `experience-lab-v2`, `experience-lab-v3`, `experience-lab/test-v2`, `health`, `safe` | Experience Lab runtime, world compiler |
| **Creative / content** | `creative-director`, `content-brain`, `content-packs`, `show-bible`, `shows`, `prompt-library`, `prompt-registry`, `ai-studio`, `ai-orchestrator`, `ai-production-engine` | Content pipeline UI |
| **CDS / companies** | `companies`, `companies/:slug/grand-atrium`, `companies/:slug/creative-direction`, `companies/:slug/creative-direction/story-table`, `ndxbook/*` | CDS components |
| **World / atlas** | `world/*`, `world-builder`, `world-v3`, `world-atlas`, `atlas`, `world-knowledge-engine` | Route registry, atlas UI |
| **Production / assets** | `production`, `production-studio`, `studio-production`, `asset-library`, `asset-registry`, `render-queue`, `studio-lot`, `talent-agency`, `casting` | Asset registry APIs |
| **Distribution** | `distribution-network`, `publishing-queue`, `social-accounts`, `analytics`, `audience-brain` | Social publishing tables |
| **Platform registries** | `system-registry`, `component-registry`, `knowledge-registry`, `documentation-registry`, `documentation-governance`, `context-capsule`, `model-orchestrator`, `studio-foundation-models`, `policy-engine`, `permission-engine`, `event-bus`, `workflow-engine`, `workspace-runtime`, `plugin-sdk` | Registry modules |
| **Governance / org** | `governance`, `headquarters-principles`, `organizational-*`, `chief-*-officer`, `executive-*` | Governance specs (M212 docs; UI at governance routes) |
| **QA / immune** | `qa-headquarters`, `qa-inspector`, `self-healing-engine`, `regression-engine`, `release-readiness`, `visual-diff-engine`, `vision-engine` | QA tooling UI |
| **Institute** | `institute`, `studio-institute`, `knowledge-hub`, `memory-bible` | Institute admin |
| **Legacy / archives** | `archives/*`, `legacy-system`, `studio-museum`, `studio-warehouse` | Legacy nav group |
| **Misc** | `tutorial-os`, `marketplace`, `studio-exchange`, `constitution-hall`, `plugin-sdk`, 100+ `*-engine` rooms | Mixed demo/live modules |

**Company nested routes:** `companies/:companySlug/*` via `CompanyRouteShell`.

---

## Module status (navigation registry)

`ADMIN_STUDIO_MODULES` assigns each listed module:

- **`live`** — e.g. genesis, headquarters-principles, several governance modules  
- **`demo`** — e.g. mission-control, many production/distribution cards  
- **`coming-soon`** — present in type system; grep shows majority demo/live mix  

Status is **UI metadata only**; routes still mount if declared in `App.tsx`.

**Studio World admin-only modules:** `studioWorldAdminOnly: true` hides from non–Studio World admins (`isStudioWorldAdmin`).

---

## Entry points

| Entry | File |
| --- | --- |
| SPA boot | `src/main.tsx` |
| Route split | `src/entry-dispatch` |
| Full app | `src/App.tsx` |
| Debug subset | `src/routes/StudioDebugRoutes.tsx` |
| Studio page default | `src/pages/admin/studio/page.tsx` |
| Lazy loading | `lazyWithRetry` imports throughout `App.tsx` |
| Suspense | `StudioRouteSuspenseFallback`, `StudioBootGate` |

---

## Unused / alias / legacy (observed)

| Pattern | Notes |
| --- | --- |
| `/admin/studio/world/atlas` | Redirect/alias patterns in registry vs `world-atlas` |
| `/admin/studio/mission-control` | Redirect toward command-center / world paths in docs |
| `/admin/studio/hub` | Legacy hub |
| `/admin/studio/:sectionId` | Placeholder section shell |
| Duplicate Experience Lab paths | v1, v2, v3, test-v2 coexist |
| `legacy` nav group | Archives, museum, warehouse |

No automated “dead route” deletion performed in this audit; some routes may be reachable only via direct URL or registry, not primary nav.

---

## Full path list

312 relative paths under `/admin` extracted from `App.tsx` (inventory snapshot). Representative prefix: `studio/<slug>`. For machine-readable enumeration, re-run:

`rg -o 'path="[^"]*studio[^"]*"' src/App.tsx | sort -u`
